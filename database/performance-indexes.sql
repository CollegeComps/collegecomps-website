-- Performance Optimization: Indexes and Views for Historical Trends
-- ===================================================================

-- 1. INDEXES for financial_data table
-- -------------------------------------

-- Index on year for fast year-based queries
CREATE INDEX IF NOT EXISTS idx_financial_year ON financial_data(year);

-- Index on unitid for joins
CREATE INDEX IF NOT EXISTS idx_financial_unitid ON financial_data(unitid);

-- Composite index for year + tuition filtering (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_financial_year_tuition 
ON financial_data(year, tuition_in_state, tuition_out_state);

-- Index for year + unitid for aggregations
CREATE INDEX IF NOT EXISTS idx_financial_year_unitid 
ON financial_data(year, unitid);


-- 2. INDEXES for academic_programs table
-- ---------------------------------------

-- Index on CIP code for grouping
CREATE INDEX IF NOT EXISTS idx_programs_cipcode ON academic_programs(cipcode);

-- Index on completions for sorting
CREATE INDEX IF NOT EXISTS idx_programs_completions ON academic_programs(completions);

-- Composite index for top programs query
CREATE INDEX IF NOT EXISTS idx_programs_cip_completions 
ON academic_programs(cipcode, completions, cip_title);

-- Index for unitid joins
CREATE INDEX IF NOT EXISTS idx_programs_unitid ON academic_programs(unitid);


-- 3. INDEXES for salary_submissions table (users DB)
-- --------------------------------------------------

-- Index on is_approved for filtering
CREATE INDEX IF NOT EXISTS idx_salary_approved ON salary_submissions(is_approved);

-- Index on current_salary for aggregations
CREATE INDEX IF NOT EXISTS idx_salary_amount ON salary_submissions(current_salary);

-- Composite index for approved + salary filtering
CREATE INDEX IF NOT EXISTS idx_salary_approved_amount 
ON salary_submissions(is_approved, current_salary);

-- Index for graduation year trends
CREATE INDEX IF NOT EXISTS idx_salary_grad_year ON salary_submissions(graduation_year);

-- Index for years of experience
CREATE INDEX IF NOT EXISTS idx_salary_experience ON salary_submissions(years_experience);


-- 4. PRE-AGGREGATED VIEW for Historical Cost Trends
-- --------------------------------------------------

-- This view pre-calculates yearly averages for instant retrieval
-- Note: Turso doesn't support materialized views, so we'll use a regular view
-- and cache the results in the application layer

CREATE VIEW IF NOT EXISTS v_yearly_cost_trends AS
SELECT 
    f.year,
    COUNT(DISTINCT f.unitid) as school_count,
    AVG(COALESCE(f.tuition_out_state, f.tuition_in_state, 0)) as avg_tuition,
    AVG(COALESCE(f.fees, 0)) as avg_fees,
    AVG(COALESCE(f.room_board_on_campus, 0)) as avg_room_board,
    AVG(COALESCE(f.tuition_out_state, f.tuition_in_state, 0) + 
        COALESCE(f.fees, 0) + 
        COALESCE(f.room_board_on_campus, 0)) as avg_total_cost,
    MIN(f.year) OVER () as earliest_year,
    MAX(f.year) OVER () as latest_year
FROM financial_data f
WHERE f.year IS NOT NULL 
    AND (f.tuition_in_state IS NOT NULL OR f.tuition_out_state IS NOT NULL)
GROUP BY f.year;


-- 5. PRE-AGGREGATED VIEW for Top Programs by Completions
-- --------------------------------------------------------

CREATE VIEW IF NOT EXISTS v_top_programs_by_completions AS
SELECT 
    ap.cipcode,
    ap.cip_title as program_name,
    SUM(ap.completions) as total_completions,
    COUNT(DISTINCT ap.unitid) as school_count,
    AVG(ap.completions) as avg_completions,
    RANK() OVER (ORDER BY SUM(ap.completions) DESC) as program_rank
FROM academic_programs ap
WHERE ap.cip_title IS NOT NULL 
    AND ap.completions > 0
GROUP BY ap.cipcode, ap.cip_title;


-- 6. SALARY SUBMISSIONS SUMMARY VIEW (for users DB)
-- --------------------------------------------------

CREATE VIEW IF NOT EXISTS v_salary_submissions_summary AS
SELECT 
    COUNT(*) as total_submissions,
    COUNT(CASE WHEN is_approved = 1 THEN 1 END) as approved_submissions,
    AVG(CASE WHEN is_approved = 1 THEN current_salary END) as avg_approved_salary,
    MIN(graduation_year) as earliest_grad_year,
    MAX(graduation_year) as latest_grad_year,
    AVG(CASE WHEN is_approved = 1 THEN COALESCE(years_experience, years_since_graduation) END) as avg_years_out
FROM salary_submissions
WHERE current_salary > 0;


-- 7. ANALYZE TABLES for query optimization
-- -----------------------------------------

ANALYZE financial_data;
ANALYZE academic_programs;
ANALYZE salary_submissions;


-- Usage Examples:
-- ===============

-- Fast yearly cost trends (uses view):
-- SELECT * FROM v_yearly_cost_trends ORDER BY year DESC LIMIT 5;

-- Fast top programs (uses view):
-- SELECT * FROM v_top_programs_by_completions WHERE program_rank <= 10;

-- Fast salary summary (uses view):
-- SELECT * FROM v_salary_submissions_summary;
