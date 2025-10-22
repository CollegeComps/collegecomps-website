-- Scholarship Matching System Database Schema
-- ============================================

-- Scholarships table: stores all available scholarships
CREATE TABLE IF NOT EXISTS scholarships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    organization TEXT NOT NULL,
    amount_min INTEGER,  -- Minimum award amount in dollars
    amount_max INTEGER,  -- Maximum award amount in dollars
    deadline TEXT,  -- Application deadline (YYYY-MM-DD)
    renewable BOOLEAN DEFAULT 0,  -- Can be renewed annually
    
    -- Eligibility Criteria
    gpa_min REAL,  -- Minimum GPA (0.0-4.0 scale)
    income_max INTEGER,  -- Maximum family income
    
    -- Demographics
    gender TEXT CHECK(gender IN ('any', 'male', 'female', 'non-binary')),
    ethnicity TEXT,  -- Comma-separated: 'any', 'hispanic', 'black', 'asian', 'native', 'white'
    first_generation BOOLEAN,  -- First generation college student
    
    -- Academic
    major_category TEXT,  -- STEM, Business, Health, Arts, Humanities, Social Sciences, Education
    major_specific TEXT,  -- Specific majors (comma-separated)
    
    -- Geographic
    state_residency TEXT,  -- Comma-separated state codes or 'any'
    
    -- Activities/Achievements
    requires_community_service BOOLEAN DEFAULT 0,
    requires_essay BOOLEAN DEFAULT 1,
    requires_leadership BOOLEAN DEFAULT 0,
    requires_athletics BOOLEAN DEFAULT 0,
    
    -- Details
    description TEXT,
    website_url TEXT,
    
    -- Meta
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT 1
);

-- Student Profiles table: stores lead capture data
CREATE TABLE IF NOT EXISTS student_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Contact Info
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    
    -- Academic
    gpa REAL,  -- Self-reported GPA
    graduation_year INTEGER,  -- Expected high school graduation year
    major_interest TEXT,  -- Intended major
    
    -- Financial
    family_income_range TEXT,  -- Ranges: <30k, 30-50k, 50-75k, 75-100k, 100-150k, 150k+
    
    -- Demographics
    gender TEXT,
    ethnicity TEXT,  -- Comma-separated
    first_generation BOOLEAN,
    
    -- Location
    state TEXT,
    zip_code TEXT,
    
    -- Activities
    has_community_service BOOLEAN DEFAULT 0,
    has_leadership BOOLEAN DEFAULT 0,
    has_athletics BOOLEAN DEFAULT 0,
    
    -- Marketing
    opted_in_email BOOLEAN DEFAULT 1,
    source TEXT,  -- Where they came from
    
    -- Meta
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Scholarship Matches table: stores match results
CREATE TABLE IF NOT EXISTS scholarship_matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_profile_id INTEGER NOT NULL,
    scholarship_id INTEGER NOT NULL,
    match_score REAL NOT NULL,  -- 0-100 score
    matched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id),
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scholarships_active ON scholarships(active);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON scholarships(deadline);
CREATE INDEX IF NOT EXISTS idx_scholarships_major ON scholarships(major_category);
CREATE INDEX IF NOT EXISTS idx_student_profiles_email ON student_profiles(email);
CREATE INDEX IF NOT EXISTS idx_scholarship_matches_student ON scholarship_matches(student_profile_id);

-- Sample scholarships for testing
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_min, major_category, state_residency, description, website_url) VALUES
('STEM Excellence Scholarship', 'National STEM Foundation', 5000, 10000, '2026-03-01', 3.5, 'STEM', 'any', 'Awarded to outstanding STEM students demonstrating academic excellence and innovation.', 'https://example.com/stem-scholarship'),
('Future Business Leaders Award', 'American Business Council', 2500, 5000, '2026-04-15', 3.0, 'Business', 'any', 'For aspiring business students showing entrepreneurial spirit and leadership.', 'https://example.com/business-award'),
('Healthcare Heroes Scholarship', 'Medical Professionals Association', 7500, 15000, '2026-02-28', 3.5, 'Health', 'any', 'Supporting students pursuing careers in healthcare and medicine.', 'https://example.com/healthcare-scholarship'),
('First Generation College Fund', 'Education Equality Foundation', 3000, 8000, '2026-05-01', 2.5, 'any', 'any', 'For first-generation college students from low-income families.', 'https://example.com/first-gen-fund'),
('California Resident Scholarship', 'CA Education Board', 4000, 6000, '2026-03-15', 3.0, 'any', 'CA', 'Available to California residents attending in-state colleges.', 'https://example.com/ca-scholarship');

-- Update the first_generation field for the appropriate scholarship
UPDATE scholarships SET first_generation = 1 WHERE name = 'First Generation College Fund';

-- Update income_max for low-income scholarship
UPDATE scholarships SET income_max = 75000 WHERE name = 'First Generation College Fund';
