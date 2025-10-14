-- Program Search Optimization
-- =============================
-- This file creates optimized indexes and views for fast program search

-- 1. CREATE FTS5 VIRTUAL TABLE FOR FULL-TEXT SEARCH
-- ---------------------------------------------------
-- FTS5 enables lightning-fast text search on program titles
-- This is 100x faster than LIKE queries for text search

DROP TABLE IF EXISTS programs_fts;

CREATE VIRTUAL TABLE IF NOT EXISTS programs_fts USING fts5(
    cipcode,
    cip_title,
    content=academic_programs,
    content_rowid=rowid
);

-- Populate the FTS table with data from academic_programs
INSERT INTO programs_fts(cipcode, cip_title)
SELECT DISTINCT cipcode, cip_title 
FROM academic_programs 
WHERE cip_title IS NOT NULL;

-- 2. CREATE TRIGGERS TO KEEP FTS TABLE IN SYNC
-- ----------------------------------------------
-- These triggers automatically update the FTS table when data changes

-- Trigger for INSERT
CREATE TRIGGER IF NOT EXISTS programs_fts_insert AFTER INSERT ON academic_programs BEGIN
    INSERT INTO programs_fts(rowid, cipcode, cip_title)
    VALUES (new.rowid, new.cipcode, new.cip_title);
END;

-- Trigger for DELETE
CREATE TRIGGER IF NOT EXISTS programs_fts_delete AFTER DELETE ON academic_programs BEGIN
    DELETE FROM programs_fts WHERE rowid = old.rowid;
END;

-- Trigger for UPDATE
CREATE TRIGGER IF NOT EXISTS programs_fts_update AFTER UPDATE ON academic_programs BEGIN
    DELETE FROM programs_fts WHERE rowid = old.rowid;
    INSERT INTO programs_fts(rowid, cipcode, cip_title)
    VALUES (new.rowid, new.cipcode, new.cip_title);
END;


-- 3. CREATE OPTIMIZED MATERIALIZED VIEW FOR PROGRAM SEARCH
-- ----------------------------------------------------------
-- This view pre-aggregates all program data by CIP code
-- Uses the same structure as v_top_programs_by_completions but includes all programs

DROP TABLE IF EXISTS programs_search_cache;

CREATE TABLE IF NOT EXISTS programs_search_cache (
    cipcode TEXT PRIMARY KEY,
    cip_title TEXT NOT NULL,
    cip_title_lower TEXT NOT NULL,  -- Lowercase for case-insensitive search
    institution_count INTEGER NOT NULL,
    total_completions INTEGER NOT NULL,
    avg_completions REAL NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on lowercase title for fast LIKE searches (fallback)
CREATE INDEX IF NOT EXISTS idx_programs_cache_title_lower 
ON programs_search_cache(cip_title_lower);

-- Create index on total_completions for sorting
CREATE INDEX IF NOT EXISTS idx_programs_cache_completions 
ON programs_search_cache(total_completions DESC);

-- Populate the cache table with aggregated data
INSERT OR REPLACE INTO programs_search_cache (cipcode, cip_title, cip_title_lower, institution_count, total_completions, avg_completions)
SELECT 
    ap.cipcode,
    ap.cip_title,
    LOWER(ap.cip_title) as cip_title_lower,
    COUNT(DISTINCT ap.unitid) as institution_count,
    SUM(ap.completions) as total_completions,
    AVG(ap.completions) as avg_completions
FROM academic_programs ap
WHERE ap.cip_title IS NOT NULL 
    AND ap.completions > 0
GROUP BY ap.cipcode, ap.cip_title;


-- 4. CREATE OPTIMIZED VIEW FOR PROGRAM SEARCH
-- --------------------------------------------
-- This view joins the cache with FTS for optimal search performance

CREATE VIEW IF NOT EXISTS v_programs_search AS
SELECT 
    cipcode,
    cip_title,
    institution_count,
    total_completions,
    avg_completions
FROM programs_search_cache
ORDER BY total_completions DESC;


-- 5. USAGE EXAMPLES
-- -----------------

-- Fast full-text search using FTS5 (RECOMMENDED - 100x faster)
-- Example: Search for "computer science"
/*
SELECT 
    c.cipcode,
    c.cip_title,
    c.institution_count,
    c.total_completions
FROM programs_fts f
JOIN programs_search_cache c ON f.cipcode = c.cipcode
WHERE programs_fts MATCH 'computer science'
ORDER BY c.total_completions DESC
LIMIT 50;
*/

-- Alternative: Use cache table with LIKE (faster than base table but slower than FTS)
/*
SELECT 
    cipcode,
    cip_title,
    institution_count,
    total_completions
FROM programs_search_cache
WHERE cip_title_lower LIKE '%computer science%'
ORDER BY total_completions DESC
LIMIT 50;
*/

-- For exact CIP code lookup (instant)
/*
SELECT * FROM programs_search_cache WHERE cipcode = '11.0701';
*/


-- 6. MAINTENANCE QUERY
-- ---------------------
-- Run this periodically to refresh the cache (e.g., daily via cron)
/*
DELETE FROM programs_search_cache;
INSERT INTO programs_search_cache (cipcode, cip_title, cip_title_lower, institution_count, total_completions, avg_completions)
SELECT 
    ap.cipcode,
    ap.cip_title,
    LOWER(ap.cip_title) as cip_title_lower,
    COUNT(DISTINCT ap.unitid) as institution_count,
    SUM(ap.completions) as total_completions,
    AVG(ap.completions) as avg_completions
FROM academic_programs ap
WHERE ap.cip_title IS NOT NULL 
    AND ap.completions > 0
GROUP BY ap.cipcode, ap.cip_title;

UPDATE programs_search_cache SET last_updated = CURRENT_TIMESTAMP;
*/
