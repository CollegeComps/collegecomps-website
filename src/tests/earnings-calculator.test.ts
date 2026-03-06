/**
 * Earnings Calculator Unit Tests
 * ================================
 * Tests for:
 * - CREDENTIAL_PROGRAM_LENGTH: all Urban Institute credential levels have valid year values
 * - CREDENTIAL_CAREER_LENGTH: correct ordering (advanced degrees → shorter horizon)
 * - estimateSalaryFromCip: returns sensible salaries for each credential category
 * - getDegreeMultiplier coverage: all canonical credential levels have non-default multipliers
 *
 * Uses Urban Institute IPEDS credential level codes (NOT standard IPEDS AWLEVEL):
 *   4 = Associate's, 7 = Bachelor's, 9 = Master's/Graduate,
 *   22 = Extended Bachelor's, 23 = Extended Master's
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

// ─── Canonical credential level sets (Urban Institute coding) ────────────────
const ASSOCIATE_LEVELS   = [4];
const BACHELOR_LEVELS    = [7, 22];
const MASTER_LEVELS      = [9, 23];
const DOCTORATE_LEVELS   = [9, 17, 18, 19];
const CERTIFICATE_LEVELS = [8, 24, 30, 31, 32, 33];
const ALL_LEVELS = [
  ...new Set([
    ...ASSOCIATE_LEVELS,
    ...BACHELOR_LEVELS,
    ...MASTER_LEVELS,
    ...DOCTORATE_LEVELS,
    ...CERTIFICATE_LEVELS,
  ]),
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
    for (const level of [30, 31, 32, 33]) {
      expect(
        CREDENTIAL_PROGRAM_LENGTH[level],
        `Certificate level ${level} should be ≤ 2 years`
      ).toBeLessThanOrEqual(2);
    }
  });

  it("associate's degree (level 4) is 2 years", () => {
    expect(CREDENTIAL_PROGRAM_LENGTH[4]).toBe(2);
  });

  it("standard bachelor's degree (level 7) is 4 years", () => {
    expect(CREDENTIAL_PROGRAM_LENGTH[7]).toBe(4);
  });

  it("extended bachelor's (level 22) is 5 years", () => {
    expect(CREDENTIAL_PROGRAM_LENGTH[22]).toBe(5);
  });

  it("master's degree (level 9) is 2 years", () => {
    expect(CREDENTIAL_PROGRAM_LENGTH[9]).toBe(2);
  });

  it("extended master's (level 23) is 3 years", () => {
    expect(CREDENTIAL_PROGRAM_LENGTH[23]).toBe(3);
  });

  it('doctoral degree (level 24) is ≥ 3 years', () => {
    expect(CREDENTIAL_PROGRAM_LENGTH[24]).toBeGreaterThanOrEqual(3);
  });

  it('post-baccalaureate certificate (level 8) is ≤ 2 years', () => {
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

  it("bachelor's degree (level 7) has 40-year career (matches analytics methodology)", () => {
    expect(CREDENTIAL_CAREER_LENGTH[7]).toBe(40);
  });

  it("associate's degree (level 4) has longer career than bachelor's (starts earlier)", () => {
    expect(CREDENTIAL_CAREER_LENGTH[4]).toBeGreaterThanOrEqual(CREDENTIAL_CAREER_LENGTH[7]);
  });

  it('occupational certificates have long career (start young)', () => {
    for (const level of [30, 31, 32]) {
      expect(
        CREDENTIAL_CAREER_LENGTH[level],
        `Certificate level ${level} should have long career`
      ).toBeGreaterThanOrEqual(38);
    }
  });
});

// ─── estimateSalaryFromCip tests ─────────────────────────────────────────────
describe('EnhancedEarningsCalculator.estimateSalaryFromCip', () => {
  it('returns a valid salary structure', () => {
    const result = EnhancedEarningsCalculator.estimateSalaryFromCip('11.0701', 7); // CS bachelor's
    expect(result).toHaveProperty('startingSalary');
    expect(result).toHaveProperty('midCareerSalary');
    expect(result).toHaveProperty('growthRate');
  });

  it('starting salary is a positive integer', () => {
    const result = EnhancedEarningsCalculator.estimateSalaryFromCip('52.0201', 7); // Business
    expect(result.startingSalary).toBeGreaterThan(0);
    expect(Number.isInteger(result.startingSalary)).toBe(true);
  });

  it('mid-career salary exceeds starting salary (reflects growth)', () => {
    const result = EnhancedEarningsCalculator.estimateSalaryFromCip('14.0101', 7); // Engineering
    expect(result.midCareerSalary).toBeGreaterThan(result.startingSalary);
  });

  it('growth rate is between 1% and 10%', () => {
    const cipCodes = ['11.0701', '51.0000', '13.0101', '52.0201', '14.0101'];
    for (const cip of cipCodes) {
      const result = EnhancedEarningsCalculator.estimateSalaryFromCip(cip, 7);
      expect(result.growthRate, `CIP ${cip} growth rate out of range`).toBeGreaterThanOrEqual(1);
      expect(result.growthRate, `CIP ${cip} growth rate out of range`).toBeLessThanOrEqual(10);
    }
  });

  it('doctorate salary is higher than certificate salary for same CIP', () => {
    const cert = EnhancedEarningsCalculator.estimateSalaryFromCip('51.0000', 30);  // Health, certificate
    const doct = EnhancedEarningsCalculator.estimateSalaryFromCip('51.0000', 18);  // Health, doctorate
    expect(doct.startingSalary).toBeGreaterThan(cert.startingSalary);
  });

  it("master's salary is higher than bachelor's salary for same CIP", () => {
    const bach = EnhancedEarningsCalculator.estimateSalaryFromCip('52.0201', 7);   // Business bachelor's
    const mast = EnhancedEarningsCalculator.estimateSalaryFromCip('52.0201', 9);   // Business master's
    expect(mast.startingSalary).toBeGreaterThan(bach.startingSalary);
  });

  it('CS (CIP 11) salaries are higher than education (CIP 13) at same level', () => {
    const edu = EnhancedEarningsCalculator.estimateSalaryFromCip('13.0101', 7);
    const cs  = EnhancedEarningsCalculator.estimateSalaryFromCip('11.0701', 7);
    expect(cs.startingSalary).toBeGreaterThan(edu.startingSalary);
  });

  it('falls back gracefully for unknown CIP codes', () => {
    const result = EnhancedEarningsCalculator.estimateSalaryFromCip('99.9999', 7);
    const businessDefault = EnhancedEarningsCalculator.estimateSalaryFromCip('52.0201', 7);
    expect(result.startingSalary).toBe(businessDefault.startingSalary);
  });

  it('works for associate credential level (level 4)', () => {
    const result = EnhancedEarningsCalculator.estimateSalaryFromCip('51.3801', 4); // Nursing associate's
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
    const withDot    = EnhancedEarningsCalculator.estimateSalaryFromCip('11.0701', 7);
    const withoutDot = EnhancedEarningsCalculator.estimateSalaryFromCip('11', 7);
    expect(withDot.startingSalary).toBe(withoutDot.startingSalary);
  });
});

// ─── Degree multiplier ordering tests ───────────────────────────────────────
describe('Salary hierarchy by credential level (CIP 52 Business)', () => {
  const CIP = '52.0201';

  it('certificate < associate < bachelor for same CIP', () => {
    const cert  = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 30); // occupational cert
    const assoc = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 4);  // associate
    const bach  = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 7);  // bachelor's
    expect(cert.startingSalary).toBeLessThan(assoc.startingSalary);
    expect(assoc.startingSalary).toBeLessThan(bach.startingSalary);
  });

  it("bachelor < master's < doctorate for same CIP", () => {
    const bach = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 7);
    const mast = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 9);
    const doct = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 17);
    expect(bach.startingSalary).toBeLessThan(mast.startingSalary);
    expect(mast.startingSalary).toBeLessThan(doct.startingSalary);
  });

  it('extended degrees match their non-extended counterparts', () => {
    const bach  = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 7);
    const bachX = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 22);
    expect(bach.startingSalary).toBe(bachX.startingSalary);

    const mast  = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 9);
    const mastX = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 23);
    expect(mast.startingSalary).toBe(mastX.startingSalary);
  });

  it('doctoral sub-type levels (17, 18, 19, 24) produce equal salary', () => {
    const doctoralLevels = [17, 18, 19, 24];
    const salaries = doctoralLevels.map(lvl =>
      EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, lvl).startingSalary
    );
    expect(new Set(salaries).size).toBe(1);
  });

  it('post-baccalaureate certificate (level 8) salary is between bachelor and master', () => {
    const bach = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 7);
    const postBac = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 8);
    const doct = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 9);
    expect(postBac.startingSalary).toBeGreaterThan(bach.startingSalary);
    expect(postBac.startingSalary).toBeLessThan(doct.startingSalary);
  });

  it('occupational awards/certs have expected ordering', () => {
    const occ1 = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 30); // < 1yr occupational
    const occ2 = EnhancedEarningsCalculator.estimateSalaryFromCip(CIP, 31); // 1-4yr occupational
    expect(occ1.startingSalary).toBeLessThanOrEqual(occ2.startingSalary);
  });
});
