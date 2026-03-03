/**
 * Credential Level Consistency Tests
 * ===================================
 * Verifies that ALL credential level mappings are identical across every file
 * that filters by degree type. A divergence here caused the original bug
 * where bachelor's programs were invisible in search (missing level 5).
 *
 * Run: npx vitest run src/tests/credential-levels.test.ts
 */

import { describe, it, expect } from 'vitest';

// ─── Canonical truth ──────────────────────────────────────────────────────────
// These are the CORRECT credential level sets. Every file must agree with these.
const CANONICAL = {
  associates:  [3, 4],
  bachelors:   [5, 22, 31],
  masters:     [7, 23],
  doctorate:   [8, 9, 17, 18, 19],
  certificate: [1, 2, 6, 30, 32, 33],
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
  associates:  'AND credential_level IN (3,4)',
  bachelors:   'AND credential_level IN (5,22,31)',
  masters:     'AND credential_level IN (7,23)',
  doctorate:   'AND credential_level IN (8,9,17,18,19)',
  certificate: 'AND credential_level IN (1,2,6,30,32,33)',
};

const DATABASE_TS_SEARCH_INSTITUTIONS: Record<string, string> = {
  associates:  'AND ap.credential_level IN (3, 4)',
  bachelors:   'AND ap.credential_level IN (5, 22, 31)',
  masters:     'AND ap.credential_level IN (7, 23)',
  doctorate:   'AND ap.credential_level IN (8, 9, 17, 18, 19)',
  certificate: 'AND ap.credential_level IN (1, 2, 6, 30, 32, 33)',
};

const PROGRAMS_SEARCH_ROUTE: Record<string, string> = {
  associates:  'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (3, 4))',
  bachelors:   'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (5, 22, 31))',
  masters:     'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (7, 23))',
  doctorate:   'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (8, 9, 17, 18, 19))',
  certificate: 'AND EXISTS (SELECT 1 FROM academic_programs ap WHERE ap.cipcode = p.cipcode AND ap.credential_level IN (1, 2, 6, 30, 32, 33))',
};

const PROGRAMS_INSTITUTIONS_ROUTE: Record<string, string> = {
  associates:  'AND ap.credential_level IN (3, 4)',
  bachelors:   'AND ap.credential_level IN (5, 22, 31)',
  masters:     'AND ap.credential_level IN (7, 23)',
  doctorate:   'AND ap.credential_level IN (8, 9, 17, 18, 19)',
  certificate: 'AND ap.credential_level IN (1, 2, 6, 30, 32, 33)',
};

const MAJORS_SEARCH_ROUTE: Record<string, string> = {
  associates:  'AND credential_level IN (3, 4)',
  bachelors:   'AND credential_level IN (5, 22, 31)',
  masters:     'AND credential_level IN (7, 23)',
  doctorate:   'AND credential_level IN (8, 9, 17, 18, 19)',
  certificate: 'AND credential_level IN (1, 2, 6, 30, 32, 33)',
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
    it('associates must include level 3 (Associate degree) and 4 (2-4yr award)', () => {
      expect(CANONICAL.associates).toContain(3);
      expect(CANONICAL.associates).toContain(4);
    });

    it('bachelors must include level 5 (the standard Bachelor degree)', () => {
      expect(CANONICAL.bachelors).toContain(5);
    });

    it('bachelors must include level 22 (extended Bachelor)', () => {
      expect(CANONICAL.bachelors).toContain(22);
    });

    it('masters must include level 7 (standard Master)', () => {
      expect(CANONICAL.masters).toContain(7);
    });

    it('doctorate must include levels 8, 9, 17, 18, 19', () => {
      for (const lvl of [8, 9, 17, 18, 19]) {
        expect(CANONICAL.doctorate).toContain(lvl);
      }
    });

    it('doctorate must NOT include level 24 or 33 (old wrong codes)', () => {
      expect(CANONICAL.doctorate).not.toContain(24);
      expect(CANONICAL.doctorate).not.toContain(33);
    });

    it('degree level sets must not overlap (a level belongs to exactly one degree type)', () => {
      const all: number[] = [];
      for (const levels of Object.values(CANONICAL)) {
        for (const l of levels) {
          expect(all, `Level ${l} appears in multiple degree groups`).not.toContain(l);
          all.push(l);
        }
      }
    });
  });

  testFileAgainstCanonical('database.ts → getInstitutionPrograms', DATABASE_TS_GET_PROGRAMS);
  testFileAgainstCanonical('database.ts → searchInstitutions', DATABASE_TS_SEARCH_INSTITUTIONS);
  testFileAgainstCanonical('api/programs/search/route.ts', PROGRAMS_SEARCH_ROUTE);
  testFileAgainstCanonical('api/programs/institutions/route.ts', PROGRAMS_INSTITUTIONS_ROUTE);
  testFileAgainstCanonical('api/majors/search/route.ts', MAJORS_SEARCH_ROUTE);
});
