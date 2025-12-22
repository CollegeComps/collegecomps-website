-- Programs Data Audit: Identify gaps and distribution by degree level

-- 1) Masters programs without corresponding Bachelors at the same institution and CIP
--    Bachelors variants include IPEDS extended codes: 5, 22, 31
--    Masters variants include: 7, 23
SELECT 
  p.unitid,
  i.name AS institution_name,
  p.cipcode,
  p.cip_title,
  SUM(CASE WHEN p.credential_level IN (7,23) THEN p.completions ELSE 0 END) AS masters_completions,
  SUM(CASE WHEN p.credential_level IN (5,22,31) THEN p.completions ELSE 0 END) AS bachelors_completions
FROM academic_programs p
JOIN institutions i ON i.unitid = p.unitid
WHERE p.credential_level IN (7,23)
  AND NOT EXISTS (
    SELECT 1 
    FROM academic_programs pb
    WHERE pb.unitid = p.unitid
      AND pb.cipcode = p.cipcode
      AND pb.credential_level IN (5,22,31)
  )
GROUP BY p.unitid, i.name, p.cipcode, p.cip_title
ORDER BY i.name, p.cipcode;

-- 2) Institution-level counts: Bachelors vs Masters totals
SELECT 
  i.unitid,
  i.name AS institution_name,
  SUM(CASE WHEN p.credential_level IN (5,22,31) THEN 1 ELSE 0 END) AS bachelors_programs,
  SUM(CASE WHEN p.credential_level IN (7,23) THEN 1 ELSE 0 END) AS masters_programs
FROM academic_programs p
JOIN institutions i ON i.unitid = p.unitid
GROUP BY i.unitid, i.name
ORDER BY bachelors_programs ASC, masters_programs DESC, i.name
LIMIT 200;

-- 3) CIP-level count of institutions offering Bachelors vs Masters
SELECT 
  p.cipcode,
  p.cip_title,
  COUNT(DISTINCT CASE WHEN p.credential_level IN (5,22,31) THEN p.unitid END) AS institutions_with_bachelors,
  COUNT(DISTINCT CASE WHEN p.credential_level IN (7,23) THEN p.unitid END) AS institutions_with_masters
FROM academic_programs p
GROUP BY p.cipcode, p.cip_title
ORDER BY institutions_with_bachelors ASC, institutions_with_masters DESC, p.cipcode
LIMIT 200;

-- 4) For a specific institution (replace :unitid) – list Masters-only CIPs
-- .param set unitid 228778  -- Example: University of Texas at Austin
SELECT 
  p.cipcode,
  p.cip_title
FROM academic_programs p
WHERE p.unitid = :unitid
  AND p.credential_level IN (7,23)
  AND NOT EXISTS (
    SELECT 1 
    FROM academic_programs pb
    WHERE pb.unitid = p.unitid
      AND pb.cipcode = p.cipcode
      AND pb.credential_level IN (5,22,31)
  )
ORDER BY p.cipcode;
