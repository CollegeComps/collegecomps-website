-- ENG-321: Add missing columns to salary_submissions table
-- This migration adds columns that are used by the submit salary form but were missing from the schema

-- Add company_name column
ALTER TABLE salary_submissions ADD COLUMN company_name TEXT;

-- Add company_size column
ALTER TABLE salary_submissions ADD COLUMN company_size TEXT;

-- Add remote_status column
ALTER TABLE salary_submissions ADD COLUMN remote_status TEXT;

-- Add student_debt_remaining column
ALTER TABLE salary_submissions ADD COLUMN student_debt_remaining INTEGER;

-- Add student_debt_original column
ALTER TABLE salary_submissions ADD COLUMN student_debt_original INTEGER;

-- Add data_quality_score column
ALTER TABLE salary_submissions ADD COLUMN data_quality_score REAL DEFAULT 100.0;

-- Add moderation_status column
ALTER TABLE salary_submissions ADD COLUMN moderation_status TEXT DEFAULT 'pending';
