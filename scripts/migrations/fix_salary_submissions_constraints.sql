-- ENG-325: Fix NOT NULL constraints on salary_submissions table
-- Allow NULL for degree-related fields when has_degree = 0

-- SQLite doesn't support ALTER COLUMN, so we need to recreate the table

-- Step 0: Drop dependent views
DROP VIEW IF EXISTS v_salary_submissions_summary;

-- Step 1: Create new table with corrected constraints
CREATE TABLE salary_submissions_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    institution_name TEXT, -- Allow NULL for non-degree
    major TEXT, -- Allow NULL for non-degree
    degree_level TEXT CHECK(degree_level IN ('Associate', 'Bachelor', 'Master', 'Doctorate', 'Professional')),
    graduation_year INTEGER, -- Allow NULL for non-degree
    years_since_graduation INTEGER, -- Allow NULL for non-degree
    current_salary INTEGER NOT NULL,
    total_compensation INTEGER,
    job_title TEXT,
    industry TEXT,
    location_city TEXT,
    location_state TEXT,
    is_approved INTEGER DEFAULT 0,
    is_public INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    has_degree INTEGER DEFAULT 1,
    years_experience INTEGER,
    additional_degrees TEXT,
    company_name TEXT,
    company_size TEXT,
    remote_status TEXT,
    student_debt_remaining INTEGER,
    student_debt_original INTEGER,
    data_quality_score REAL DEFAULT 100.0,
    moderation_status TEXT DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Step 2: Copy all existing data
INSERT INTO salary_submissions_new 
SELECT * FROM salary_submissions;

-- Step 3: Drop old table
DROP TABLE salary_submissions;

-- Step 4: Rename new table to original name
ALTER TABLE salary_submissions_new RENAME TO salary_submissions;

-- Step 5: Create indexes for performance
CREATE INDEX idx_salary_submissions_user_id ON salary_submissions(user_id);
CREATE INDEX idx_salary_submissions_institution ON salary_submissions(institution_name);
CREATE INDEX idx_salary_submissions_major ON salary_submissions(major);
CREATE INDEX idx_salary_submissions_approved ON salary_submissions(is_approved, is_public);

-- Step 6: Recreate the view
CREATE VIEW v_salary_submissions_summary AS
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
