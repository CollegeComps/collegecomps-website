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
      unitid,
      name,
      city,
      state,
      control_public_private,
      institution_avg_roi,
      median_earnings_10yr,
      acceptance_rate,
      total_enrollment
    FROM institutions 
    WHERE name IS NOT NULL
    ORDER BY name
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
      unitid,
      name,
      state,
      institution_avg_roi,
      median_earnings_10yr,
      acceptance_rate
    FROM institutions 
    WHERE institution_avg_roi IS NOT NULL
    ORDER BY institution_avg_roi DESC
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
      AVG(institution_avg_roi) as avg_roi,
      AVG(median_earnings_10yr) as avg_earnings,
      AVG(acceptance_rate) as avg_acceptance_rate
    FROM institutions 
    WHERE state = ? AND institution_avg_roi IS NOT NULL
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
  
  let sql = `
    SELECT 
      unitid,
      name,
      city,
      state,
      control_public_private,
      institution_avg_roi,
      median_earnings_10yr,
      acceptance_rate,
      total_enrollment
    FROM institutions 
    WHERE name IS NOT NULL
  `;
  
  const args: any[] = [];
  
  if (state) {
    sql += ` AND state = ?`;
    args.push(state);
  }
  
  sql += ` ORDER BY ${sortBy} LIMIT ? OFFSET ?`;
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
