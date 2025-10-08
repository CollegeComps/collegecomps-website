import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

import { getUsersDb } from '@/lib/db-helper'


// GET - Fetch salary submissions (for analytics/display)
export async function GET(req: NextRequest) {
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
      years_since_graduation,
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
      is_public
    } = data

    // Required field validation
    if (!institution_name || !degree_level || !major || !graduation_year || !current_salary || years_since_graduation === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    if (graduation_year < 1950 || graduation_year > new Date().getFullYear()) {
      return NextResponse.json(
        { error: 'Invalid graduation year' },
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
    if (!company_name) qualityScore -= 10
    if (!job_title) qualityScore -= 10
    if (!industry) qualityScore -= 5
    if (!location_state) qualityScore -= 5
    if (total_compensation && total_compensation < current_salary) qualityScore -= 20 // Suspicious

    // Insert submission
    const result = await db.prepare(`
      INSERT INTO salary_submissions (
        user_id, institution_name, degree_level, major, graduation_year,
        current_salary, years_since_graduation, total_compensation,
        job_title, company_name, industry, company_size,
        location_city, location_state, remote_status,
        student_debt_remaining, student_debt_original,
        is_public, data_quality_score, is_approved, moderation_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      parseInt(session.user.id),
      institution_name,
      degree_level,
      major,
      graduation_year,
      current_salary,
      years_since_graduation,
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
      qualityScore >= 70 ? 'approved' : 'pending'
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
      submission_id: result.lastInsertRowid,
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
