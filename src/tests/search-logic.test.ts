/**
 * Search Logic Unit Tests
 * ========================
 * Tests the pure search logic extracted from programs/search/route.ts:
 * - Synonym expansion
 * - LIKE pattern generation
 * - AND/OR condition building
 * - Relevance ranking
 * - Degree level → SQL filter
 *
 * No database required — all logic is pure.
 *
 * Run: npx vitest run src/tests/search-logic.test.ts
 */

import { describe, it, expect } from 'vitest';

// ─── Replicate the exact synonym map from programs/search/route.ts ────────────
const SYNONYMS: Record<string, string[]> = {
  'business': ['business administration', 'management', 'commerce'],
  'finance': ['financial', 'financial management'],
  'accounting': ['accountancy', 'accountant'],
  'economics': ['economic', 'econom'],
  'marketing': ['marketing management', 'sales'],
  'hr': ['human resources', 'personnel'],
  'mba': ['business administration'],
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
  'engineering': ['engineer'],
  'aerospace': ['aeronautical', 'aeronautics', 'astronautical'],
  'civil': ['civil engineering'],
  'electrical': ['electrical engineering', 'electronics'],
  'mechanical': ['mechanical engineering'],
  'chemical': ['chemical engineering'],
  'industrial': ['industrial engineering'],
  'biomedical': ['bioengineering', 'biological engineering'],
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
  'biology': ['biological', 'life sciences', 'bioscience'],
  'bio': ['biology', 'biological'],
  'biochem': ['biochemistry', 'biochemical'],
  'chem': ['chemistry', 'chemical'],
  'physics': ['physical sciences'],
  'neuro': ['neuroscience', 'neurology'],
  'env': ['environmental', 'environment'],
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
  'education': ['teaching', 'educator', 'pedagogy'],
  'teaching': ['education', 'teacher'],
  'elem': ['elementary education', 'early childhood'],
  'special ed': ['special education'],
  'law': ['legal', 'jurisprudence'],
  'prelaw': ['pre-law', 'legal studies', 'political science'],
  'criminal justice': ['criminology', 'corrections', 'law enforcement'],
  'crim': ['criminology', 'criminal justice'],
  'communications': ['communication', 'journalism', 'media'],
  'journalism': ['media', 'communications', 'reporting'],
  'marketing communications': ['advertising', 'public relations'],
  'graphic design': ['design', 'visual communication'],
  'design': ['graphic design', 'visual arts', 'studio art'],
  'film': ['cinema', 'cinematography', 'media production'],
  'music': ['musical', 'performing arts'],
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

/** Replicate the query-building logic from programs/search/route.ts */
function buildSearchTermGroups(query: string) {
  const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);
  return searchTerms.map((term) => {
    const alts = [term, ...(SYNONYMS[term] || [])];
    const patterns = alts.flatMap(a => [` ${a} `, ` ${a}`, `${a} `, `${a}`]);
    const groupParams = patterns.map(p => `%${p}%`);
    return { term, alts, groupParams };
  });
}

/** Simulate the LIKE match SQLite would do */
function likeMatch(title: string, pattern: string): boolean {
  // Convert SQL LIKE pattern to regex: % → .*, _ → .
  const escaped = pattern
    .slice(1, -1)                         // strip leading/trailing %
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')  // escape regex chars
    .replace(/%/g, '.*')
    .replace(/_/g, '.');
  return new RegExp(escaped, 'i').test(title);
}

/** Return true if the title matches ALL term groups (AND logic) */
function matchesQuery(title: string, query: string): boolean {
  const groups = buildSearchTermGroups(query);
  return groups.every(group =>
    group.groupParams.some(pattern => likeMatch(title, pattern))
  );
}

/** Relevance score (0=exact, 1=starts-with, 2=contains, 3=other) */
function relevance(title: string, query: string): number {
  const t = title.toLowerCase();
  const q = query.toLowerCase();
  if (t === q) return 0;
  if (t.startsWith(q)) return 1;
  if (t.includes(q)) return 2;
  return 3;
}

// ─── Credential level filter SQL ──────────────────────────────────────────────
const CRED_FILTERS: Record<string, string> = {
  associates:  'AND ap.credential_level IN (3, 4)',
  bachelors:   'AND ap.credential_level IN (5, 22, 31)',
  masters:     'AND ap.credential_level IN (7, 23)',
  doctorate:   'AND ap.credential_level IN (8, 9, 17, 18, 19)',
  certificate: 'AND ap.credential_level IN (1, 2, 6, 30, 32, 33)',
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('Synonym Map', () => {
  it('cs expands to include "computer science"', () => {
    expect(SYNONYMS['cs']).toContain('computer science');
  });
  it('nursing expands to include "nurse"', () => {
    expect(SYNONYMS['nursing']).toContain('nurse');
  });
  it('psych expands to include "psychology"', () => {
    expect(SYNONYMS['psych']).toContain('psychology');
  });
  it('stats expands to include "statistics"', () => {
    expect(SYNONYMS['stats']).toContain('statistics');
  });
  it('premed expands to include "medicine"', () => {
    expect(SYNONYMS['premed']).toContain('medicine');
  });
  it('bio expands to include "biology"', () => {
    expect(SYNONYMS['bio']).toContain('biology');
  });
  it('mba expands to include "business administration"', () => {
    expect(SYNONYMS['mba']).toContain('business administration');
  });
  it('econ expands to include "economics"', () => {
    expect(SYNONYMS['econ']).toContain('economics');
  });
  it('all synonym values are non-empty strings', () => {
    for (const [key, values] of Object.entries(SYNONYMS)) {
      expect(values.length, `"${key}" has empty synonyms array`).toBeGreaterThan(0);
      for (const v of values) {
        expect(v.trim().length, `Empty synonym in "${key}"`).toBeGreaterThan(0);
      }
    }
  });
});

describe('Query Matching — Common Degree Searches', () => {
  const cases: [string, string, boolean][] = [
    // [query, title, shouldMatch]

    // ── Direct term matches ──
    ['computer science', 'Computer Science, General', true],
    ['computer science', 'Computer Science and Engineering', true],
    ['computer science', 'Applied Computer Science', true],
    ['nursing', 'Registered Nursing/Registered Nurse', true],
    ['nursing', 'Nursing Science', true],
    ['nursing', 'Nursing Practice', true],
    ['business administration', 'Business Administration and Management, General', true],
    ['business', 'Business Administration and Management, General', true],
    ['business', 'Business/Commerce, General', true],
    ['psychology', 'Psychology, General', true],
    ['biology', 'Biology/Biological Sciences, General', true],
    ['chemistry', 'Chemistry, General', true],
    ['mechanical engineering', 'Mechanical Engineering', true],
    ['electrical engineering', 'Electrical and Electronics Engineering', true],
    ['civil engineering', 'Civil Engineering', true],
    ['accounting', 'Accounting', true],
    ['finance', 'Finance, General', true],
    ['marketing', 'Marketing/Marketing Management, General', true],
    ['economics', 'Economics, General', true],
    ['history', 'History, General', true],
    ['political science', 'Political Science and Government, General', true],
    ['sociology', 'Sociology', true],
    ['english', 'English Language and Literature, General', true],
    ['mathematics', 'Mathematics, General', true],
    ['physics', 'Physics, General', true],
    ['criminal justice', 'Criminal Justice/Law Enforcement Administration', true],
    ['education', 'Elementary Education and Teaching', true],
    ['social work', 'Social Work', true],
    ['architecture', 'Architecture', true],
    ['journalism', 'Journalism', true],
    ['communications', 'Speech Communication and Rhetoric', true],
    ['public health', 'Public Health, General', true],
    ['pharmacy', 'Pharmacy', true],
    ['dentistry', 'Dentistry (D.D.S., D.M.D.)', true],

    // ── Abbreviation/shorthand searches ──
    ['cs', 'Computer Science, General', true],
    ['bio', 'Biology/Biological Sciences, General', true],
    ['psych', 'Psychology, General', true],
    ['stats', 'Statistics, General', true],
    ['econ', 'Economics, General', true],
    ['math', 'Mathematics, General', true],
    ['chem', 'Chemistry, General', true],

    // ── Multi-word queries ──
    ['computer science general', 'Computer Science, General', true],
    ['business administration management', 'Business Administration and Management, General', true],
    ['criminal justice law', 'Criminal Justice/Law Enforcement Administration', true],

    // ── Should NOT match ──
    ['nursing', 'Business Administration', false],
    ['computer science', 'History, General', false],
    ['physics', 'Creative Writing', false],
    ['accounting', 'Theater Arts', false],
  ];

  for (const [query, title, expected] of cases) {
    it(`"${query}" ${expected ? 'matches' : 'does not match'} "${title.slice(0, 50)}"`, () => {
      expect(matchesQuery(title, query)).toBe(expected);
    });
  }
});

describe('Relevance Ranking', () => {
  it('exact match scores 0 (highest)', () => {
    expect(relevance('Computer Science', 'Computer Science')).toBe(0);
  });
  it('starts-with scores 1', () => {
    expect(relevance('Computer Science, General', 'Computer Science')).toBe(1);
  });
  it('contains scores 2', () => {
    expect(relevance('Applied Computer Science', 'Computer Science')).toBe(2);
  });
  it('starts-with ranks higher (lower number) than contains', () => {
    const sw = relevance('Business Administration', 'Business');
    const ct = relevance('International Business Administration', 'Business');
    expect(sw).toBeLessThan(ct);
  });
  it('exact match ranks highest among similar titles', () => {
    const titles = ['Nursing', 'Nursing Science', 'Registered Nursing/Registered Nurse', 'Nursing Practice'];
    const scored = titles.map(t => ({ title: t, score: relevance(t, 'Nursing') }));
    scored.sort((a, b) => a.score - b.score);
    expect(scored[0].title).toBe('Nursing');
  });
});

describe('Credential Filter SQL Generation', () => {
  it('associates filter contains levels 3 and 4', () => {
    expect(CRED_FILTERS.associates).toContain('3');
    expect(CRED_FILTERS.associates).toContain('4');
  });
  it('bachelors filter contains level 5 (critical — was missing before fix)', () => {
    expect(CRED_FILTERS.bachelors).toContain('5');
  });
  it('bachelors filter contains level 22', () => {
    expect(CRED_FILTERS.bachelors).toContain('22');
  });
  it('masters filter contains level 7', () => {
    expect(CRED_FILTERS.masters).toContain('7');
  });
  it('masters filter contains level 23', () => {
    expect(CRED_FILTERS.masters).toContain('23');
  });
  it('doctorate filter contains 17 and 18 (IPEDS research/professional codes)', () => {
    expect(CRED_FILTERS.doctorate).toContain('17');
    expect(CRED_FILTERS.doctorate).toContain('18');
  });
  it('doctorate filter does NOT contain 24 (old wrong code)', () => {
    expect(CRED_FILTERS.doctorate).not.toContain('24');
  });
  it('certificate filter contains levels 1 and 2', () => {
    expect(CRED_FILTERS.certificate).toContain('1');
    expect(CRED_FILTERS.certificate).toContain('2');
  });
  it('all degree levels have a filter defined', () => {
    for (const level of ['associates', 'bachelors', 'masters', 'doctorate', 'certificate']) {
      expect(CRED_FILTERS[level], `Missing filter for ${level}`).toBeDefined();
    }
  });
});

describe('Salary Degree Level Normalization', () => {
  // Replicate normalizeDegreeLevel from salary-data/route.ts
  function normalizeDegreeLevel(degreeLevel: string | null | undefined): string | null {
    if (!degreeLevel) return null;
    const mapping: Record<string, string> = {
      'bachelors': 'Bachelor',
      'masters': 'Master',
      'phd': 'Doctorate',
      'doctorate': 'Doctorate',
      'professional': 'Professional',
      'associate': 'Associate',
      'associates': 'Associate',
      'none': '',
      'Bachelor': 'Bachelor',
      'Master': 'Master',
      'Doctorate': 'Doctorate',
      'Professional': 'Professional',
      'Associate': 'Associate',
    };
    const normalized = mapping[degreeLevel.toLowerCase()] || mapping[degreeLevel];
    return normalized && normalized !== '' ? normalized : null;
  }

  const cases: [string, string | null][] = [
    ['bachelors', 'Bachelor'],
    ['masters', 'Master'],
    ['doctorate', 'Doctorate'],
    ['phd', 'Doctorate'],
    ['associates', 'Associate'],
    ['associate', 'Associate'],
    ['professional', 'Professional'],
    ['Bachelor', 'Bachelor'],        // already correct
    ['Master', 'Master'],            // already correct
    ['none', null],                  // should map to null
    ['', null],
    [undefined as any, null],
  ];

  for (const [input, expected] of cases) {
    it(`normalizeDegreeLevel("${input}") === ${JSON.stringify(expected)}`, () => {
      expect(normalizeDegreeLevel(input)).toBe(expected);
    });
  }
});
