/**
 * API Integration Tests
 * =====================
 * Tests API routes by mocking the database layer.
 * Verifies that:
 *   - Query parameters are correctly parsed
 *   - Credential level filters are applied
 *   - Edge cases (empty query, short query, missing params) are handled
 *   - Response shape is correct
 *
 * Run: npx vitest run src/tests/api-integration.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock database module ─────────────────────────────────────────────────────
// We intercept db calls so we can assert on the SQL/params without a real DB.

const capturedQueries: Array<{ sql: string; params: any[]; method: 'all' | 'get' | 'run' }> = [];

const mockDb = {
  prepare: (sql: string) => ({
    all: (...params: any[]) => {
      capturedQueries.push({ sql, params, method: 'all' });
      return Promise.resolve([]);
    },
    get: (...params: any[]) => {
      capturedQueries.push({ sql, params, method: 'get' });
      return Promise.resolve(null);
    },
    run: (...params: any[]) => {
      capturedQueries.push({ sql, params, method: 'run' });
      return Promise.resolve({ changes: 0, lastInsertRowid: 0 });
    },
  }),
};

vi.mock('@/lib/db-helper', () => ({
  getCollegeDb: () => mockDb,
  getUsersDb: () => mockDb,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeRequest(url: string): Request {
  return new Request(`http://localhost:3000${url}`);
}

function lastQuery() {
  return capturedQueries[capturedQueries.length - 1];
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('GET /api/programs/search', () => {
  beforeEach(() => {
    capturedQueries.length = 0;
    vi.resetModules();
  });

  it('returns empty array for query shorter than 2 chars', async () => {
    const { GET } = await import('@/app/api/programs/search/route');
    const req = makeRequest('/api/programs/search?q=a');
    const res = await GET(req as any);
    const json = await res.json();
    expect(json.programs).toEqual([]);
    expect(capturedQueries.length).toBe(0);
  });

  it('returns empty array for missing query', async () => {
    const { GET } = await import('@/app/api/programs/search/route');
    const req = makeRequest('/api/programs/search');
    const res = await GET(req as any);
    const json = await res.json();
    expect(json.programs).toEqual([]);
    expect(capturedQueries.length).toBe(0);
  });

  it('queries the programs_search_cache table for a valid query', async () => {
    const { GET } = await import('@/app/api/programs/search/route');
    const req = makeRequest('/api/programs/search?q=nursing');
    await GET(req as any);
    const q = lastQuery();
    expect(q?.sql).toContain('programs_search_cache');
  });

  it('uses bachelors credential filter containing level 5', async () => {
    const { GET } = await import('@/app/api/programs/search/route');
    const req = makeRequest('/api/programs/search?q=nursing&degreeLevel=bachelors');
    await GET(req as any);
    // Find the query that references academic_programs for the credential filter
    const credQuery = capturedQueries.find(q => q.sql.includes('credential_level') && q.sql.includes('academic_programs'));
    // The credential filter is embedded in the main SQL via EXISTS, so check the main cache query
    const cacheQuery = capturedQueries.find(q => q.sql.includes('programs_search_cache'));
    expect(cacheQuery?.sql).toContain('5');   // level 5 = standard Bachelor
    expect(cacheQuery?.sql).toContain('22');  // level 22 = extended Bachelor
  });

  it('uses associates credential filter containing levels 3 and 4', async () => {
    const { GET } = await import('@/app/api/programs/search/route');
    const req = makeRequest('/api/programs/search?q=nursing&degreeLevel=associates');
    await GET(req as any);
    const cacheQuery = capturedQueries.find(q => q.sql.includes('programs_search_cache'));
    expect(cacheQuery?.sql).toContain('3');
    expect(cacheQuery?.sql).toContain('4');
  });

  it('uses masters credential filter containing levels 7 and 23', async () => {
    const { GET } = await import('@/app/api/programs/search/route');
    const req = makeRequest('/api/programs/search?q=business&degreeLevel=masters');
    await GET(req as any);
    const cacheQuery = capturedQueries.find(q => q.sql.includes('programs_search_cache'));
    expect(cacheQuery?.sql).toContain('7');
    expect(cacheQuery?.sql).toContain('23');
  });

  it('uses doctorate credential filter with correct IPEDS codes', async () => {
    const { GET } = await import('@/app/api/programs/search/route');
    const req = makeRequest('/api/programs/search?q=psychology&degreeLevel=doctorate');
    await GET(req as any);
    const cacheQuery = capturedQueries.find(q => q.sql.includes('programs_search_cache'));
    expect(cacheQuery?.sql).toContain('17');  // research/scholarship
    expect(cacheQuery?.sql).toContain('18');  // professional practice
    expect(cacheQuery?.sql).not.toContain('24'); // old wrong code
    expect(cacheQuery?.sql).not.toContain(' 33'); // old wrong code (33 is a cert)
  });

  it('applies no credential filter when degreeLevel is empty', async () => {
    const { GET } = await import('@/app/api/programs/search/route');
    const req = makeRequest('/api/programs/search?q=nursing&degreeLevel=');
    await GET(req as any);
    const cacheQuery = capturedQueries.find(q => q.sql.includes('programs_search_cache'));
    // Should NOT have an EXISTS credential clause
    expect(cacheQuery?.sql).not.toContain('credential_level');
  });

  it('returns programs array in response', async () => {
    const { GET } = await import('@/app/api/programs/search/route');
    const req = makeRequest('/api/programs/search?q=nursing');
    const res = await GET(req as any);
    const json = await res.json();
    expect(json).toHaveProperty('programs');
    expect(Array.isArray(json.programs)).toBe(true);
  });
});

describe('GET /api/programs (by institution)', () => {
  beforeEach(() => {
    capturedQueries.length = 0;
    vi.resetModules();
  });

  it('returns 400 when unitid is missing', async () => {
    const { GET } = await import('@/app/api/programs/route');
    const req = makeRequest('/api/programs');
    const res = await GET(req as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when unitid is not a number', async () => {
    const { GET } = await import('@/app/api/programs/route');
    const req = makeRequest('/api/programs?unitid=abc');
    const res = await GET(req as any);
    expect(res.status).toBe(400);
  });

  it('queries programs_safe_view with bachelors credential filter', async () => {
    const { GET } = await import('@/app/api/programs/route');
    const req = makeRequest('/api/programs?unitid=228778&degreeLevel=bachelors');
    await GET(req as any);
    const q = lastQuery();
    expect(q?.sql).toContain('programs_safe_view');
    expect(q?.sql).toContain('5');   // standard Bachelor
    expect(q?.sql).toContain('22');
  });

  it('queries programs_safe_view with masters credential filter', async () => {
    const { GET } = await import('@/app/api/programs/route');
    const req = makeRequest('/api/programs?unitid=228778&degreeLevel=masters');
    await GET(req as any);
    const q = lastQuery();
    expect(q?.sql).toContain('7');
    expect(q?.sql).toContain('23');
  });

  it('returns all programs when no degreeLevel specified', async () => {
    const { GET } = await import('@/app/api/programs/route');
    const req = makeRequest('/api/programs?unitid=228778');
    await GET(req as any);
    const q = lastQuery();
    expect(q?.sql).not.toContain('credential_level');
  });
});

describe('GET /api/institutions/search', () => {
  beforeEach(() => {
    capturedQueries.length = 0;
    vi.resetModules();
  });

  it('returns empty array for query < 2 chars', async () => {
    const { GET } = await import('@/app/api/institutions/search/route');
    const req = makeRequest('/api/institutions/search?q=a');
    const res = await GET(req as any);
    const json = await res.json();
    expect(json.institutions).toEqual([]);
    expect(capturedQueries.length).toBe(0);
  });

  it('uses LIKE query on institution name', async () => {
    const { GET } = await import('@/app/api/institutions/search/route');
    const req = makeRequest('/api/institutions/search?q=Harvard');
    await GET(req as any);
    const q = lastQuery();
    expect(q?.sql).toContain('LIKE');
    expect(q?.sql).toContain('institutions');
  });

  it('normalizes ampersands (A&M vs A & M)', async () => {
    const { GET } = await import('@/app/api/institutions/search/route');
    const req = makeRequest('/api/institutions/search?q=Texas+A%26M');
    await GET(req as any);
    const q = lastQuery();
    // The query should normalize the name: replace ' & ' with '&'
    expect(q?.sql).toContain('REPLACE');
  });
});

describe('GET /api/majors/search', () => {
  beforeEach(() => {
    capturedQueries.length = 0;
    vi.resetModules();
  });

  it('returns empty array for query < 2 chars', async () => {
    const { GET } = await import('@/app/api/majors/search/route');
    const req = makeRequest('/api/majors/search?q=a');
    const res = await GET(req as any);
    const json = await res.json();
    expect(json.majors).toEqual([]);
  });

  it('queries academic_programs for matching titles', async () => {
    const { GET } = await import('@/app/api/majors/search/route');
    const req = makeRequest('/api/majors/search?q=nursing');
    await GET(req as any);
    const q = lastQuery();
    expect(q?.sql).toContain('academic_programs');
    expect(q?.sql).toContain('LIKE');
  });

  it('applies bachelors filter with correct credential levels including 5', async () => {
    const { GET } = await import('@/app/api/majors/search/route');
    const req = makeRequest('/api/majors/search?q=nursing&degreeLevel=bachelors');
    await GET(req as any);
    const q = lastQuery();
    expect(q?.sql).toContain('5');
    expect(q?.sql).toContain('22');
    // Level 31 is an occupational certificate, not a bachelor's degree
    expect(q?.sql).not.toContain('31');
  });

  it('applies associates filter with credential levels 3 and 4', async () => {
    const { GET } = await import('@/app/api/majors/search/route');
    const req = makeRequest('/api/majors/search?q=nursing&degreeLevel=associates');
    await GET(req as any);
    const q = lastQuery();
    expect(q?.sql).toContain('3');
    expect(q?.sql).toContain('4');
  });

  it('returns majors array in response', async () => {
    const { GET } = await import('@/app/api/majors/search/route');
    const req = makeRequest('/api/majors/search?q=nursing');
    const res = await GET(req as any);
    const json = await res.json();
    expect(json).toHaveProperty('majors');
    expect(Array.isArray(json.majors)).toBe(true);
  });
});

describe('GET /api/programs/institutions', () => {
  beforeEach(() => {
    capturedQueries.length = 0;
    vi.resetModules();
  });

  it('returns 400 when cipcode is missing', async () => {
    const { GET } = await import('@/app/api/programs/institutions/route');
    const req = makeRequest('/api/programs/institutions');
    const res = await GET(req as any);
    expect(res.status).toBe(400);
  });

  it('uses INNER JOIN to find institutions offering the program', async () => {
    const { GET } = await import('@/app/api/programs/institutions/route');
    const req = makeRequest('/api/programs/institutions?cipcode=51.3801');
    await GET(req as any);
    const q = lastQuery();
    expect(q?.sql).toContain('INNER JOIN');
    expect(q?.sql).toContain('academic_programs');
  });

  it('applies bachelors filter with level 5 for cipcode lookup', async () => {
    const { GET } = await import('@/app/api/programs/institutions/route');
    const req = makeRequest('/api/programs/institutions?cipcode=51.3801&degreeLevel=bachelors');
    await GET(req as any);
    const q = lastQuery();
    expect(q?.sql).toContain('5');
  });
});
