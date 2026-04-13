-- =============================================================================
-- Turso/SQLite index recommendations for CollegeComps
-- =============================================================================
-- Run these against your production Turso database to dramatically reduce
-- row reads. They support the query patterns used across the site.
--
-- To apply:
--   turso db shell <your-db-name> < scripts/turso-indexes.sql
--
-- All indexes use IF NOT EXISTS so re-running is safe.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- financial_data: the most scanned table. Indexing (unitid, year DESC) supports
-- "get latest year per institution" — the #1 hot pattern across the codebase.
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_financial_data_unitid_year
  ON financial_data (unitid, year DESC);

-- For the tuition-range scans used by /api/dashboard/stats
CREATE INDEX IF NOT EXISTS idx_financial_data_tuition_in
  ON financial_data (tuition_in_state);

-- -----------------------------------------------------------------------------
-- institutions: filtering by state and name are the two most common patterns.
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_institutions_state
  ON institutions (state);

CREATE INDEX IF NOT EXISTS idx_institutions_control
  ON institutions (control_public_private);

-- Supports the /colleges/state/[state] top-ROI ordering — Turso can read the
-- index forward and skip the sort entirely.
CREATE INDEX IF NOT EXISTS idx_institutions_state_roi
  ON institutions (state, institution_avg_roi DESC);

-- LIKE '%...%' on name cannot use a normal index, but prefix LIKE can.
-- NOCASE makes case-insensitive LIKE use the index.
CREATE INDEX IF NOT EXISTS idx_institutions_name_nocase
  ON institutions (name COLLATE NOCASE);

-- -----------------------------------------------------------------------------
-- academic_programs: /programs/[cip] filters by cipcode LIKE 'NN%'. A standard
-- index on cipcode supports prefix matching.
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_academic_programs_cipcode
  ON academic_programs (cipcode);

-- Joining programs to institutions by unitid
CREATE INDEX IF NOT EXISTS idx_academic_programs_unitid
  ON academic_programs (unitid);

-- Composite: supports the /programs/[cip] CTE which groups by unitid after
-- filtering by cipcode and sorts by program_roi.
CREATE INDEX IF NOT EXISTS idx_academic_programs_cip_unitid_roi
  ON academic_programs (cipcode, unitid, program_roi DESC);

-- -----------------------------------------------------------------------------
-- earnings_outcomes: most queries left-join by unitid
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_earnings_outcomes_unitid
  ON earnings_outcomes (unitid);

-- -----------------------------------------------------------------------------
-- Verify indexes were created
-- -----------------------------------------------------------------------------
SELECT name, tbl_name FROM sqlite_master
WHERE type = 'index' AND name LIKE 'idx_%'
ORDER BY tbl_name, name;

-- -----------------------------------------------------------------------------
-- Optional: run ANALYZE so the query planner has fresh statistics
-- -----------------------------------------------------------------------------
ANALYZE;
