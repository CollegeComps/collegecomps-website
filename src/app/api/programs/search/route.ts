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
    // Use LIKE-based search for accurate, predictable results.
    // Supports partial word matching (e.g., "computer sc" matches "computer science").
    // Uses synonyms + substring matching to handle CIP title variations across colleges.

    let programs: any[] = [];

    // Split query into individual search terms
    const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);

    // Synonyms map: common user search terms → CIP title variants found in IPEDS data.
    // Each key is an alternative the user might type; values are what to also search for.
    const synonyms: Record<string, string[]> = {
      // Business / Finance
      'business': ['business administration', 'management', 'commerce'],
      'finance': ['financial', 'financial management'],
      'accounting': ['accountancy', 'accountant'],
      'economics': ['economic', 'econom'],
      'marketing': ['marketing management', 'sales'],
      'hr': ['human resources', 'personnel'],
      'mba': ['business administration'],
      // STEM / Computing
      'cs': ['computer science'],
      'comp': ['computer', 'computing'],
      'computing': ['computer', 'computer science'],
      'computer': ['computing', 'informatics'],
      'software': ['software engineering', 'computer software'],
      'data': ['data science', 'data analytics', 'data analysis', 'statistics'],
      'ai': ['artificial intelligence', 'machine learning'],
      'cybersecurity': ['cyber security', 'information security', 'network security'],
      'it': ['information technology', 'information systems'],
      'math': ['mathematics', 'mathematical'],
      'stats': ['statistics', 'statistical'],
      // Engineering
      'engineering': ['engineer'],
      'aerospace': ['aeronautical', 'aeronautics', 'astronautical'],
      'civil': ['civil engineering'],
      'electrical': ['electrical engineering', 'electronics'],
      'mechanical': ['mechanical engineering'],
      'chemical': ['chemical engineering'],
      'industrial': ['industrial engineering'],
      'biomedical': ['bioengineering', 'biological engineering'],
      // Health / Medicine
      'nursing': ['nurse', 'registered nurse', 'rn'],
      'premed': ['pre-medicine', 'medicine', 'pre-medical'],
      'medicine': ['medical', 'physician'],
      'pharmacy': ['pharmaceutical', 'pharmacology'],
      'physical therapy': ['physiotherapy', 'kinesiology'],
      'pt': ['physical therapy', 'physiotherapy'],
      'ot': ['occupational therapy'],
      'dentistry': ['dental', 'dentist'],
      'public health': ['health administration', 'healthcare'],
      'healthcare': ['health care', 'health sciences', 'health administration'],
      // Biology / Sciences
      'biology': ['biological', 'life sciences', 'bioscience'],
      'bio': ['biology', 'biological'],
      'biochem': ['biochemistry', 'biochemical'],
      'chem': ['chemistry', 'chemical'],
      'physics': ['physical sciences'],
      'neuro': ['neuroscience', 'neurology'],
      'env': ['environmental', 'environment'],
      // Social Sciences / Humanities
      'psychology': ['psychological', 'psych'],
      'psych': ['psychology', 'psychological'],
      'sociology': ['sociological', 'social sciences'],
      'poli sci': ['political science', 'government'],
      'polisci': ['political science', 'government', 'politics'],
      'politics': ['political science', 'government'],
      'history': ['historical', 'historic'],
      'philosophy': ['philosophical'],
      'econ': ['economics', 'economic'],
      'social work': ['social welfare', 'human services'],
      // Education
      'education': ['teaching', 'educator', 'pedagogy'],
      'teaching': ['education', 'teacher'],
      'elem': ['elementary education', 'early childhood'],
      'special ed': ['special education'],
      // Law / Criminal Justice
      'law': ['legal', 'jurisprudence'],
      'prelaw': ['pre-law', 'legal studies', 'political science'],
      'criminal justice': ['criminology', 'corrections', 'law enforcement'],
      'crim': ['criminology', 'criminal justice'],
      // Arts / Communication
      'communications': ['communication', 'journalism', 'media'],
      'journalism': ['media', 'communications', 'reporting'],
      'marketing communications': ['advertising', 'public relations'],
      'graphic design': ['design', 'visual communication'],
      'design': ['graphic design', 'visual arts', 'studio art'],
      'film': ['cinema', 'cinematography', 'media production'],
      'music': ['musical', 'performing arts'],
      // Other common terms
      'architecture': ['architectural'],
      'construction': ['construction management', 'building'],
      'real estate': ['property management'],
      'hospitality': ['hotel management', 'tourism', 'restaurant management'],
      'culinary': ['food science', 'culinary arts'],
      'agriculture': ['agricultural', 'agronomy', 'animal science'],
      'forestry': ['forest management', 'natural resources'],
      'fashion': ['apparel', 'textile'],
      'sports': ['kinesiology', 'exercise science', 'sports management'],
      'kinesiology': ['exercise science', 'physical education', 'sports'],
      'liberal arts': ['general studies', 'humanities'],
      'interdisciplinary': ['multidisciplinary', 'general studies'],
    };

    // For each search term, build a group of LIKE conditions including synonyms.
    // The OR within each group allows any synonym to satisfy the term.
    // The AND across groups requires all search terms to appear somewhere.
    const termGroups = searchTerms.map((term) => {
      const alts = [term, ...(synonyms[term] || [])];
      // Create LIKE patterns: leading/trailing space variants catch word boundaries;
      // the plain substring pattern ensures partial matches still work.
      const patterns = alts.flatMap(a => [
        ` ${a} `,   // surrounded by spaces (middle of title)
        ` ${a}`,    // preceded by space (end of title)
        `${a} `,    // followed by space (start of title)
        `${a}`,     // substring fallback (handles abbreviations and partial matches)
      ]);

      const groupConds = patterns.map(() => `LOWER(p.cip_title) LIKE ?`).join(' OR ');
      const groupParams = patterns.map(p => `%${p}%`);
      return { groupConds: `(${groupConds})`, groupParams };
    });

    // Combine groups with AND: every term (or one of its synonyms) must match
    const conditions = termGroups.map(g => g.groupConds).join(' AND ');
    const params = termGroups.flatMap(g => g.groupParams);

    // CREDENTIAL LEVEL FILTERS — canonical IPEDS + extended codes:
    //   1-2: short certificates (<1yr, 1-2yr)
    //   3:   Associate's degree
    //   4:   2-4 year postsecondary award (treated as associate's-level)
    //   5:   Bachelor's degree
    //   6:   Postbaccalaureate certificate
    //   7:   Master's degree
    //   8:   Post-master's certificate
    //   9:   Doctor's degree
    //  17:   Doctor's degree — research/scholarship
    //  18:   Doctor's degree — professional practice
    //  19:   Doctor's degree — other
    //  22:   Bachelor's degree (extended program)
    //  23:   Master's degree (extended program)
    //  30-33: Occupational/vocational certificate variants
    let credentialFilter = '';
    if (degreeLevel === 'associates') {
      credentialFilter = 'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (3, 4))';
    } else if (degreeLevel === 'bachelors') {
      credentialFilter = 'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (5, 22, 31))';
    } else if (degreeLevel === 'masters') {
      credentialFilter = 'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (7, 23))';
    } else if (degreeLevel === 'doctorate') {
      credentialFilter = 'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (8, 9, 17, 18, 19))';
    } else if (degreeLevel === 'certificate') {
      credentialFilter = 'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (1, 2, 6, 30, 32, 33))';
    }

    // Relevance ranking: exact match > starts with > contains anywhere > other match
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
    `).all(...params, query, `${query}%`, `%${query}%`);

    // If the cache search returns few results (e.g., because cache only has one title
    // per CIP code and it doesn't match), also search academic_programs directly for
    // CIP codes not already in the results. This handles CIP title variations across colleges.
    if (programs.length < 5) {
      const existingCips = new Set(programs.map((p: any) => p.cipcode));
      const fallbackConditions = termGroups
        .map(g => g.groupConds.replace(/p\.cip_title/g, 'ap.cip_title'))
        .join(' AND ');
      const fallbackParams = termGroups.flatMap(g => g.groupParams);

      let fallbackCredFilter = '';
      if (degreeLevel === 'associates') {
        fallbackCredFilter = 'AND ap.credential_level IN (3, 4)';
      } else if (degreeLevel === 'bachelors') {
        fallbackCredFilter = 'AND ap.credential_level IN (5, 22, 31)';
      } else if (degreeLevel === 'masters') {
        fallbackCredFilter = 'AND ap.credential_level IN (7, 23)';
      } else if (degreeLevel === 'doctorate') {
        fallbackCredFilter = 'AND ap.credential_level IN (8, 9, 17, 18, 19)';
      } else if (degreeLevel === 'certificate') {
        fallbackCredFilter = 'AND ap.credential_level IN (1, 2, 6, 30, 32, 33)';
      }

      const fallbackResults = await db.prepare(`
        SELECT
          ap.cipcode,
          ap.cip_title,
          COUNT(DISTINCT ap.unitid) as institution_count,
          SUM(ap.completions) as total_completions,
          2 as relevance
        FROM academic_programs ap
        WHERE ${fallbackConditions}
          ${fallbackCredFilter}
          AND ap.cip_title IS NOT NULL
          AND ap.cip_title != ''
        GROUP BY ap.cipcode, ap.cip_title
        ORDER BY total_completions DESC
        LIMIT 30
      `).all(...fallbackParams) as any[];

      // Merge fallback results, preferring cache results for existing CIP codes
      for (const row of fallbackResults) {
        if (!existingCips.has(row.cipcode)) {
          programs.push(row);
          existingCips.add(row.cipcode);
        }
      }
    }

    // Remove duplicates by cipcode (keep highest relevance / most completions)
    const uniquePrograms = new Map<string, any>();
    programs.forEach((p: any) => {
      const existing = uniquePrograms.get(p.cipcode);
      if (!existing || (p.relevance ?? 3) < (existing.relevance ?? 3)) {
        uniquePrograms.set(p.cipcode, p);
      }
    });
    programs = Array.from(uniquePrograms.values())
      .sort((a, b) => (a.relevance ?? 3) - (b.relevance ?? 3) || (b.total_completions ?? 0) - (a.total_completions ?? 0))
      .slice(0, 50);

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
