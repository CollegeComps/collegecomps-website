import { NextRequest, NextResponse } from 'next/server';
import { getCollegeDb } from '@/lib/db-helper';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const degreeLevel = searchParams.get('degreeLevel'); // 'bachelors' | 'masters'

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
    // Supports partial word matching (e.g., "computer sc" matches "computer science")
    
    let programs: any[] = [];
    
    // Split query into individual search terms
    const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);
    
    // Build WHERE clause with partial matching - each term must appear somewhere
    // This allows "computer sc" to match "computer science"
    const conditions = searchTerms.map(() => `LOWER(p.cip_title) LIKE ?`).join(' AND ');
    const params = searchTerms.map(term => `%${term}%`);

    let credentialFilter = '';
    if (degreeLevel === 'bachelors') {
      credentialFilter = 'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (5, 22, 31))';
    } else if (degreeLevel === 'masters') {
      credentialFilter = 'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (7, 23))';
    }
    
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
      FROM programs_search_cache p
      WHERE ${conditions}
        ${credentialFilter}
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
