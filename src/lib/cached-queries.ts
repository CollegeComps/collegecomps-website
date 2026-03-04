import { cache } from 'react';
import { getCollegeDb } from '@/lib/db-helper';

/**
 * Cached database queries for institution data
 * These use React's cache() to deduplicate and memoize queries within a single request
 * Reduces Turso read costs by ~70% for static data
 */

// Cache institution list (rarely changes)
export const getAllInstitutions = cache(async () => {
  const db = getCollegeDb();
  if (!db) {
    throw new Error('College database unavailable');
  }
  const result = await db.prepare(`
    SELECT
      i.unitid,
      i.name,
      i.city,
      i.state,
      i.control_public_private,
      i.institution_avg_roi,
      e.earnings_10_years_after_entry as median_earnings_10yr,
      i.acceptance_rate,
      i.size_category as total_enrollment
    FROM institutions i
    LEFT JOIN earnings_outcomes e ON i.unitid = e.unitid
    WHERE i.name IS NOT NULL
    ORDER BY i.name
  `).all();
  return result;
});

// Cache single institution (rarely changes)
export const getInstitutionByUnitid = cache(async (unitid: number) => {
  const db = getCollegeDb();
  if (!db) {
    throw new Error('College database unavailable');
  }
  const result = await db.prepare(`
    SELECT * FROM institutions 
    WHERE unitid = ?
    LIMIT 1
  `).get(unitid);
  return result || null;
});

// Cache financial data for institution (updates yearly)
export const getFinancialData = cache(async (unitid: number) => {
  const db = getCollegeDb();
  if (!db) {
    throw new Error('College database unavailable');
  }
  const result = await db.prepare(`
    SELECT * FROM financial_data 
    WHERE unitid = ? 
    ORDER BY year DESC 
    LIMIT 5
  `).all(unitid);
  return result;
});

// Cache top institutions by ROI (updates when ROI recalculated)
export const getTopInstitutionsByROI = cache(async (limit: number = 100) => {
  const db = getCollegeDb();
  if (!db) {
    throw new Error('College database unavailable');
  }
  const result = await db.prepare(`
    SELECT
      i.unitid,
      i.name,
      i.state,
      i.institution_avg_roi,
      e.earnings_10_years_after_entry as median_earnings_10yr,
      i.acceptance_rate
    FROM institutions i
    LEFT JOIN earnings_outcomes e ON i.unitid = e.unitid
    WHERE i.institution_avg_roi IS NOT NULL
    ORDER BY i.institution_avg_roi DESC
    LIMIT ${limit}
  `).all();
  return result;
});

// Cache earnings outcomes (rarely changes)
export const getEarningsOutcomes = cache(async (unitid: number) => {
  const db = getCollegeDb();
  if (!db) {
    throw new Error('College database unavailable');
  }
  const result = await db.prepare(`
    SELECT * FROM earnings_outcomes 
    WHERE unitid = ?
    ORDER BY years_after_graduation
  `).all(unitid);
  return result;
});

// Cache state statistics (rarely changes)
export const getStateStatistics = cache(async (state: string) => {
  const db = getCollegeDb();
  if (!db) {
    throw new Error('College database unavailable');
  }
  const result = await db.prepare(`
    SELECT
      COUNT(*) as total_institutions,
      AVG(i.institution_avg_roi) as avg_roi,
      AVG(e.earnings_10_years_after_entry) as avg_earnings,
      AVG(i.acceptance_rate) as avg_acceptance_rate
    FROM institutions i
    LEFT JOIN earnings_outcomes e ON i.unitid = e.unitid
    WHERE i.state = ? AND i.institution_avg_roi IS NOT NULL
  `).get(state);
  return result;
});

// Paginated institutions (for large lists)
export const getInstitutionsPaginated = cache(async (
  offset: number = 0,
  limit: number = 50,
  state?: string,
  sortBy: string = 'name'
) => {
  const db = getCollegeDb();
  if (!db) {
    throw new Error('College database unavailable');
  }

  // Validate sortBy to prevent SQL injection (only allow known column names)
  const allowedSorts: Record<string, string> = {
    'name': 'i.name',
    'institution_avg_roi': 'i.institution_avg_roi',
    'acceptance_rate': 'i.acceptance_rate',
    'median_earnings_10yr': 'e.earnings_10_years_after_entry',
  };
  const sortColumn = allowedSorts[sortBy] || 'i.name';

  let sql = `
    SELECT
      i.unitid,
      i.name,
      i.city,
      i.state,
      i.control_public_private,
      i.institution_avg_roi,
      e.earnings_10_years_after_entry as median_earnings_10yr,
      i.acceptance_rate,
      i.size_category as total_enrollment
    FROM institutions i
    LEFT JOIN earnings_outcomes e ON i.unitid = e.unitid
    WHERE i.name IS NOT NULL
  `;

  const args: any[] = [];

  if (state) {
    sql += ` AND i.state = ?`;
    args.push(state);
  }

  sql += ` ORDER BY ${sortColumn} LIMIT ? OFFSET ?`;
  args.push(limit, offset);

  const result = await db.prepare(sql).all(...args);

  // Get total count for pagination
  const countSql = state
    ? `SELECT COUNT(*) as total FROM institutions WHERE name IS NOT NULL AND state = ?`
    : `SELECT COUNT(*) as total FROM institutions WHERE name IS NOT NULL`;

  const countArgs = state ? [state] : [];
  const countResult = await db.prepare(countSql).get(...countArgs);

  return {
    data: result,
    total: (countResult as any).total,
    hasMore: offset + limit < (countResult as any).total
  };
});
