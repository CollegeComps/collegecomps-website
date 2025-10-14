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
      // Escape special FTS5 characters and prepare query
      const ftsQuery = query.replace(/[^\w\s]/g, '').trim();
      
      programs = await db.prepare(`
        SELECT 
          c.cipcode,
          c.cip_title,
          c.institution_count,
          c.total_completions
        FROM programs_fts f
        JOIN programs_search_cache c ON f.cipcode = c.cipcode
        WHERE programs_fts MATCH ?
        ORDER BY c.total_completions DESC
        LIMIT 50
      `).all(ftsQuery);
      
    } catch (ftsError) {
      // FTS5 not available or query error - fallback to cache table with LIKE
      console.log('FTS search not available, using cache table fallback');
      
      programs = await db.prepare(`
        SELECT 
          cipcode,
          cip_title,
          institution_count,
          total_completions
        FROM programs_search_cache
        WHERE cip_title_lower LIKE ?
        ORDER BY total_completions DESC
        LIMIT 50
      `).all(`%${query.toLowerCase()}%`);
    }

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
