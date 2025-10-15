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
    
    // OPTIMIZED SEARCH STRATEGY:
    // Use LIKE-based search for accurate, predictable results
    // FTS5 was returning irrelevant results due to tokenization issues
    
    let programs: any[] = [];
    
    // Split query into individual search terms
    const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);
    
    // Build WHERE clause to match ALL search terms in the title
    const conditions = searchTerms.map(() => `LOWER(cip_title) LIKE ?`).join(' AND ');
    const params = searchTerms.map(term => `%${term}%`);
    
    programs = await db.prepare(`
      SELECT 
        cipcode,
        cip_title,
        institution_count,
        total_completions,
        CASE
          WHEN LOWER(cip_title) = LOWER(?) THEN 0
          WHEN LOWER(cip_title) LIKE LOWER(?) THEN 1
          WHEN LOWER(cip_title) LIKE LOWER(?) THEN 2
          ELSE 3
        END as relevance
      FROM programs_search_cache
      WHERE ${conditions}
      GROUP BY cipcode
      ORDER BY relevance ASC, total_completions DESC
      LIMIT 50
    `).all(...params, query, query, `${query}%`);
    
    // Remove duplicates by cipcode (in case of data inconsistencies)
    const uniquePrograms = new Map();
    programs.forEach((p: any) => {
      if (!uniquePrograms.has(p.cipcode)) {
        uniquePrograms.set(p.cipcode, p);
      }
    });
    programs = Array.from(uniquePrograms.values());

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
