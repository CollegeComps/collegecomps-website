import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check premium status
    if (session.user.subscriptionTier !== 'premium') {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
    }

    // Open college data database
    const dbPath = path.join(process.cwd(), '..', 'college-scrapper', 'data', 'college_data.db');
    const db = new Database(dbPath, { readonly: true });

    // Query salary data with percentiles
    const salaryData = db.prepare(`
      SELECT 
        i.institution_name as institution,
        eo.program_title as major,
        eo.earnings_p25 as p25,
        eo.earnings_median as median,
        eo.earnings_p75 as p75,
        eo.count
      FROM earnings_outcomes eo
      JOIN institutions i ON eo.institution_id = i.institution_id
      WHERE eo.earnings_median IS NOT NULL 
        AND eo.earnings_p25 IS NOT NULL 
        AND eo.earnings_p75 IS NOT NULL
        AND eo.count > 10
      ORDER BY eo.earnings_median DESC
      LIMIT 100
    `).all();

    db.close();

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
