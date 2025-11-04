-- Migration: Add missing tables for production
-- Created: 2025-11-03
-- Tables: user_submission_stats, bookmarked_colleges, roi_scenarios

-- =====================================================
-- Migration: Add Missing Database Tables
-- Date: 2025-01-20
-- Purpose: Add user_submission_stats, bookmarked_colleges, and roi_scenarios tables
-- =====================================================

-- Table 1: user_submission_stats
-- Purpose: Track user submission history and reputation for spam prevention
CREATE TABLE IF NOT EXISTS user_submission_stats (
    user_id INTEGER PRIMARY KEY,
    total_submissions INTEGER DEFAULT 0,
    verified_submissions INTEGER DEFAULT 0,
    rejected_submissions INTEGER DEFAULT 0,
    last_submission_date DATETIME,
    reputation_score REAL DEFAULT 100.0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_submission_stats_user ON user_submission_stats(user_id);

-- ====================================================================
-- BOOKMARKED COLLEGES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS bookmarked_colleges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  unitid INTEGER NOT NULL,
  institution_name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  control TEXT,
  notes TEXT,
  tags TEXT DEFAULT '[]',
  bookmarked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, unitid)
);

CREATE INDEX IF NOT EXISTS idx_bookmarked_colleges_user ON bookmarked_colleges(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarked_colleges_unitid ON bookmarked_colleges(unitid);

-- ====================================================================
-- ROI SCENARIOS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS roi_scenarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  unitid INTEGER NOT NULL,
  institution_name TEXT NOT NULL,
  scenario_name TEXT NOT NULL,
  major TEXT,
  degree_level TEXT,
  
  -- Cost Inputs
  tuition_cost REAL,
  room_board REAL,
  books_supplies REAL,
  other_costs REAL,
  total_cost_per_year REAL,
  years_to_complete INTEGER DEFAULT 4,
  
  -- Aid Inputs
  scholarship_amount REAL DEFAULT 0,
  grants_amount REAL DEFAULT 0,
  work_study REAL DEFAULT 0,
  loans_amount REAL DEFAULT 0,
  net_cost_per_year REAL,
  
  -- Earnings Inputs
  starting_salary REAL,
  salary_growth_rate REAL DEFAULT 0.03,
  years_to_calculate INTEGER DEFAULT 10,
  
  -- Calculated Outputs
  total_investment REAL,
  total_lifetime_earnings REAL,
  roi_value REAL,
  roi_percentage REAL,
  break_even_years REAL,
  
  -- Metadata
  is_draft INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, scenario_name, unitid)
);

CREATE INDEX IF NOT EXISTS idx_roi_scenarios_user ON roi_scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_roi_scenarios_unitid ON roi_scenarios(unitid);
CREATE INDEX IF NOT EXISTS idx_roi_scenarios_created ON roi_scenarios(created_at);
