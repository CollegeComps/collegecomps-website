import { NextRequest, NextResponse } from 'next/server';
import { getCollegeDb } from '@/lib/db-helper';

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
    
    // Search for programs by title or CIP code
    // Group by CIP code to avoid duplicates across institutions
    const programs = await db.prepare(`
      SELECT 
        cipcode,
        cip_title,
        COUNT(DISTINCT unitid) as institution_count,
        SUM(total_completions) as total_completions
      FROM academic_programs
      WHERE (
        LOWER(cip_title) LIKE ? 
        OR LOWER(cipcode) LIKE ?
      )
      GROUP BY cipcode, cip_title
      ORDER BY total_completions DESC
      LIMIT 50
    `).all(`%${query.toLowerCase()}%`, `%${query.toLowerCase()}%`);

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
