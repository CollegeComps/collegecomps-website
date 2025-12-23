import { NextRequest, NextResponse } from 'next/server';
import { getCollegeDb } from '@/lib/db-helper';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const degreeLevel = searchParams.get('degreeLevel'); // '', 'associates' | 'bachelors' | 'masters' | 'doctorate' | 'certificate'

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
    
    // Conservative synonyms: only morphological/phrase variants to avoid broad mismatches
    const synonyms: Record<string, string[]> = {
      // Business/Finance
      'finance': ['financial'],
      'accounting': ['accountancy'],
      'economics': ['economic'],
      'business': ['business administration', 'management'],
      'marketing': ['marketing management'],
      // STEM
      'cs': ['computer science'],
      'comp': ['computer', 'computer science'],
      'computing': ['computer'],
      'computer': ['computing'],
      'biology': ['biological'],
      'psychology': ['psych'],
      'psych': ['psychology'],
      'engineering': ['engineer'],
      // Health
      'nursing': ['nurse']
    };
    
    // For each term, build a group of LIKE conditions including its synonyms
    const termGroups = searchTerms.map((term) => {
      const alts = [term, ...(synonyms[term] || [])];
      const groupConds = alts.map(() => `LOWER(p.cip_title) LIKE ?`).join(' OR ');
      const groupParams = alts.map(a => `%${a}%`);
      return { groupConds: `(${groupConds})`, groupParams };
    });
    
    // Combine groups with AND: every term (or one of its synonyms) must match
    const conditions = termGroups.map(g => g.groupConds).join(' AND ');
    const params = termGroups.flatMap(g => g.groupParams);

    let credentialFilter = '';
    if (degreeLevel === 'associates') {
      credentialFilter = 'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (4))';
    } else if (degreeLevel === 'bachelors') {
      credentialFilter = 'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (22, 31))';
    } else if (degreeLevel === 'masters') {
      credentialFilter = 'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (7, 23))';
    } else if (degreeLevel === 'doctorate') {
      credentialFilter = 'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (8, 9, 24, 33))';
    } else if (degreeLevel === 'certificate') {
      credentialFilter = 'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (30, 32))';  // Occupational certificates only
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
    const uniquePrograms = new Map<string, any>();
    programs.forEach((p: any) => {
      if (!uniquePrograms.has(p.cipcode)) {
        uniquePrograms.set(p.cipcode, p);
      }
    });
    programs = Array.from(uniquePrograms.values());

    return NextResponse.json({ 
      programs: programs.map((p: any) => ({
        ...p,
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
