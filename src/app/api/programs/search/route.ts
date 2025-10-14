import { NextRequest, NextResponse } from 'next/server';
import { getCollegeDb } from '@/lib/db-helper';
import { getStatesInClause } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ programs: [] });
    }

    const db = getCollegeDb();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 500 }
      );
    }

    const { clause: statesClause, params: stateParams } = getStatesInClause();
    
    // Search for programs by title or CIP code
    // Group by CIP code to avoid duplicates across institutions
    // Only include programs from institutions in valid states
    const programs = await db.prepare(`
      SELECT 
        ap.cipcode,
        ap.cip_title,
        COUNT(DISTINCT ap.unitid) as institution_count,
        SUM(ap.total_completions) as total_completions
      FROM academic_programs ap
      INNER JOIN institutions i ON ap.unitid = i.unitid
      WHERE (
        LOWER(ap.cip_title) LIKE ? 
        OR LOWER(ap.cipcode) LIKE ?
      )
      AND ${statesClause}
      GROUP BY ap.cipcode, ap.cip_title
      ORDER BY total_completions DESC
      LIMIT 50
    `).all(`%${query.toLowerCase()}%`, `%${query.toLowerCase()}%`, ...stateParams);

    return NextResponse.json({ 
      programs: programs.map((p: any) => ({
        ...p,
        // Add a unique ID for React keys
        id: `${p.cipcode}`
      }))
    });
  } catch (error) {
    console.error('Error searching programs:', error);
    return NextResponse.json(
      { error: 'Failed to search programs' },
      { status: 500 }
    );
  }
}
