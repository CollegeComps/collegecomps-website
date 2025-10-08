import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUsersDb, getCollegeDb } from '@/lib/db-helper';

interface UserProfile {
  gpa?: number;
  sat?: number;
  act?: number;
  budget?: number;
  location_preference?: string;
  program_interest?: string;
  career_goals?: string;
}

interface SchoolScore {
  id: string;
  name: string;
  score: number;
  matchReasons: string[];
  admissionChance: 'High' | 'Moderate' | 'Reach';
  estimatedCost: number;
  avgSalary: number;
  roi: number;
}

export async function GET(req: NextRequest) {
  const userDb = getUsersDb();
  const collegeDb = getCollegeDb();
  
  if (!userDb || !collegeDb) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has Excel (Professional) tier
    if (session.user.subscriptionTier !== 'professional' && session.user.subscriptionTier !== 'premium') {
      return NextResponse.json(
        { error: 'AI Recommendations require Excel or higher tier. Upgrade to access AI-powered features.' },
        { status: 403 }
      );
    }

    // Get user profile data
    const profile = await userDb.prepare(`
      SELECT gpa, sat, act, budget, location_preference, program_interest, career_goals
      FROM user_profiles
      WHERE user_id = ?
    `).get(parseInt(session.user.id)) as UserProfile | undefined;

    if (!profile) {
      return NextResponse.json(
        { error: 'Please complete your profile first to get personalized recommendations' },
        { status: 400 }
      );
    }

    // Get college data with available fields
    const colleges = await collegeDb.prepare(`
      SELECT 
        i.unitid as id,
        i.name,
        i.state,
        i.control_public_private as control,
        (COALESCE(f.tuition_out_state, f.tuition_in_state, 0) + COALESCE(f.fees, 0) + COALESCE(f.room_board_on_campus, 0)) as cost,
        im.total_enrollment as enrollment,
        im.url as website
      FROM institutions i
      LEFT JOIN financial_data f ON i.unitid = f.unitid
      LEFT JOIN institution_metadata im ON i.unitid = im.unitid
      WHERE (f.tuition_in_state IS NOT NULL OR f.tuition_out_state IS NOT NULL)
        AND i.name IS NOT NULL
      GROUP BY i.unitid
      ORDER BY RANDOM()
      LIMIT 500
    `).all() as any[];

    // Calculate match scores
    const recommendations: SchoolScore[] = colleges.map(college => {
      let score = 0;
      const matchReasons: string[] = [];

      // Financial match (60% of score) - Most important with available data
      if (profile.budget && college.cost) {
        const costDiff = college.cost - profile.budget;
        if (costDiff <= 0) {
          score += 60;
          matchReasons.push('Within budget');
        } else if (costDiff < 5000) {
          score += 45;
          matchReasons.push('Close to budget');
        } else if (costDiff < 10000) {
          score += 30;
          matchReasons.push('Slightly above budget');
        } else if (costDiff < 15000) {
          score += 15;
          matchReasons.push('Above budget');
        }
      }

      // Location match (25% of score)
      if (profile.location_preference && college.state) {
        if (college.state.toLowerCase() === profile.location_preference.toLowerCase()) {
          score += 25;
          matchReasons.push('Preferred location');
        }
      }

      // School type match (15% of score)
      if (college.control) {
        if (college.control === 1) { // Public
          score += 10;
          matchReasons.push('Public institution');
        } else if (college.control === 2) { // Private non-profit
          score += 12;
          matchReasons.push('Private institution');
        }
      }

      // Determine admission chance based on cost (simplified without SAT/ACT data)
      let admissionChance: 'High' | 'Moderate' | 'Reach' = 'Moderate';
      if (college.cost && profile.budget) {
        const affordabilityRatio = profile.budget / college.cost;
        if (affordabilityRatio >= 1.2) {
          admissionChance = 'High';
          matchReasons.push('Highly affordable');
        } else if (affordabilityRatio >= 0.8) {
          admissionChance = 'Moderate';
        } else {
          admissionChance = 'Reach';
          matchReasons.push('Financial reach');
        }
      }

      // Calculate estimated ROI (simplified without salary data)
      // Estimate: Lower cost = better ROI potential
      const estimatedSalary = 60000; // National average for college grads
      const totalCost = college.cost ? (college.cost * 4) : 0;
      const roi = totalCost > 0 ? ((estimatedSalary * 10) - totalCost) : 0;

      return {
        id: college.id,
        name: college.name,
        score,
        matchReasons,
        admissionChance,
        estimatedCost: college.cost || 0,
        avgSalary: estimatedSalary,
        roi
      };
    });

    // Sort by score and get top 20
    const topRecommendations = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    // Categorize into safety, target, reach
    const safety = topRecommendations.filter(r => r.admissionChance === 'High').slice(0, 5);
    const target = topRecommendations.filter(r => r.admissionChance === 'Moderate').slice(0, 10);
    const reach = topRecommendations.filter(r => r.admissionChance === 'Reach').slice(0, 5);

    return NextResponse.json({
      profile: {
        gpa: profile.gpa,
        sat: profile.sat,
        act: profile.act,
        budget: profile.budget,
        location: profile.location_preference,
        interests: profile.program_interest
      },
      recommendations: {
        all: topRecommendations,
        safety,
        target,
        reach
      },
      summary: {
        totalAnalyzed: colleges.length,
        topMatches: topRecommendations.length,
        safetySchools: safety.length,
        targetSchools: target.length,
        reachSchools: reach.length
      }
    });

  } catch (error) {
    console.error('AI Recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
