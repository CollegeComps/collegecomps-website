-- Migration: Add implied ROI and enhanced admissions fields to institutions table
-- Purpose: Support ROI-based sorting and filtering for college recommendations
-- Date: October 19, 2025

-- Add ROI calculation fields
ALTER TABLE institutions ADD COLUMN implied_roi REAL;

ALTER TABLE institutions ADD COLUMN last_roi_calculation TIMESTAMP;

-- Add derived admissions fields (from admissions_data table)
ALTER TABLE institutions ADD COLUMN acceptance_rate REAL;

ALTER TABLE institutions ADD COLUMN average_sat INTEGER;

ALTER TABLE institutions ADD COLUMN average_act INTEGER;

ALTER TABLE institutions ADD COLUMN athletic_conference TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_institutions_implied_roi ON institutions(implied_roi DESC);

CREATE INDEX IF NOT EXISTS idx_institutions_acceptance_rate ON institutions(acceptance_rate);

CREATE INDEX IF NOT EXISTS idx_institutions_sat_act ON institutions(average_sat, average_act);

CREATE INDEX IF NOT EXISTS idx_institutions_athletic_conference ON institutions(athletic_conference);

-- Create composite index for common query patterns (ROI + state filtering)
CREATE INDEX IF NOT EXISTS idx_institutions_roi_state ON institutions(state, implied_roi DESC);
