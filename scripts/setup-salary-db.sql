-- User salary submissions table (the gold mine!)
CREATE TABLE IF NOT EXISTS salary_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  
  -- Educational background
  institution_name TEXT NOT NULL,
  degree_level TEXT NOT NULL, -- 'bachelors', 'masters', 'phd', 'professional'
  major TEXT NOT NULL,
  graduation_year INTEGER NOT NULL,
  
  -- Salary data
  current_salary INTEGER NOT NULL, -- Annual salary in USD
  years_since_graduation INTEGER NOT NULL, -- 1, 5, 10, 15, 20+
  total_compensation INTEGER, -- Including bonuses, stock, etc.
  
  -- Job details
  job_title TEXT,
  company_name TEXT,
  industry TEXT,
  company_size TEXT, -- 'startup', 'small', 'medium', 'large', 'enterprise'
  location_city TEXT,
  location_state TEXT,
  remote_status TEXT, -- 'remote', 'hybrid', 'onsite'
  
  -- Financial details (optional)
  student_debt_remaining INTEGER,
  student_debt_original INTEGER,
  
  -- Verification & quality
  is_verified BOOLEAN DEFAULT 0,
  verification_method TEXT, -- 'email', 'linkedin', 'paystub', 'tax_document'
  data_quality_score REAL DEFAULT 0.0, -- Algorithm to detect fake submissions
  
  -- Privacy & moderation
  is_public BOOLEAN DEFAULT 1,
  is_approved BOOLEAN DEFAULT 0,
  moderation_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'flagged'
  moderation_notes TEXT,
  
  -- Metadata
  submission_source TEXT DEFAULT 'web', -- 'web', 'mobile', 'api'
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_salary_submissions_user ON salary_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_salary_submissions_major ON salary_submissions(major);
CREATE INDEX IF NOT EXISTS idx_salary_submissions_institution ON salary_submissions(institution_name);
CREATE INDEX IF NOT EXISTS idx_salary_submissions_years ON salary_submissions(years_since_graduation);
CREATE INDEX IF NOT EXISTS idx_salary_submissions_graduation_year ON salary_submissions(graduation_year);
CREATE INDEX IF NOT EXISTS idx_salary_submissions_approved ON salary_submissions(is_approved, is_public);

-- Aggregate views for fast queries (materialized view concept)
CREATE TABLE IF NOT EXISTS salary_aggregates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Grouping keys
  major TEXT NOT NULL,
  institution_name TEXT,
  degree_level TEXT,
  years_since_graduation INTEGER NOT NULL,
  
  -- Aggregated stats
  sample_size INTEGER NOT NULL,
  avg_salary REAL NOT NULL,
  median_salary REAL,
  p25_salary REAL, -- 25th percentile
  p75_salary REAL, -- 75th percentile
  min_salary INTEGER,
  max_salary INTEGER,
  
  -- Metadata
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(major, institution_name, degree_level, years_since_graduation)
);

CREATE INDEX IF NOT EXISTS idx_salary_aggregates_major ON salary_aggregates(major);
CREATE INDEX IF NOT EXISTS idx_salary_aggregates_years ON salary_aggregates(years_since_graduation);

-- User submission tracking (prevent spam/fraud)
CREATE TABLE IF NOT EXISTS user_submission_stats (
  user_id INTEGER PRIMARY KEY,
  total_submissions INTEGER DEFAULT 0,
  verified_submissions INTEGER DEFAULT 0,
  rejected_submissions INTEGER DEFAULT 0,
  last_submission_date DATETIME,
  reputation_score REAL DEFAULT 100.0, -- Decreases with rejected submissions
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Salary trends over time (for analytics)
CREATE TABLE IF NOT EXISTS salary_trends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  major TEXT NOT NULL,
  year INTEGER NOT NULL,
  avg_starting_salary REAL,
  avg_5yr_salary REAL,
  avg_10yr_salary REAL,
  avg_15yr_salary REAL,
  avg_20yr_salary REAL,
  sample_size INTEGER,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(major, year)
);

-- Verification requests (for manual review)
CREATE TABLE IF NOT EXISTS verification_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  verification_type TEXT NOT NULL, -- 'linkedin', 'paystub', 'tax_form'
  document_url TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by INTEGER,
  reviewed_at DATETIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (submission_id) REFERENCES salary_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
