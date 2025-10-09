-- Performance Optimization: College Data Indexes and Views
-- ==========================================================

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


-- 3. PRE-AGGREGATED VIEW for Historical Cost Trends
-- --------------------------------------------------

CREATE VIEW IF NOT EXISTS v_yearly_cost_trends AS
SELECT 
    f.year,
    COUNT(DISTINCT f.unitid) as school_count,
    AVG(COALESCE(f.tuition_out_state, f.tuition_in_state, 0)) as avg_tuition,
    AVG(COALESCE(f.fees, 0)) as avg_fees,
    AVG(COALESCE(f.room_board_on_campus, 0)) as avg_room_board,
    AVG(COALESCE(f.tuition_out_state, f.tuition_in_state, 0) + 
        COALESCE(f.fees, 0) + 
        COALESCE(f.room_board_on_campus, 0)) as avg_total_cost
FROM financial_data f
WHERE f.year IS NOT NULL 
    AND (f.tuition_in_state IS NOT NULL OR f.tuition_out_state IS NOT NULL)
GROUP BY f.year;


-- 4. PRE-AGGREGATED VIEW for Top Programs by Completions
-- --------------------------------------------------------

CREATE VIEW IF NOT EXISTS v_top_programs_by_completions AS
SELECT 
    ap.cipcode,
    ap.cip_title as program_name,
    SUM(ap.completions) as total_completions,
    COUNT(DISTINCT ap.unitid) as school_count,
    AVG(ap.completions) as avg_completions
FROM academic_programs ap
WHERE ap.cip_title IS NOT NULL 
    AND ap.completions > 0
GROUP BY ap.cipcode, ap.cip_title
ORDER BY total_completions DESC;
