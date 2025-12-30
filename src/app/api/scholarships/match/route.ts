import { NextRequest, NextResponse } from 'next/server';
import { Scholarship, ScholarshipMatch } from '@/types/scholarship';
import { createClient } from '@libsql/client';

// Initialize Turso client
const turso = (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) 
  ? createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  : null;

export async function POST(request: NextRequest) {
    if (!turso) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

  try {
    const body = await request.json();
    const { full_name, email, phone, gpa, desired_major, state } = body;

    // Validate required fields
    if (!full_name || !email || !gpa || !desired_major || !state) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save student profile to database
    try {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO student_profiles 
              (email, first_name, gpa, major_interest, state, phone, opted_in_email, source, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, 1, 'scholarship_finder', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        args: [
          email,
          full_name,
          gpa,
          desired_major,
          state,
          phone || null,
        ],
      });
    } catch (dbError) {
      console.error('Error saving student profile:', dbError);
      // Continue even if profile save fails - don't block scholarship matching
    }

    // Find matching scholarships from database
    const matches = await findMatches(gpa, desired_major, state);

    return NextResponse.json({
      success: true,
      matches,
      message: `Found ${matches.length} scholarships you may be eligible for!`,
    });
  } catch (error) {
    console.error('Error processing scholarship lead:', error);
    return NextResponse.json(
      { error: 'Failed to process scholarship request' },
      { status: 500 }
    );
  }
}

async function findMatches(
  gpa: number,
  major: string,
  state: string
): Promise<ScholarshipMatch[]> {
  const matches: ScholarshipMatch[] = [];

  try {
    if (!turso) {
      return [];
    }
    // Query active scholarships from database
    const result = await turso.execute({
      sql: `SELECT * FROM scholarships WHERE active = 1 ORDER BY amount_max DESC`,
      args: [],
    });

    const scholarships = result.rows;

    for (const row of scholarships) {
      let matchScore = 0;
      const matchReasons: string[] = [];

      // Extract scholarship data
      const scholarship = {
        id: row.id as number,
        name: row.name as string,
        organization: row.organization as string,
        amount_min: row.amount_min as number | null,
        amount_max: row.amount_max as number | null,
        gpa_min: row.gpa_min as number | null,
        major_category: row.major_category as string | null,
        state_residency: row.state_residency as string | null,
        description: row.description as string | null,
        website_url: row.website_url as string | null,
        deadline: row.deadline as string | null,
      };

      // Check GPA requirement
      if (scholarship.gpa_min !== null && gpa < scholarship.gpa_min) {
        continue; // Skip if GPA doesn't meet minimum
      } else if (scholarship.gpa_min !== null) {
        matchScore += 40;
        matchReasons.push(`Meets GPA requirement (${scholarship.gpa_min})`);
      } else {
        matchScore += 20;
        matchReasons.push('No GPA requirement');
      }

      // Check major compatibility with improved matching
      const majorCategories = getMajorCategories(major);
      const scholarshipMajor = scholarship.major_category || 'any';
      
      if (scholarshipMajor === 'any' || scholarshipMajor.toLowerCase() === 'all') {
        matchScore += 15;
        matchReasons.push('Open to all majors');
      } else {
        // Check for exact or close match
        let matched = false;
        for (const userCategory of majorCategories) {
          const scholarshipMajorLower = scholarshipMajor.toLowerCase();
          const userCategoryLower = userCategory.toLowerCase();
          
          // Perfect match
          if (scholarshipMajorLower === userCategoryLower ||
              scholarshipMajorLower.includes(userCategoryLower) ||
              userCategoryLower.includes(scholarshipMajorLower)) {
            matchScore += 40;
            matchReasons.push(`Perfect match for ${scholarshipMajor}`);
            matched = true;
            break;
          }
        }
        
        // If no match but scholarship is "ANY" category, give partial points
        if (!matched && majorCategories.includes('ALL')) {
          matchScore += 10;
        } else if (!matched) {
          // Skip scholarships that don't match the user's major
          continue;
        }
      }

      // Check state residency
      const scholarshipStates = (scholarship.state_residency || 'any').split(',').map(s => s.trim());
      
      // If user selects "ANY", show all scholarships (nationwide and state-specific)
      if (state === 'ANY') {
        if (!scholarship.state_residency || scholarship.state_residency === 'any' || scholarshipStates.includes('any')) {
          matchScore += 20;
          matchReasons.push('Available nationwide');
        } else {
          matchScore += 10;
          matchReasons.push(`State-specific (${scholarshipStates.join(', ')})`);
        }
      } else {
        // User selected specific state
        if (!scholarship.state_residency || scholarship.state_residency === 'any' || scholarshipStates.includes('any')) {
          matchScore += 15;
          matchReasons.push('Available nationwide');
        } else if (scholarshipStates.includes(state)) {
          matchScore += 30;
          matchReasons.push(`Available in ${state}`);
        } else {
          // Skip if state-specific and doesn't match
          continue;
        }
      }

      // Add deadline urgency bonus
      if (scholarship.deadline) {
        const deadlineDate = new Date(scholarship.deadline);
        const today = new Date();
        const daysUntilDeadline = Math.floor((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDeadline > 0 && daysUntilDeadline < 90) {
          matchScore += 10;
          matchReasons.push(`Deadline approaching: ${scholarship.deadline}`);
        } else if (daysUntilDeadline < 0) {
          continue; // Skip expired scholarships
        }
      }

      // Only include scholarships with reasonable match score
      if (matchScore >= 20) {  // Lowered from 25 to include more matches
        matches.push({
          scholarship: {
            id: scholarship.id,
            name: scholarship.name,
            provider: scholarship.organization,
            amount_min: scholarship.amount_min || 0,
            amount_max: scholarship.amount_max || 0,
            gpa_requirement: scholarship.gpa_min || 0.0,
            major_categories: scholarship.major_category ? [scholarship.major_category] : ['ALL'],
            eligible_states: scholarship.state_residency?.split(',').map(s => s.trim()) || ['ALL'],
            deadline: scholarship.deadline || 'Rolling',
            website_url: scholarship.website_url || '#',
            description: scholarship.description || '',
          },
          match_score: matchScore,
          match_reasons: matchReasons,
        });
      }
    }

    // Sort by match score (highest first)
    matches.sort((a, b) => b.match_score - a.match_score);

    // Return top 100 matches instead of artificially limiting to 25
    // This allows users to see all qualifying scholarships
    return matches.slice(0, 100);

  } catch (error) {
    console.error('Error querying scholarships from database:', error);
    return [];
  }
}

function getMajorCategories(major: string): string[] {
  const majorLower = major.toLowerCase();
  const categories: string[] = [];

  // Map common major keywords to categories
  if (
    majorLower.includes('computer') ||
    majorLower.includes('software') ||
    majorLower.includes('data science') ||
    majorLower.includes('information technology') ||
    majorLower.includes('cybersecurity')
  ) {
    categories.push('Computer Science', 'STEM', 'Technology');
  } else if (
    majorLower.includes('engineering') ||
    majorLower.includes('mechanical') ||
    majorLower.includes('electrical') ||
    majorLower.includes('civil') ||
    majorLower.includes('aerospace')
  ) {
    categories.push('Engineering', 'STEM');
  } else if (
    majorLower.includes('biology') ||
    majorLower.includes('chemistry') ||
    majorLower.includes('physics') ||
    majorLower.includes('math') ||
    majorLower.includes('statistics')
  ) {
    categories.push('STEM', 'Science');
  } else if (
    majorLower.includes('nursing') ||
    majorLower.includes('medicine') ||
    majorLower.includes('health') ||
    majorLower.includes('pre-med')
  ) {
    categories.push('Health', 'Nursing', 'Medicine');
  } else if (
    majorLower.includes('business') ||
    majorLower.includes('management') ||
    majorLower.includes('administration')
  ) {
    categories.push('Business');
  } else if (
    majorLower.includes('marketing') ||
    majorLower.includes('advertising') ||
    majorLower.includes('communications')
  ) {
    categories.push('Marketing', 'Communications', 'Business');
  } else if (
    majorLower.includes('finance') ||
    majorLower.includes('accounting') ||
    majorLower.includes('economics')
  ) {
    categories.push('Finance', 'Economics', 'Business');
  } else if (
    majorLower.includes('education') ||
    majorLower.includes('teaching')
  ) {
    categories.push('Education');
  } else if (
    majorLower.includes('art') ||
    majorLower.includes('design') ||
    majorLower.includes('music') ||
    majorLower.includes('theater') ||
    majorLower.includes('creative')
  ) {
    categories.push('Arts', 'Creative');
  } else if (
    majorLower.includes('psychology') ||
    majorLower.includes('sociology') ||
    majorLower.includes('social work')
  ) {
    categories.push('Social Sciences', 'Psychology');
  } else if (
    majorLower.includes('law') ||
    majorLower.includes('legal') ||
    majorLower.includes('pre-law')
  ) {
    categories.push('Law', 'Legal Studies');
  }

  // Always add 'ALL' to match general scholarships
  categories.push('ALL');

  return categories;
}
