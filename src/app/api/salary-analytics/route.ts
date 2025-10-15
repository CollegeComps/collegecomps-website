import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCollegeDb } from '@/lib/db-helper';
import { requireTier } from '@/lib/auth-helpers';

// Salary Analytics - PREMIUM FEATURE
export async function GET(req: NextRequest) {
  // Verify authentication and premium subscription
  const session = await auth();
  const tierError = requireTier(session, 'premium');
  if (tierError) return tierError;

  const db = getCollegeDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    // Query salary data with available earnings data
    // Note: earnings_outcomes table has earnings_6_years_after_entry and earnings_10_years_after_entry
    const salaryData = await db.prepare(`
      SELECT 
        i.name as institution,
        eo.earnings_6_years_after_entry as earnings_6yr,
        eo.earnings_10_years_after_entry as earnings_10yr,
        eo.median_debt,
        eo.completion_rate,
        eo.student_count
      FROM earnings_outcomes eo
      JOIN institutions i ON eo.unitid = i.unitid
      WHERE (eo.earnings_6_years_after_entry IS NOT NULL OR eo.earnings_10_years_after_entry IS NOT NULL)
        AND eo.student_count > 10
      ORDER BY COALESCE(eo.earnings_10_years_after_entry, eo.earnings_6_years_after_entry) DESC
      LIMIT 100
    `).all();

    return NextResponse.json({
      analytics: salaryData,
      message: 'Salary analytics retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching salary analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch salary analytics' },
      { status: 500 }
    );
  }
}
