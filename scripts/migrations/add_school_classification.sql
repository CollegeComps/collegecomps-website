-- ENG-323: Add school_classification column to institutions table
-- This column will categorize schools as Ivy League, Public Flagship, Elite Private, Public, or Private

ALTER TABLE institutions ADD COLUMN school_classification TEXT;
