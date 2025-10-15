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
    // 1. First try FTS5 full-text search (100x faster than LIKE)
    // 2. Fallback to cached table with LIKE if FTS not available
    // 3. Uses pre-aggregated programs_search_cache table instead of scanning full academic_programs table
    
    let programs: any[] = [];
    
    try {
      // Try FTS5 search first (fastest - handles phrase and boolean searches)
      // For better matching, we'll use phrase search with quotes to require exact term matching
      const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);
      
      // Create FTS5 query: require ALL terms to be present (AND logic)
      // Use quotes for phrase matching on each term
      const ftsQuery = searchTerms.map(term => `"${term}"`).join(' ');
      
      programs = await db.prepare(`
        SELECT 
          c.cipcode,
          c.cip_title,
          c.institution_count,
          c.total_completions,
          CASE
            WHEN LOWER(c.cip_title) = LOWER(?) THEN 0
            WHEN LOWER(c.cip_title) LIKE LOWER(?) THEN 1
            WHEN LOWER(c.cip_title) LIKE LOWER(?) THEN 2
            ELSE 3
          END as relevance
        FROM programs_fts f
        JOIN programs_search_cache c ON f.cipcode = c.cipcode
        WHERE programs_fts MATCH ?
        GROUP BY c.cipcode
        ORDER BY relevance ASC, c.total_completions DESC
        LIMIT 50
      `).all(query, query, `${query}%`, ftsQuery);
      
    } catch (ftsError) {
      // FTS5 not available - use improved LIKE search
      console.log('FTS search not available, using cache table fallback');
      
      const searchTerms = query.toLowerCase().trim().split(/\s+/);
      
      // Build WHERE clause to match ALL search terms
      const conditions = searchTerms.map(() => `cip_title_lower LIKE ?`).join(' AND ');
      const params = searchTerms.map(term => `%${term}%`);
      
      programs = await db.prepare(`
        SELECT 
          cipcode,
          MAX(cip_title) as cip_title,
          SUM(institution_count) as institution_count,
          SUM(total_completions) as total_completions
        FROM programs_search_cache
        WHERE ${conditions}
        GROUP BY cipcode
        ORDER BY 
          CASE
            WHEN LOWER(MAX(cip_title)) = ? THEN 0
            WHEN LOWER(MAX(cip_title)) LIKE ? THEN 1
            ELSE 2
          END,
          SUM(total_completions) DESC
        LIMIT 50
      `).all(...params, query.toLowerCase(), `${query.toLowerCase()}%`);
    }
    
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
