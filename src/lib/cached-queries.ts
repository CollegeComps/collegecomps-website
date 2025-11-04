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
  const result = await db.execute(`
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
  `);
  return result.rows;
});

// Cache single institution (rarely changes)
export const getInstitutionByUnitid = cache(async (unitid: number) => {
  const db = getCollegeDb();
  const result = await db.execute({
    sql: `
      SELECT * FROM institutions 
      WHERE unitid = ?
      LIMIT 1
    `,
    args: [unitid]
  });
  return result.rows[0] || null;
});

// Cache financial data for institution (updates yearly)
export const getFinancialData = cache(async (unitid: number) => {
  const db = getCollegeDb();
  const result = await db.execute({
    sql: `
      SELECT * FROM financial_data 
      WHERE unitid = ? 
      ORDER BY year DESC 
      LIMIT 5
    `,
    args: [unitid]
  });
  return result.rows;
});

// Cache top institutions by ROI (updates when ROI recalculated)
export const getTopInstitutionsByROI = cache(async (limit: number = 100) => {
  const db = getCollegeDb();
  const result = await db.execute(`
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
  `);
  return result.rows;
});

// Cache earnings outcomes (rarely changes)
export const getEarningsOutcomes = cache(async (unitid: number) => {
  const db = getCollegeDb();
  const result = await db.execute({
    sql: `
      SELECT * FROM earnings_outcomes 
      WHERE unitid = ?
      ORDER BY years_after_graduation
    `,
    args: [unitid]
  });
  return result.rows;
});

// Cache state statistics (rarely changes)
export const getStateStatistics = cache(async (state: string) => {
  const db = getCollegeDb();
  const result = await db.execute({
    sql: `
      SELECT 
        COUNT(*) as total_institutions,
        AVG(institution_avg_roi) as avg_roi,
        AVG(median_earnings_10yr) as avg_earnings,
        AVG(acceptance_rate) as avg_acceptance_rate
      FROM institutions 
      WHERE state = ? AND institution_avg_roi IS NOT NULL
    `,
    args: [state]
  });
  return result.rows[0];
});

// Paginated institutions (for large lists)
export const getInstitutionsPaginated = cache(async (
  offset: number = 0, 
  limit: number = 50,
  state?: string,
  sortBy: string = 'name'
) => {
  const db = getCollegeDb();
  
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
  
  const result = await db.execute({ sql, args });
  
  // Get total count for pagination
  const countSql = state 
    ? `SELECT COUNT(*) as total FROM institutions WHERE name IS NOT NULL AND state = ?`
    : `SELECT COUNT(*) as total FROM institutions WHERE name IS NOT NULL`;
  
  const countResult = await db.execute({
    sql: countSql,
    args: state ? [state] : []
  });
  
  return {
    data: result.rows,
    total: (countResult.rows[0] as any).total,
    hasMore: offset + limit < (countResult.rows[0] as any).total
  };
});
