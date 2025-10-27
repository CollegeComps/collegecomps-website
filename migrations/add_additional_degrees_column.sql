-- Migration: Add additional_degrees column to salary_submissions table
-- This column stores a JSON array of additional degrees for users with multiple degrees
-- Example: [{"institution_name": "MIT", "degree_level": "masters", "major": "CS", "graduation_year": 2020}]

ALTER TABLE salary_submissions ADD COLUMN additional_degrees TEXT;
