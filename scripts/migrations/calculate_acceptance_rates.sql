-- ENG-324: Calculate and populate acceptance rates from admissions data
-- Formula: acceptance_rate = admissions_total / applicants_total
-- Uses most recent year of data for each institution

UPDATE institutions
SET acceptance_rate = (
  SELECT CAST(ad.admissions_total AS REAL) / NULLIF(ad.applicants_total, 0)
  FROM admissions_data ad
  WHERE ad.unitid = institutions.unitid
    AND ad.year = (SELECT MAX(year) FROM admissions_data WHERE unitid = institutions.unitid)
    AND ad.admissions_total > 0
    AND ad.applicants_total > 0
)
WHERE EXISTS (
  SELECT 1 FROM admissions_data ad
  WHERE ad.unitid = institutions.unitid
    AND ad.admissions_total > 0
    AND ad.applicants_total > 0
);

-- Calculate average SAT scores (average of 25th and 75th percentiles)
UPDATE institutions
SET average_sat = (
  SELECT (COALESCE(ad.sat_math_25th, 0) + COALESCE(ad.sat_math_75th, 0) + 
          COALESCE(ad.sat_verbal_25th, 0) + COALESCE(ad.sat_verbal_75th, 0)) / 4
  FROM admissions_data ad
  WHERE ad.unitid = institutions.unitid
    AND ad.year = (SELECT MAX(year) FROM admissions_data WHERE unitid = institutions.unitid)
    AND (ad.sat_math_25th > 0 OR ad.sat_math_75th > 0 OR ad.sat_verbal_25th > 0 OR ad.sat_verbal_75th > 0)
)
WHERE EXISTS (
  SELECT 1 FROM admissions_data ad
  WHERE ad.unitid = institutions.unitid
    AND (ad.sat_math_25th > 0 OR ad.sat_math_75th > 0 OR ad.sat_verbal_25th > 0 OR ad.sat_verbal_75th > 0)
);

-- Calculate average ACT scores (average of 25th and 75th percentiles)
UPDATE institutions
SET average_act = (
  SELECT (COALESCE(ad.act_composite_25th, 0) + COALESCE(ad.act_composite_75th, 0)) / 2
  FROM admissions_data ad
  WHERE ad.unitid = institutions.unitid
    AND ad.year = (SELECT MAX(year) FROM admissions_data WHERE unitid = institutions.unitid)
    AND (ad.act_composite_25th > 0 OR ad.act_composite_75th > 0)
)
WHERE EXISTS (
  SELECT 1 FROM admissions_data ad
  WHERE ad.unitid = institutions.unitid
    AND (ad.act_composite_25th > 0 OR ad.act_composite_75th > 0)
);
