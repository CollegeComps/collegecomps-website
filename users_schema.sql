-- Users Database Schema
-- This database stores user authentication and user-specific data

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  image TEXT,
  email_verified INTEGER DEFAULT 0,
  subscription_tier TEXT DEFAULT 'free' CHECK(subscription_tier IN ('free', 'basic', 'premium')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  academic_level TEXT CHECK(academic_level IN ('high_school', 'undergraduate', 'graduate', 'other')),
  intended_major TEXT,
  graduation_year INTEGER,
  gpa REAL,
  sat_score INTEGER,
  act_score INTEGER,
  bio TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Saved comparisons
CREATE TABLE IF NOT EXISTS saved_comparisons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  institutions TEXT NOT NULL, -- JSON array of unitids
  notes TEXT,
  folder_id INTEGER,
  tags TEXT DEFAULT '[]', -- JSON array of tags
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES comparison_folders(id) ON DELETE SET NULL
);

-- Comparison folders for organization
CREATE TABLE IF NOT EXISTS comparison_folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'folder',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Salary submissions (crowdsourced data)
CREATE TABLE IF NOT EXISTS salary_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  institution_name TEXT NOT NULL,
  major TEXT NOT NULL,
  degree_level TEXT CHECK(degree_level IN ('Associate', 'Bachelor', 'Master', 'Doctorate', 'Professional')),
  graduation_year INTEGER NOT NULL,
  years_since_graduation INTEGER NOT NULL,
  current_salary INTEGER NOT NULL,
  total_compensation INTEGER,
  job_title TEXT,
  industry TEXT,
  location_city TEXT,
  location_state TEXT,
  is_approved INTEGER DEFAULT 0,
  is_public INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK(category IN ('technical', 'billing', 'data', 'feature_request', 'other')),
  status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Support ticket messages
CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  is_staff INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Alert preferences
CREATE TABLE IF NOT EXISTS alert_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  price_changes INTEGER DEFAULT 1,
  new_salary_data INTEGER DEFAULT 1,
  admission_updates INTEGER DEFAULT 0,
  deadline_reminders INTEGER DEFAULT 1,
  email_notifications INTEGER DEFAULT 1,
  sms_notifications INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User timeline/deadlines
CREATE TABLE IF NOT EXISTS user_deadlines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  institution_name TEXT NOT NULL,
  deadline_type TEXT CHECK(deadline_type IN ('application', 'financial_aid', 'housing', 'decision', 'other')),
  deadline_date DATE NOT NULL,
  notes TEXT,
  completed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Shared comparisons (for export/share feature)
CREATE TABLE IF NOT EXISTS shared_comparisons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comparison_id INTEGER NOT NULL,
  share_token TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  expires_at TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (comparison_id) REFERENCES saved_comparisons(id) ON DELETE CASCADE
);

-- User analytics/usage stats
CREATE TABLE IF NOT EXISTS user_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  metadata TEXT, -- JSON object
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_comparisons_user_id ON saved_comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_salary_submissions_institution ON salary_submissions(institution_name);
CREATE INDEX IF NOT EXISTS idx_salary_submissions_major ON salary_submissions(major);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_user_deadlines_user_id ON user_deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_user_deadlines_date ON user_deadlines(deadline_date);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
