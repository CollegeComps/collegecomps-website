-- Add bookmarked colleges table
CREATE TABLE IF NOT EXISTS bookmarked_colleges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  unitid INTEGER NOT NULL,
  institution_name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  control TEXT,
  notes TEXT,
  tags TEXT DEFAULT '[]', -- JSON array of user tags
  bookmarked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, unitid)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bookmarked_colleges_user ON bookmarked_colleges(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarked_colleges_unitid ON bookmarked_colleges(unitid);
