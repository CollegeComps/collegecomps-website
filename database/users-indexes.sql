-- Performance Optimization: User Data Indexes and Views
-- ======================================================

-- 1. INDEXES for salary_submissions table
-- ----------------------------------------

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

-- Index for has_degree filtering
CREATE INDEX IF NOT EXISTS idx_salary_has_degree ON salary_submissions(has_degree);


-- 2. SALARY SUBMISSIONS SUMMARY VIEW
-- -----------------------------------

CREATE VIEW IF NOT EXISTS v_salary_submissions_summary AS
SELECT 
    COUNT(*) as total_submissions,
    COUNT(CASE WHEN is_approved = 1 THEN 1 END) as approved_submissions,
    AVG(CASE WHEN is_approved = 1 THEN current_salary END) as avg_approved_salary,
    MIN(graduation_year) as earliest_grad_year,
    MAX(graduation_year) as latest_grad_year,
    AVG(CASE WHEN is_approved = 1 THEN COALESCE(years_experience, years_since_graduation) END) as avg_years_out,
    COUNT(CASE WHEN is_approved = 1 AND has_degree = 0 THEN 1 END) as no_degree_submissions,
    AVG(CASE WHEN is_approved = 1 AND has_degree = 0 THEN current_salary END) as avg_salary_no_degree,
    AVG(CASE WHEN is_approved = 1 AND has_degree = 1 THEN current_salary END) as avg_salary_with_degree
FROM salary_submissions
WHERE current_salary > 0;
