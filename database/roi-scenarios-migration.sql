-- Add ROI scenarios table for saving and comparing different ROI calculations
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
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_roi_scenarios_user ON roi_scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_roi_scenarios_unitid ON roi_scenarios(unitid);
CREATE INDEX IF NOT EXISTS idx_roi_scenarios_draft ON roi_scenarios(user_id, is_draft);
