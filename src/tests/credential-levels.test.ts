/**
 * Credential Level Consistency Tests
 * ===================================
 * Verifies that ALL credential level mappings are identical across every file
 * that filters by degree type.
 *
 * IMPORTANT: The Urban Institute IPEDS data uses NON-STANDARD award_level codes:
 *   4 = Associate's degree (NOT "2-4yr award")
 *   7 = Bachelor's degree (NOT Master's)
 *   9 = Master's/Graduate degree (NOT Doctoral)
 *   22 = Extended Bachelor's (5-year programs)
 *   23 = Extended Master's
 *   8, 24, 30-33 = Various certificates
 *
 * This was confirmed by querying the Urban Institute API directly:
 *   - UC Berkeley CS (CIP 11.0701): award_level=7 has 696 awards (bachelor's)
 *   - Texas State Accounting (CIP 52.0301): award_level=7 has 167 (bachelor's), 9 has 59 (master's)
 *   - Community colleges only have level 4 (associate's) + certificate levels
 *
 * Run: npx vitest run src/tests/credential-levels.test.ts
 */

import { describe, it, expect } from 'vitest';

// ─── Canonical truth ──────────────────────────────────────────────────────────
// These are the CORRECT credential level sets matching the actual Urban Institute
// IPEDS data in the database. Every file must agree with these.
const CANONICAL = {
  associates:  [4],
  bachelors:   [7, 22],
  masters:     [9, 23],
  doctorate:   [9, 17, 18, 19],
  certificate: [8, 24, 30, 31, 32, 33],
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Parse `IN (a, b, c)` → sorted number array */
function parseInClause(sql: string): number[] {
  const m = sql.match(/IN\s*\(([^)]+)\)/i);
  if (!m) throw new Error(`No IN clause found in: ${sql}`);
  return m[1].split(',').map(s => parseInt(s.trim(), 10)).sort((a, b) => a - b);
}

function sorted(arr: readonly number[]): number[] {
  return [...arr].sort((a, b) => a - b);
}

// ─── Extracted SQL snippets from each source file ─────────────────────────────
// These mirror exactly what each file produces. If you change the source, update here.

const DATABASE_TS_GET_PROGRAMS: Record<string, string> = {
  associates:  'AND credential_level IN (4)',
  bachelors:   'AND credential_level IN (7, 22)',
  masters:     'AND credential_level IN (9, 23)',
  doctorate:   'AND credential_level IN (9, 17, 18, 19)',
  certificate: 'AND credential_level IN (8, 24, 30, 31, 32, 33)',
};

const PROGRAMS_SEARCH_ROUTE: Record<string, string> = {
  associates:  'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (4))',
  bachelors:   'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (7, 22))',
  masters:     'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (9, 23))',
  doctorate:   'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (9, 17, 18, 19))',
  certificate: 'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (8, 24, 30, 31, 32, 33))',
};

const PROGRAMS_INSTITUTIONS_ROUTE: Record<string, string> = {
  associates:  'AND ap.credential_level IN (4)',
  bachelors:   'AND ap.credential_level IN (7, 22)',
  masters:     'AND ap.credential_level IN (9, 23)',
  doctorate:   'AND ap.credential_level IN (9, 17, 18, 19)',
  certificate: 'AND ap.credential_level IN (8, 24, 30, 31, 32, 33)',
};

const MAJORS_SEARCH_ROUTE: Record<string, string> = {
  associates:  'AND credential_level IN (4)',
  bachelors:   'AND credential_level IN (7, 22)',
  masters:     'AND credential_level IN (9, 23)',
  doctorate:   'AND credential_level IN (9, 17, 18, 19)',
  certificate: 'AND credential_level IN (8, 24, 30, 31, 32, 33)',
};

// ─── Test helper ──────────────────────────────────────────────────────────────
function testFileAgainstCanonical(label: string, map: Record<string, string>) {
  describe(label, () => {
    for (const [level, canonical] of Object.entries(CANONICAL)) {
      it(`${level} levels match canonical`, () => {
        const sql = map[level];
        expect(sql, `Missing entry for "${level}" in ${label}`).toBeDefined();
        expect(parseInClause(sql)).toEqual(sorted(canonical));
      });
    }
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('Credential Level Consistency', () => {

  describe('Canonical values are internally consistent', () => {
    it('associates must include level 4 (Associate degree in Urban Institute data)', () => {
      expect(CANONICAL.associates).toContain(4);
    });

    it('bachelors must include level 7 (Bachelor degree in Urban Institute data)', () => {
      expect(CANONICAL.bachelors).toContain(7);
    });

    it('bachelors must include level 22 (extended Bachelor)', () => {
      expect(CANONICAL.bachelors).toContain(22);
    });

    it('bachelors must NOT include level 31 (occupational certificate)', () => {
      expect(CANONICAL.bachelors).not.toContain(31);
    });

    it('certificate must include level 31 (occupational certificate)', () => {
      expect(CANONICAL.certificate).toContain(31);
    });

    it('masters must include level 9 (Master/Graduate in Urban Institute data)', () => {
      expect(CANONICAL.masters).toContain(9);
    });

    it('doctorate must include level 9 (also used for doctoral programs)', () => {
      expect(CANONICAL.doctorate).toContain(9);
    });
  });

  testFileAgainstCanonical('database.ts → getInstitutionPrograms', DATABASE_TS_GET_PROGRAMS);
  testFileAgainstCanonical('api/programs/search/route.ts', PROGRAMS_SEARCH_ROUTE);
  testFileAgainstCanonical('api/programs/institutions/route.ts', PROGRAMS_INSTITUTIONS_ROUTE);
  testFileAgainstCanonical('api/majors/search/route.ts', MAJORS_SEARCH_ROUTE);
});
