-- =============================================================================
-- Turso index migration for CollegeComps query optimization
-- =============================================================================
-- These are the specific indexes needed for the query patterns in the
-- optimized code. Safe to re-run.
-- =============================================================================

-- CRITICAL: Existing idx_financial_year_unitid is (year, unitid) which is the
-- wrong order for "latest year per unitid" lookups. We need unitid first so
-- Turso can seek by unitid and pick the max year in one index scan.
CREATE INDEX IF NOT EXISTS idx_financial_data_unitid_year_desc
  ON financial_data (unitid, year DESC);

-- State page query orders by institution_avg_roi but the existing index is on
-- implied_roi. Add a composite covering the ORDER BY.
CREATE INDEX IF NOT EXISTS idx_institutions_state_avg_roi
  ON institutions (state, institution_avg_roi DESC);

-- /programs/[cip] CTE filters by cipcode LIKE and sorts groups by program_roi.
-- Composite supports index-only filtering and grouping.
CREATE INDEX IF NOT EXISTS idx_academic_programs_cip_unitid_roi
  ON academic_programs (cipcode, unitid, program_roi DESC);

-- Note: Turso does not allow ANALYZE via shell. The planner will still
-- pick up the new indexes automatically.
