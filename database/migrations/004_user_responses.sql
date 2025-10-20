-- Migration: Create user_responses table
-- Description: Store questionnaire/onboarding responses for personalized recommendations
-- Database: users.db (Turso)

-- Clean bad graduation years in salary_submissions
UPDATE salary_submissions 
SET graduation_year = 2025 
WHERE graduation_year > 2025;

-- Create user_responses table
CREATE TABLE IF NOT EXISTS user_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  gpa REAL,
  sat_score INTEGER,
  act_score INTEGER,
  zip_code TEXT,
  latitude REAL,
  longitude REAL,
  parent_income INTEGER,
  student_income INTEGER,
  preferred_states TEXT, -- JSON array of state codes
  preferred_major TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_responses_user_id ON user_responses(user_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_user_responses_timestamp 
AFTER UPDATE ON user_responses
BEGIN
  UPDATE user_responses SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
