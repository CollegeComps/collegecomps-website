-- Create user_profiles table for AI recommendations
CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    gpa REAL,
    sat INTEGER,
    act INTEGER,
    budget REAL,
    location_preference TEXT,
    program_interest TEXT,
    career_goals TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
