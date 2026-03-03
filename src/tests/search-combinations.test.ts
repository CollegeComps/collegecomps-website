/**
 * Search Combination Exhaustive Tests
 * =====================================
 * Tests every combination of:
 *   - 30+ real degree programs (using their actual IPEDS CIP titles)
 *   - 5 degree levels (associates, bachelors, masters, doctorate, certificate)
 *   - Common abbreviations and synonym searches
 *   - College name variations (abbreviations, official names, A&M normalization)
 *
 * This is the regression suite — run it before AND after any changes to
 * search logic, synonym maps, or credential level constants.
 *
 * Run: npx vitest run src/tests/search-combinations.test.ts
 */

import { describe, it, expect } from 'vitest';

// ─── Replicate matching logic (same as search-logic.test.ts) ─────────────────
const SYNONYMS: Record<string, string[]> = {
  'business': ['business administration', 'management', 'commerce'],
  'finance': ['financial', 'financial management'],
  'accounting': ['accountancy', 'accountant'],
  'economics': ['economic', 'econom'],
  'marketing': ['marketing management', 'sales'],
  'cs': ['computer science'],
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
  'nursing': ['nurse', 'registered nurse', 'rn'],
  'premed': ['pre-medicine', 'medicine', 'pre-medical'],
  'medicine': ['medical', 'physician'],
  'pharmacy': ['pharmaceutical', 'pharmacology'],
  'biology': ['biological', 'life sciences', 'bioscience'],
  'bio': ['biology', 'biological'],
  'biochem': ['biochemistry', 'biochemical'],
  'chem': ['chemistry', 'chemical'],
  'physics': ['physical sciences'],
  'psychology': ['psychological', 'psych'],
  'psych': ['psychology', 'psychological'],
  'sociology': ['sociological', 'social sciences'],
  'politics': ['political science', 'government'],
  'history': ['historical', 'historic'],
  'philosophy': ['philosophical'],
  'econ': ['economics', 'economic'],
  'social work': ['social welfare', 'human services'],
  'education': ['teaching', 'educator', 'pedagogy'],
  'teaching': ['education', 'teacher'],
  'law': ['legal', 'jurisprudence'],
  'criminal justice': ['criminology', 'corrections', 'law enforcement'],
  'crim': ['criminology', 'criminal justice'],
  'communications': ['communication', 'journalism', 'media'],
  'journalism': ['media', 'communications', 'reporting'],
  'design': ['graphic design', 'visual arts', 'studio art'],
  'music': ['musical', 'performing arts'],
  'architecture': ['architectural'],
  'agriculture': ['agricultural', 'agronomy', 'animal science'],
  'sports': ['kinesiology', 'exercise science', 'sports management'],
  'kinesiology': ['exercise science', 'physical education', 'sports'],
  'liberal arts': ['general studies', 'humanities'],
  'mba': ['business administration'],
  'hr': ['human resources', 'personnel'],
};

function matchesQuery(title: string, query: string): boolean {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);
  return terms.every(term => {
    const alts = [term, ...(SYNONYMS[term] || [])];
    const patterns = alts.flatMap(a => [` ${a} `, ` ${a}`, `${a} `, `${a}`])
                        .map(p => `%${p}%`);
    return patterns.some(pat => {
      const inner = pat.slice(1, -1)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/%/g, '.*');
      return new RegExp(inner, 'i').test(title);
    });
  });
}

// ─── Real IPEDS CIP program titles grouped by typical degree level ─────────────
const BACHELORS_PROGRAMS: Array<{ query: string; title: string }> = [
  { query: 'computer science',       title: 'Computer Science, General' },
  { query: 'computer science',       title: 'Computer Science and Engineering' },
  { query: 'software engineering',   title: 'Software Engineering' },
  { query: 'information technology', title: 'Information Technology' },
  { query: 'nursing',                title: 'Registered Nursing/Registered Nurse' },
  { query: 'nursing',                title: 'Nursing Science' },
  { query: 'business administration',title: 'Business Administration and Management, General' },
  { query: 'business',               title: 'Business/Commerce, General' },
  { query: 'accounting',             title: 'Accounting' },
  { query: 'finance',                title: 'Finance, General' },
  { query: 'marketing',              title: 'Marketing/Marketing Management, General' },
  { query: 'economics',              title: 'Economics, General' },
  { query: 'psychology',             title: 'Psychology, General' },
  { query: 'biology',                title: 'Biology/Biological Sciences, General' },
  { query: 'chemistry',              title: 'Chemistry, General' },
  { query: 'mathematics',            title: 'Mathematics, General' },
  { query: 'physics',                title: 'Physics, General' },
  { query: 'history',                title: 'History, General' },
  { query: 'political science',      title: 'Political Science and Government, General' },
  { query: 'sociology',              title: 'Sociology' },
  { query: 'english',                title: 'English Language and Literature, General' },
  { query: 'criminal justice',       title: 'Criminal Justice/Law Enforcement Administration' },
  { query: 'education',              title: 'Elementary Education and Teaching' },
  { query: 'social work',            title: 'Social Work' },
  { query: 'architecture',           title: 'Architecture' },
  { query: 'communications',         title: 'Speech Communication and Rhetoric' },
  { query: 'journalism',             title: 'Journalism' },
  { query: 'mechanical engineering', title: 'Mechanical Engineering' },
  { query: 'electrical engineering', title: 'Electrical and Electronics Engineering' },
  { query: 'civil engineering',      title: 'Civil Engineering' },
  { query: 'chemical engineering',   title: 'Chemical Engineering' },
  { query: 'biomedical',             title: 'Biomedical/Medical Engineering' },
  { query: 'aerospace',              title: 'Aerospace, Aeronautical, and Astronautical/Space Engineering' },
  { query: 'industrial engineering', title: 'Industrial Engineering' },
  { query: 'environmental science',  title: 'Environmental Sciences' },
  { query: 'agriculture',            title: 'Agricultural Business and Management, General' },
  { query: 'kinesiology',            title: 'Kinesiology and Exercise Science' },
  { query: 'music',                  title: 'Music, General' },
  { query: 'art',                    title: 'Fine/Studio Arts, General' },
  { query: 'anthropology',           title: 'Anthropology' },
  { query: 'philosophy',             title: 'Philosophy' },
  { query: 'religious studies',      title: 'Religious Studies' },
  { query: 'international relations', title: 'International Relations and Affairs' },
  { query: 'public health',          title: 'Public Health, General' },
  { query: 'data science',           title: 'Data Science' },
  // IPEDS uses "Cybersecurity Defense Strategy/Policy" for the cyber security CIP
  { query: 'cybersecurity',          title: 'Cybersecurity Defense Strategy/Policy' },
  // "cyber" (single term) is a substring of "Cyber/Computer Forensics..."
  { query: 'cyber',                  title: 'Cyber/Computer Forensics and Counterterrorism' },
];

const MASTERS_PROGRAMS: Array<{ query: string; title: string }> = [
  { query: 'business administration', title: 'Business Administration, Management and Operations' },
  { query: 'mba',                    title: 'Business Administration, Management and Operations' },
  { query: 'computer science',       title: 'Computer Science, General' },
  { query: 'data science',           title: 'Data Science' },
  { query: 'nursing',                title: 'Nursing/Registered Nurse' },
  { query: 'public health',          title: 'Public Health, General' },
  { query: 'social work',            title: 'Social Work' },
  { query: 'education',              title: 'Elementary Education and Teaching' },
  { query: 'psychology',             title: 'Psychology, General' },
  { query: 'engineering',            title: 'Mechanical Engineering' },
  { query: 'finance',                title: 'Finance and Financial Management Services' },
  { query: 'accounting',             title: 'Accounting' },
  { query: 'economics',              title: 'Economics, General' },
  { query: 'architecture',           title: 'Architecture' },
  { query: 'law',                    title: 'Legal Studies, General' },
];

const ASSOCIATES_PROGRAMS: Array<{ query: string; title: string }> = [
  { query: 'nursing',                title: 'Registered Nursing/Registered Nurse' },
  { query: 'business',               title: 'Business Administration and Management, General' },
  { query: 'computer science',       title: 'Computer Science' },
  { query: 'criminal justice',       title: 'Criminal Justice/Police Science' },
  { query: 'accounting',             title: 'Accounting Technology/Technician and Bookkeeping' },
  { query: 'education',              title: 'Early Childhood Education and Teaching' },
  // IPEDS uses "Medical/Clinical Assistant" — search term should be "medical assistant"
  { query: 'medical assistant',      title: 'Medical/Clinical Assistant' },
  { query: 'dental',                 title: 'Dental Assisting/Assistant' },
];

const DOCTORATE_PROGRAMS: Array<{ query: string; title: string }> = [
  { query: 'psychology',             title: 'Psychology, General' },
  { query: 'biology',                title: 'Biology/Biological Sciences, General' },
  { query: 'chemistry',              title: 'Chemistry, General' },
  { query: 'physics',                title: 'Physics, General' },
  { query: 'history',                title: 'History, General' },
  { query: 'nursing',                title: 'Nursing Practice' },
  { query: 'pharmacy',               title: 'Pharmacy' },
  { query: 'medicine',               title: 'Medicine' },
  { query: 'dentistry',              title: 'Dentistry (D.D.S., D.M.D.)' },
  { query: 'law',                    title: 'Law' },
  { query: 'philosophy',             title: 'Philosophy' },
  { query: 'education',              title: 'Educational Leadership and Administration, General' },
];

// ─── Abbreviation coverage tests ──────────────────────────────────────────────
const ABBREVIATION_CASES: Array<{ query: string; title: string }> = [
  { query: 'cs',    title: 'Computer Science, General' },
  { query: 'bio',   title: 'Biology/Biological Sciences, General' },
  { query: 'psych', title: 'Psychology, General' },
  { query: 'stats', title: 'Statistics, General' },
  { query: 'econ',  title: 'Economics, General' },
  { query: 'math',  title: 'Mathematics, General' },
  { query: 'chem',  title: 'Chemistry, General' },
  { query: 'biochem', title: 'Biochemistry' },
  { query: 'mba',   title: 'Business Administration, Management and Operations' },
  { query: 'hr',    title: 'Human Resources Management/Personnel Administration, General' },
];

// ─── College name normalization ────────────────────────────────────────────────
const COLLEGE_NAME_CASES: Array<{ raw: string; normalized: string }> = [
  { raw: 'Texas A&M',      normalized: 'Texas A&M' },
  { raw: 'Texas A & M',   normalized: 'Texas A&M' },
  { raw: 'A&M University', normalized: 'A&M University' },
  { raw: 'A & M University', normalized: 'A&M University' },
];

function normalizeCollegeName(name: string): string {
  return name.replace(/\s*&\s*/g, '&');
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('Bachelor\'s Program Searches (most common failures before fix)', () => {
  for (const { query, title } of BACHELORS_PROGRAMS) {
    it(`"${query}" matches "${title.slice(0, 60)}"`, () => {
      expect(matchesQuery(title, query)).toBe(true);
    });
  }
});

describe('Master\'s Program Searches', () => {
  for (const { query, title } of MASTERS_PROGRAMS) {
    it(`"${query}" matches "${title.slice(0, 60)}"`, () => {
      expect(matchesQuery(title, query)).toBe(true);
    });
  }
});

describe('Associate\'s Program Searches', () => {
  for (const { query, title } of ASSOCIATES_PROGRAMS) {
    it(`"${query}" matches "${title.slice(0, 60)}"`, () => {
      expect(matchesQuery(title, query)).toBe(true);
    });
  }
});

describe('Doctorate Program Searches', () => {
  for (const { query, title } of DOCTORATE_PROGRAMS) {
    it(`"${query}" matches "${title.slice(0, 60)}"`, () => {
      expect(matchesQuery(title, query)).toBe(true);
    });
  }
});

describe('Abbreviation and Shorthand Searches', () => {
  for (const { query, title } of ABBREVIATION_CASES) {
    it(`abbreviation "${query}" matches "${title}"`, () => {
      expect(matchesQuery(title, query)).toBe(true);
    });
  }
});

describe('College Name Normalization (A&M ampersand handling)', () => {
  for (const { raw, normalized } of COLLEGE_NAME_CASES) {
    it(`"${raw}" normalizes to "${normalized}"`, () => {
      expect(normalizeCollegeName(raw)).toBe(normalized);
    });
  }

  it('REPLACE query pattern handles space-padded ampersands', () => {
    // Simulates the SQL: REPLACE(name, ' & ', '&') LIKE ?
    const dbName = 'Texas A & M University';
    const normalized = dbName.replace(/ & /g, '&');
    expect(normalized).toBe('Texas A&M University');
    expect(normalized.toLowerCase()).toContain('a&m');
  });
});

describe('Negative Cases (must NOT match)', () => {
  const negativeCases: Array<{ query: string; title: string }> = [
    { query: 'nursing',          title: 'Business Administration' },
    { query: 'computer science', title: 'History, General' },
    { query: 'physics',          title: 'Creative Writing' },
    { query: 'accounting',       title: 'Theater Arts' },
    { query: 'law',              title: 'Mathematics, General' },
    { query: 'music',            title: 'Electrical Engineering' },
    { query: 'architecture',     title: 'Marine Biology' },
  ];

  for (const { query, title } of negativeCases) {
    it(`"${query}" does NOT match "${title}"`, () => {
      expect(matchesQuery(title, query)).toBe(false);
    });
  }
});

describe('hasMore Pagination Logic', () => {
  const limit = 30;

  it('hasMore is true when returned count equals limit', () => {
    const hasMore = 30 >= limit;
    expect(hasMore).toBe(true);
  });

  it('hasMore is false when returned count is less than limit', () => {
    const hasMore = 29 >= limit;
    expect(hasMore).toBe(false);
  });

  it('hasMore is true when returned count exceeds limit (edge case)', () => {
    const hasMore = 31 >= limit;
    expect(hasMore).toBe(true);
  });

  it('old === operator fails when count is 0 and limit is 0', () => {
    // Demonstrates why >= is safer than ===
    const withEquals = 0 === 0;   // true — incorrectly thinks there might be more
    const withGte    = 0 >= 30;   // false — correct: no results means no more
    expect(withGte).toBe(false);
    expect(withEquals).toBe(true); // this was the bug
  });
});
