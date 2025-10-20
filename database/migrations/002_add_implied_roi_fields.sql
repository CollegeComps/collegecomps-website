-- Migration: Add implied_roi field to institutions table
-- Date: 2025-10-19
-- Ticket: ENG-16
-- Description: Adds calculated ROI field and necessary indexes for performance

-- Add implied_roi column to institutions table
-- This will store the calculated ROI based on earnings vs cost
-- Formula: ((median_earnings_10yr * 10) - (4_yr_total_cost)) / (4_yr_total_cost) * 100
-- Result is a percentage (e.g., 150 = 150% ROI)
ALTER TABLE institutions ADD COLUMN implied_roi REAL;

-- Add acceptance_rate column (derived from admissions_data)
-- Stored as decimal (e.g., 0.15 = 15% acceptance rate)
ALTER TABLE institutions ADD COLUMN acceptance_rate REAL;

-- Add average SAT and ACT scores (derived from admissions_data)
ALTER TABLE institutions ADD COLUMN average_sat INTEGER;
ALTER TABLE institutions ADD COLUMN average_act INTEGER;

-- Add athletic conference for filtering
ALTER TABLE institutions ADD COLUMN athletic_conference TEXT;

-- Create indexes for performance on new filterable/sortable fields
CREATE INDEX IF NOT EXISTS idx_institutions_implied_roi ON institutions(implied_roi DESC);
CREATE INDEX IF NOT EXISTS idx_institutions_acceptance_rate ON institutions(acceptance_rate);
CREATE INDEX IF NOT EXISTS idx_institutions_sat_act ON institutions(average_sat, average_act);
CREATE INDEX IF NOT EXISTS idx_institutions_athletic_conference ON institutions(athletic_conference);

-- Add composite index for common query patterns (ROI + state filtering)
CREATE INDEX IF NOT EXISTS idx_institutions_roi_state ON institutions(implied_roi DESC, state);

-- Add last_roi_calculation timestamp to track when ROI was last computed
ALTER TABLE institutions ADD COLUMN last_roi_calculation TIMESTAMP;
