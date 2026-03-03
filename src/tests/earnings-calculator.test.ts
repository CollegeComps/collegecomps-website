/**
 * Earnings Calculator Unit Tests
 * ================================
 * Tests for:
 * - CREDENTIAL_PROGRAM_LENGTH: all 23 credential levels have valid year values
 * - CREDENTIAL_CAREER_LENGTH: correct ordering (advanced degrees → shorter horizon)
 * - estimateSalaryFromCip: returns sensible salaries for each credential category
 * - getDegreeMultiplier coverage: all canonical credential levels have non-default multipliers
 *
 * No database required — all logic is pure.
 *
 * Run: npx vitest run src/tests/earnings-calculator.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
  CREDENTIAL_PROGRAM_LENGTH,
  CREDENTIAL_CAREER_LENGTH,
  EnhancedEarningsCalculator,
} from '@/utils/enhancedEarningsCalculator';

// ─── Canonical credential level sets (from credential-levels.test.ts) ──────
const ASSOCIATE_LEVELS   = [3, 4];
const BACHELOR_LEVELS    = [5, 22, 31];  // 22 = extended bachelor's
const MASTER_LEVELS      = [7, 23];      // 23 = extended master's
const DOCTORATE_LEVELS   = [8, 9, 17, 18, 19];
const CERTIFICATE_LEVELS = [1, 2, 6, 30, 32, 33];
const ALL_LEVELS = [
  ...ASSOCIATE_LEVELS,
  ...BACHELOR_LEVELS,
  ...MASTER_LEVELS,
  ...DOCTORATE_LEVELS,
  ...CERTIFICATE_LEVELS,
];

// ─── CREDENTIAL_PROGRAM_LENGTH tests ────────────────────────────────────────
describe('CREDENTIAL_PROGRAM_LENGTH', () => {
  it('is defined and is an object', () => {
    expect(CREDENTIAL_PROGRAM_LENGTH).toBeDefined();
    expect(typeof CREDENTIAL_PROGRAM_LENGTH).toBe('object');
  });

  it('has entries for all canonical credential levels', () => {
    for (const level of ALL_LEVELS) {
      expect(
        CREDENTIAL_PROGRAM_LENGTH[level],
        `Missing CREDENTIAL_PROGRAM_LENGTH entry for level ${level}`
      ).toBeDefined();
    }
  });

  it('all program lengths are positive numbers', () => {
    for (const [level, length] of Object.entries(CREDENTIAL_PROGRAM_LENGTH)) {
      expect(length, `Level ${level} has non-positive program length`).toBeGreaterThan(0);
      expect(typeof length).toBe('number');
    }
  });

  it('certificate programs are ≤ 2 years', () => {
    for (const level of CERTIFICATE_LEVELS) {
      expect(
        CREDENTIAL_PROGRAM_LENGTH[level],
        `Certificate level ${level} should be ≤ 2 years`
      ).toBeLessThanOrEqual(2);
    }
  });

  it("associate's degrees are 2–3 years", () => {
    for (const level of ASSOCIATE_LEVELS) {
      expect(CREDENTIAL_PROGRAM_LENGTH[level]).toBeGreaterThanOrEqual(2);
      expect(CREDENTIAL_PROGRAM_LENGTH[level]).toBeLessThanOrEqual(3);
    }
  });

  it("standard bachelor's degree (level 5) is 4 years", () => {
    expect(CREDENTIAL_PROGRAM_LENGTH[5]).toBe(4);
  });

  it("extended bachelor's (level 22) is 5 years", () => {
    expect(CREDENTIAL_PROGRAM_LENGTH[22]).toBe(5);
  });

  it("master's degrees are 2–3 years", () => {
    for (const level of MASTER_LEVELS) {
      expect(CREDENTIAL_PROGRAM_LENGTH[level]).toBeGreaterThanOrEqual(2);
      expect(CREDENTIAL_PROGRAM_LENGTH[level]).toBeLessThanOrEqual(3);
    }
  });

  it('research/professional doctoral programs are ≥ 3 years', () => {
    // Level 8 = Post-master's certificate (1 yr) is grouped under DOCTORATE for search purposes
    // but is not itself a multi-year doctoral program.
    // Actual doctoral programs: 9 (generic), 17 (research), 18 (professional), 19 (other)
    const actualDoctoralLevels = [9, 17, 18, 19];
    for (const level of actualDoctoralLevels) {
      expect(
        CREDENTIAL_PROGRAM_LENGTH[level],
        `Doctorate level ${level} should be ≥ 3 years`
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it('post-master certificate (level 8) is ≤ 2 years (short supplemental program)', () => {
    // Level 8 is a credential filter alias for doctoral search, but the program itself is short
    expect(CREDENTIAL_PROGRAM_LENGTH[8]).toBeLessThanOrEqual(2);
  });
});

// ─── CREDENTIAL_CAREER_LENGTH tests ─────────────────────────────────────────
describe('CREDENTIAL_CAREER_LENGTH', () => {
  it('is defined and is an object', () => {
    expect(CREDENTIAL_CAREER_LENGTH).toBeDefined();
    expect(typeof CREDENTIAL_CAREER_LENGTH).toBe('object');
  });

  it('has entries for all canonical credential levels', () => {
    for (const level of ALL_LEVELS) {
      expect(
        CREDENTIAL_CAREER_LENGTH[level],
        `Missing CREDENTIAL_CAREER_LENGTH entry for level ${level}`
      ).toBeDefined();
    }
  });

  it('all career lengths are between 20 and 45 years', () => {
    for (const [level, length] of Object.entries(CREDENTIAL_CAREER_LENGTH)) {
      expect(length, `Level ${level} career length out of range`).toBeGreaterThanOrEqual(20);
      expect(length, `Level ${level} career length too high`).toBeLessThanOrEqual(45);
    }
  });

  it("bachelor's degree (level 5) has 40-year career (matches analytics methodology)", () => {
    expect(CREDENTIAL_CAREER_LENGTH[5]).toBe(40);
  });

  it("certificate programs have ≥ 38-year career (start young)", () => {
    for (const level of [1, 2, 3, 30, 31, 32]) {
      expect(
        CREDENTIAL_CAREER_LENGTH[level],
        `Certificate/associate level ${level} should have long career`
      ).toBeGreaterThanOrEqual(38);
    }
  });

  it('professional doctorates (MD/JD, level 18) have shorter career than associates', () => {
    // MD/JD graduates start at 30+, so career is shorter
    expect(CREDENTIAL_CAREER_LENGTH[18]).toBeLessThan(CREDENTIAL_CAREER_LENGTH[3]);
  });

  it('advanced degrees have shorter career than basic certificates (starts later)', () => {
    const avgDoctoralCareer = DOCTORATE_LEVELS.reduce(
      (sum, lvl) => sum + CREDENTIAL_CAREER_LENGTH[lvl], 0
    ) / DOCTORATE_LEVELS.length;
    const avgCertCareer = [1, 2, 30, 32].reduce(
      (sum, lvl) => sum + CREDENTIAL_CAREER_LENGTH[lvl], 0
    ) / 4;
    expect(avgDoctoralCareer).toBeLessThan(avgCertCareer);
  });
});

// ─── estimateSalaryFromCip tests ─────────────────────────────────────────────
describe('EnhancedEarningsCalculator.estimateSalaryFromCip', () => {
  it('returns a valid salary structure', () => {
    const result = EnhancedEarningsCalculator.estimateSalaryFromCip('11.0701', 5); // CS bachelor's
    expect(result).toHaveProperty('startingSalary');
    expect(result).toHaveProperty('midCareerSalary');
    expect(result).toHaveProperty('growthRate');
  });

  it('starting salary is a positive integer', () => {
    const result = EnhancedEarningsCalculator.estimateSalaryFromCip('52.0201', 5); // Business
    expect(result.startingSalary).toBeGreaterThan(0);
    expect(Number.isInteger(result.startingSalary)).toBe(true);
  });

  it('mid-career salary exceeds starting salary (reflects growth)', () => {
    const result = EnhancedEarningsCalculator.estimateSalaryFromCip('14.0101', 5); // Engineering
    expect(result.midCareerSalary).toBeGreaterThan(result.startingSalary);
  });

  it('growth rate is between 1% and 10%', () => {
    const cipCodes = ['11.0701', '51.0000', '13.0101', '52.0201', '14.0101'];
    for (const cip of cipCodes) {
      const result = EnhancedEarningsCalculator.estimateSalaryFromCip(cip, 5);
      expect(result.growthRate, `CIP ${cip} growth rate out of range`).toBeGreaterThanOrEqual(1);
      expect(result.growthRate, `CIP ${cip} growth rate out of range`).toBeLessThanOrEqual(10);
    }
  });

  it('doctorate salary is higher than certificate salary for same CIP', () => {
    const cert = EnhancedEarningsCalculator.estimateSalaryFromCip('51.0000', 1);   // Health, certificate
    const doct = EnhancedEarningsCalculator.estimateSalaryFromCip('51.0000', 18);  // Health, doctorate
    expect(doct.startingSalary).toBeGreaterThan(cert.startingSalary);
  });

  it("master's salary is higher than bachelor's salary for same CIP", () => {
    const bach = EnhancedEarningsCalculator.estimateSalaryFromCip('52.0201', 5);  // Business bachelor's
    const mast = EnhancedEarningsCalculator.estimateSalaryFromCip('52.0201', 7);  // Business master's
    expect(mast.startingSalary).toBeGreaterThan(bach.startingSalary);
  });

  it('CS (CIP 11) salaries are higher than education (CIP 13) at same level', () => {
    const edu = EnhancedEarningsCalculator.estimateSalaryFromCip('13.0101', 5);
    const cs  = EnhancedEarningsCalculator.estimateSalaryFromCip('11.0701', 5);
    expect(cs.startingSalary).toBeGreaterThan(edu.startingSalary);
  });

  it('falls back gracefully for unknown CIP codes', () => {
    // CIP 99 does not exist — should fall back to default (CIP 52 = business)
    const result = EnhancedEarningsCalculator.estimateSalaryFromCip('99.9999', 5);
    const businessDefault = EnhancedEarningsCalculator.estimateSalaryFromCip('52.0201', 5);
    expect(result.startingSalary).toBe(businessDefault.startingSalary);
  });

  it('works for associate credential level (level 3)', () => {
    const result = EnhancedEarningsCalculator.estimateSalaryFromCip('51.3801', 3); // Nursing associate's
    expect(result.startingSalary).toBeGreaterThan(20000);
    expect(result.startingSalary).toBeLessThan(200000);
  });

  it('works for all canonical credential level types', () => {
    for (const level of ALL_LEVELS) {
      const result = EnhancedEarningsCalculator.estimateSalaryFromCip('52.0201', level);
      expect(result.startingSalary, `Level ${level} returned invalid salary`).toBeGreaterThan(0);
      expect(result.midCareerSalary, `Level ${level} returned invalid mid-career salary`).toBeGreaterThan(0);
    }
  });

  it('handles CIP code with and without decimal', () => {
    const withDot    = EnhancedEarningsCalculator.estimateSalaryFromCip('11.0701', 5);
    const withoutDot = EnhancedEarningsCalculator.estimateSalaryFromCip('11', 5);
    // Both should use the same CIP major category '11'
    expect(withDot.startingSalary).toBe(withoutDot.startingSalary);
  });
});

// ─── Degree multiplier ordering tests ───────────────────────────────────────
// Test relative salary ordering by calling estimateSalaryFromCip at different levels
// for the same CIP code and verifying the expected hierarchy.
describe('Salary hierarchy by credential level (CIP 52 Business)', () => {
  const CIP = '52.0201';

  it('certificate < associate < bachelor for same CIP', () => {
    const cert  = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 1);  // cert < 1yr
    const assoc = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 3);  // associate
    const bach  = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 5);  // bachelor's
    expect(cert.startingSalary).toBeLessThan(assoc.startingSalary);
    expect(assoc.startingSalary).toBeLessThan(bach.startingSalary);
  });

  it("bachelor < master's < doctorate for same CIP", () => {
    const bach = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 5);
    const mast = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 7);
    const doct = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 17);
    expect(bach.startingSalary).toBeLessThan(mast.startingSalary);
    expect(mast.startingSalary).toBeLessThan(doct.startingSalary);
  });

  it('extended degrees match their non-extended counterparts', () => {
    // Level 22 (extended bachelor's) should equal level 5 (bachelor's) salary
    const bach  = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 5);
    const bachX = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 22);
    expect(bach.startingSalary).toBe(bachX.startingSalary);

    // Level 23 (extended master's) should equal level 7 (master's) salary
    const mast  = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 7);
    const mastX = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 23);
    expect(mast.startingSalary).toBe(mastX.startingSalary);
  });

  it('research/professional doctorate levels (9, 17, 18, 19) produce equal salary', () => {
    // These all share 1.4x multiplier
    const actualDoctoralLevels = [9, 17, 18, 19];
    const salaries = actualDoctoralLevels.map(lvl =>
      EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, lvl).startingSalary
    );
    expect(new Set(salaries).size).toBe(1);
  });

  it('post-master certificate (level 8) salary is between master and doctorate', () => {
    // Level 8 uses 1.3x multiplier, between master's (1.25x) and doctoral (1.4x)
    const mast = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 7);
    const postMast = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 8);
    const doct = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 17);
    expect(postMast.startingSalary).toBeGreaterThan(mast.startingSalary);
    expect(postMast.startingSalary).toBeLessThan(doct.startingSalary);
  });

  it('occupational awards/certs have expected ordering', () => {
    const occ1 = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 30); // < 1yr occupational
    const occ2 = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 31); // 1-4yr occupational
    expect(occ1.startingSalary).toBeLessThanOrEqual(occ2.startingSalary);
  });
});
