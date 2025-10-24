import { NextRequest, NextResponse } from 'next/server';
import { Scholarship, ScholarshipMatch } from '@/types/scholarship';
import { createClient } from '@libsql/client';

// Initialize Turso client
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function POST(request: NextRequest) {
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

      // Check major compatibility
      const majorCategories = getMajorCategories(major);
      const scholarshipMajor = scholarship.major_category || 'any';
      
      if (scholarshipMajor === 'any') {
        matchScore += 15;
        matchReasons.push('Open to all majors');
      } else if (majorCategories.some(cat => scholarshipMajor.toLowerCase().includes(cat.toLowerCase()))) {
        matchScore += 40;
        matchReasons.push(`Perfect match for ${scholarshipMajor}`);
      } else {
        // Partial match - still show but lower score
        matchScore += 5;
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

    // Increased from 15 to 25 to show more scholarship opportunities
    return matches.slice(0, 25);

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
    majorLower.includes('data science')
  ) {
    categories.push('Computer Science', 'STEM');
  } else if (
    majorLower.includes('engineering') ||
    majorLower.includes('mechanical') ||
    majorLower.includes('electrical')
  ) {
    categories.push('Engineering', 'STEM');
  } else if (
    majorLower.includes('biology') ||
    majorLower.includes('chemistry') ||
    majorLower.includes('physics') ||
    majorLower.includes('math')
  ) {
    categories.push('STEM');
  } else if (
    majorLower.includes('nursing') ||
    majorLower.includes('medicine') ||
    majorLower.includes('health')
  ) {
    categories.push('Health', 'Nursing', 'Medicine');
  } else if (
    majorLower.includes('business') ||
    majorLower.includes('finance') ||
    majorLower.includes('accounting') ||
    majorLower.includes('economics')
  ) {
    categories.push('Business', 'Economics', 'Finance');
  }

  // If no specific category matched, add 'ALL'
  if (categories.length === 0) {
    categories.push('ALL');
  }

  return categories;
}
