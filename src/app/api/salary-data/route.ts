import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getUsersDb } from '@/lib/db-helper'
import { requireTier } from '@/lib/auth-helpers'


// GET - Fetch salary submissions (for analytics/display) - PREMIUM FEATURE
export async function GET(req: NextRequest) {
  // Verify authentication and premium subscription
  const session = await auth();
  const tierError = requireTier(session, 'premium');
  if (tierError) return tierError;

  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(req.url)
    const major = searchParams.get('major')
    const institution = searchParams.get('institution')
    const yearsRange = searchParams.get('yearsRange') // e.g., "5" or "5-10"
    const degreeLevel = searchParams.get('degreeLevel')

    let query = `
      SELECT 
        major,
        institution_name,
        degree_level,
        years_since_graduation,
        AVG(current_salary) as avg_salary,
        AVG(total_compensation) as avg_total_comp,
        COUNT(*) as sample_size,
        MIN(current_salary) as min_salary,
        MAX(current_salary) as max_salary
      FROM salary_submissions
      WHERE is_approved = 1 AND is_public = 1
    `

    const params: any[] = []

    if (major) {
      query += ` AND major = ?`
      params.push(major)
    }

    if (institution) {
      query += ` AND institution_name = ?`
      params.push(institution)
    }

    if (degreeLevel) {
      query += ` AND degree_level = ?`
      params.push(degreeLevel)
    }

    if (yearsRange) {
      const [min, max] = yearsRange.split('-').map(Number)
      if (max) {
        query += ` AND years_since_graduation BETWEEN ? AND ?`
        params.push(min, max)
      } else {
        query += ` AND years_since_graduation = ?`
        params.push(min)
      }
    }

    query += ` GROUP BY major, institution_name, degree_level, years_since_graduation`
    query += ` HAVING sample_size >= 3` // Privacy: require at least 3 submissions
    query += ` ORDER BY years_since_graduation ASC`

    const results = await db.prepare(query).all(...params)

    return NextResponse.json({ data: results, success: true })
  } catch (error) {
    console.error('Error fetching salary data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Submit new salary data
export async function POST(req: NextRequest) {
  const db = getUsersDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Must be logged in to submit salary data' },
        { status: 401 }
      )
    }

    const data = await req.json()

    // Validation
    const {
      institution_name,
      degree_level,
      major,
      graduation_year,
      current_salary,
      total_compensation,
      job_title,
      company_name,
      industry,
      company_size,
      location_city,
      location_state,
      remote_status,
      student_debt_remaining,
      student_debt_original,
      is_public,
      has_degree = true, // Default to true for backwards compatibility
      years_experience, // Total years of work experience
      additional_degrees // JSON string of additional degrees array
    } = data

    // Calculate years_since_graduation from graduation_year
    const currentYear = new Date().getFullYear();
    const years_since_graduation = graduation_year ? currentYear - graduation_year : null;

    // Required field validation - adjusted for non-degree submissions
    if (!current_salary) {
      return NextResponse.json(
        { error: 'Current salary is required' },
        { status: 400 }
      )
    }

    // If has_degree is true, require degree-related fields
    if (has_degree && (!institution_name || !degree_level || !major || !graduation_year)) {
      return NextResponse.json(
        { error: 'Missing required degree fields. If you do not have a degree, please uncheck "I have a degree"' },
        { status: 400 }
      )
    }

    // Validate graduation year is not in the future
    if (graduation_year && graduation_year > currentYear) {
      return NextResponse.json(
        { error: `Graduation year cannot be in the future (max: ${currentYear})` },
        { status: 400 }
      )
    }

    // If no degree, require years_experience
    if (!has_degree && !years_experience) {
      return NextResponse.json(
        { error: 'Years of work experience is required for non-degree submissions' },
        { status: 400 }
      )
    }

    // Comprehensive salary validation (matching client-side)
    const salary = parseInt(current_salary)
    if (isNaN(salary)) {
      return NextResponse.json(
        { error: 'Salary must be a valid number' },
        { status: 400 }
      )
    }

    if (salary < 10000) {
      return NextResponse.json(
        { error: 'Base salary seems too low. Please verify or contact support if this is accurate.' },
        { status: 400 }
      )
    }

    if (salary > 10000000) {
      return NextResponse.json(
        { error: 'Base salary seems unusually high. Please verify or contact support if this is accurate.' },
        { status: 400 }
      )
    }

    // Total compensation validation
    if (total_compensation) {
      const totalComp = parseInt(total_compensation)
      if (isNaN(totalComp)) {
        return NextResponse.json(
          { error: 'Total compensation must be a valid number' },
          { status: 400 }
        )
      }

      if (totalComp > 0 && totalComp < salary) {
        return NextResponse.json(
          { error: 'Total compensation cannot be less than base salary.' },
          { status: 400 }
        )
      }

      if (totalComp > 20000000) {
        return NextResponse.json(
          { error: 'Total compensation seems unusually high. Please verify or contact support if this is accurate.' },
          { status: 400 }
        )
      }
    }

    // Student debt validation
    if (student_debt_original || student_debt_remaining) {
      const debtOriginal = student_debt_original ? parseInt(student_debt_original) : 0
      const debtRemaining = student_debt_remaining ? parseInt(student_debt_remaining) : 0

      if (debtOriginal < 0 || debtRemaining < 0) {
        return NextResponse.json(
          { error: 'Student debt amounts cannot be negative' },
          { status: 400 }
        )
      }

      if (debtRemaining > debtOriginal) {
        return NextResponse.json(
          { error: 'Remaining debt cannot be greater than original debt.' },
          { status: 400 }
        )
      }

      if (debtOriginal > 1000000) {
        return NextResponse.json(
          { error: 'Student debt amount seems unusually high. Please verify or contact support if this is accurate.' },
          { status: 400 }
        )
      }
    }

    // Validation for graduation year (only if has degree)
    if (has_degree && (graduation_year < 1950 || graduation_year > new Date().getFullYear())) {
      return NextResponse.json(
        { error: 'Invalid graduation year' },
        { status: 400 }
      )
    }

    // Validation for years of experience
    if (years_experience !== undefined && (years_experience < 0 || years_experience > 60)) {
      return NextResponse.json(
        { error: 'Years of experience must be between 0 and 60' },
        { status: 400 }
      )
    }

    // Check submission limits (prevent spam)
    const userStats = await db.prepare('SELECT * FROM user_submission_stats WHERE user_id = ?')
      .get(parseInt(session.user.id)) as any

    if (userStats && userStats.reputation_score < 50) {
      return NextResponse.json(
        { error: 'Account flagged for suspicious activity. Please contact support.' },
        { status: 403 }
      )
    }

    // Check daily limit for free users
    if (session.user.subscriptionTier === 'free') {
      const todaySubmissions = await db.prepare(`
        SELECT COUNT(*) as count 
        FROM salary_submissions 
        WHERE user_id = ? AND DATE(created_at) = DATE('now')
      `).get(parseInt(session.user.id)) as { count: number }

      if (todaySubmissions.count >= 3) {
        return NextResponse.json(
          { error: 'Free users limited to 3 submissions per day. Upgrade to Premium for unlimited.' },
          { status: 403 }
        )
      }
    }

    // Calculate data quality score (simple algorithm)
    let qualityScore = 100.0
    if (!has_degree) qualityScore -= 15 // Slight penalty for non-degree to encourage verification
    if (!company_name) qualityScore -= 10
    if (!job_title) qualityScore -= 10
    if (!industry) qualityScore -= 5
    if (!location_state) qualityScore -= 5
    if (total_compensation && total_compensation < current_salary) qualityScore -= 20 // Suspicious
    if (has_degree && !institution_name) qualityScore -= 15

    // Insert submission
    const result = await db.prepare(`
      INSERT INTO salary_submissions (
        user_id, institution_name, degree_level, major, graduation_year,
        current_salary, years_since_graduation, total_compensation,
        job_title, company_name, industry, company_size,
        location_city, location_state, remote_status,
        student_debt_remaining, student_debt_original,
        is_public, data_quality_score, is_approved, moderation_status,
        has_degree, years_experience, additional_degrees
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      parseInt(session.user.id),
      institution_name || null,
      degree_level || null,
      major || null,
      graduation_year || null,
      current_salary,
      years_since_graduation || null,
      total_compensation || null,
      job_title || null,
      company_name || null,
      industry || null,
      company_size || null,
      location_city || null,
      location_state || null,
      remote_status || null,
      student_debt_remaining || null,
      student_debt_original || null,
      is_public !== false ? 1 : 0,
      qualityScore,
      qualityScore >= 70 ? 1 : 0, // Auto-approve if quality score is high
      qualityScore >= 70 ? 'approved' : 'pending',
      has_degree ? 1 : 0,
      years_experience || null,
      additional_degrees || null
    )

    // Update user submission stats
    await db.prepare(`
      INSERT INTO user_submission_stats (user_id, total_submissions, verified_submissions, last_submission_date)
      VALUES (?, 1, 0, datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        total_submissions = total_submissions + 1,
        last_submission_date = datetime('now')
    `).run(parseInt(session.user.id))

    return NextResponse.json({
      success: true,
      submission_id: Number(result.lastInsertRowid),
      status: qualityScore >= 70 ? 'approved' : 'pending_review',
      message: qualityScore >= 70
        ? 'Thank you! Your submission has been approved and will help others.'
        : 'Thank you! Your submission is pending review and will be published soon.'
    }, { status: 201 })

  } catch (error) {
    console.error('Error submitting salary data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
