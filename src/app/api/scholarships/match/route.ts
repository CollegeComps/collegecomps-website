import { NextRequest, NextResponse } from 'next/server';
import { Scholarship, ScholarshipMatch } from '@/types/scholarship';

// Sample scholarship data - in production this would come from database
const SCHOLARSHIPS: Scholarship[] = [
  {
    id: 1,
    name: 'STEM Excellence Scholarship',
    provider: 'National STEM Foundation',
    amount_min: 5000,
    amount_max: 10000,
    gpa_requirement: 3.5,
    major_categories: ['STEM', 'Engineering', 'Computer Science'],
    eligible_states: ['ALL'],
    deadline: '2026-03-15',
    website_url: 'https://example.com/stem-scholarship',
    description: 'Annual scholarship for students pursuing STEM degrees with strong academic performance.',
  },
  {
    id: 2,
    name: 'California Dream Scholarship',
    provider: 'California Student Aid Commission',
    amount_min: 1000,
    amount_max: 5000,
    gpa_requirement: 2.5,
    major_categories: ['ALL'],
    eligible_states: ['CA'],
    deadline: '2026-03-02',
    website_url: 'https://example.com/ca-dream',
    description: 'Supporting California students pursuing higher education in any field.',
  },
  {
    id: 3,
    name: 'Future Engineers Grant',
    provider: 'American Engineering Society',
    amount_min: 10000,
    amount_max: 15000,
    gpa_requirement: 3.7,
    major_categories: ['Engineering', 'STEM'],
    eligible_states: ['ALL'],
    deadline: '2026-02-01',
    website_url: 'https://example.com/future-engineers',
    description: 'Highly competitive scholarship for exceptional engineering students.',
  },
  {
    id: 4,
    name: 'Health Professions Scholarship',
    provider: 'National Health Foundation',
    amount_min: 5000,
    amount_max: 7500,
    gpa_requirement: 3.3,
    major_categories: ['Health', 'Nursing', 'Medicine'],
    eligible_states: ['ALL'],
    deadline: '2026-04-15',
    website_url: 'https://example.com/health-scholarship',
    description: 'For students committed to careers in healthcare and medical fields.',
  },
  {
    id: 5,
    name: 'Business Leaders of Tomorrow',
    provider: 'National Business Education Alliance',
    amount_min: 3000,
    amount_max: 8000,
    gpa_requirement: 3.0,
    major_categories: ['Business', 'Economics', 'Finance'],
    eligible_states: ['ALL'],
    deadline: '2026-03-31',
    website_url: 'https://example.com/business-leaders',
    description: 'Supporting the next generation of business leaders and entrepreneurs.',
  },
  {
    id: 6,
    name: 'Community College Transfer Scholarship',
    provider: 'Jack Kent Cooke Foundation',
    amount_min: 30000,
    amount_max: 40000,
    gpa_requirement: 3.5,
    major_categories: ['ALL'],
    eligible_states: ['ALL'],
    deadline: '2026-01-15',
    website_url: 'https://example.com/transfer-scholarship',
    description: 'Prestigious scholarship for community college students transferring to 4-year institutions.',
  },
];

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

    // Log scholarship lead (in production, save to database)
    console.log('Scholarship Lead:', {
      full_name,
      email,
      phone,
      gpa,
      desired_major,
      state,
      timestamp: new Date().toISOString(),
    });

    // Find matching scholarships
    const matches = findMatches(gpa, desired_major, state);

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

function findMatches(
  gpa: number,
  major: string,
  state: string
): ScholarshipMatch[] {
  const matches: ScholarshipMatch[] = [];

  for (const scholarship of SCHOLARSHIPS) {
    let matchScore = 0;
    const matchReasons: string[] = [];

    // Check GPA requirement
    if (gpa >= scholarship.gpa_requirement) {
      matchScore += 40;
      matchReasons.push(`Meets GPA requirement (${scholarship.gpa_requirement})`);
    } else {
      // If GPA doesn't meet requirement, skip this scholarship
      continue;
    }

    // Check major compatibility
    const majorCategories = getMajorCategories(major);
    const majorMatches = majorCategories.some(
      (cat) =>
        scholarship.major_categories.includes(cat) ||
        scholarship.major_categories.includes('ALL')
    );

    if (majorMatches) {
      matchScore += 30;
      matchReasons.push('Matches your field of study');
    } else if (!scholarship.major_categories.includes('ALL')) {
      // If major doesn't match and scholarship is major-specific, reduce score
      matchScore -= 20;
    }

    // Check state eligibility
    if (
      scholarship.eligible_states.includes(state) ||
      scholarship.eligible_states.includes('ALL')
    ) {
      matchScore += 30;
      if (scholarship.eligible_states.includes(state) && state !== 'ALL') {
        matchReasons.push(`Available in ${state}`);
      }
    }

    // Bonus points for higher award amounts
    if (scholarship.amount_max >= 10000) {
      matchScore += 10;
      matchReasons.push('High award amount');
    }

    // Only include scholarships with positive match score
    if (matchScore > 0) {
      matches.push({
        scholarship,
        match_score: Math.min(100, Math.max(0, matchScore)),
        match_reasons: matchReasons,
      });
    }
  }

  // Sort by match score (highest first)
  matches.sort((a, b) => b.match_score - a.match_score);

  return matches;
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
