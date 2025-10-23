-- Additional Verified Scholarships - Phase 2
-- ==========================================
-- High-value, verified scholarships from FastWeb, Scholarships.com, and state sources
-- Target: Add 50+ more scholarships to reach 200+ total
-- Last updated: October 22, 2025

-- Run this AFTER scholarship_seeds.sql AND scholarship_seeds_expanded.sql

-- ====================
-- HIGH-VALUE NATIONAL SCHOLARSHIPS
-- ====================

INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, renewable, gpa_min, income_max, major_category, major_specific, state_residency, requires_essay, description, website_url, active) VALUES

-- Coca-Cola Scholars
('Coca-Cola Scholars Program', 'Coca-Cola Scholars Foundation', 20000, 20000, '2025-10-31', 0, 3.0, NULL, NULL, NULL, 'any', 1, 
'Merit-based scholarship for high school seniors demonstrating leadership and service. 150 recipients per year.', 
'https://www.coca-colascholarsfoundation.org/', 1),

-- Gates Scholarship
('Gates Scholarship', 'Gates Foundation', 50000, 75000, '2025-09-15', 1, 3.3, 60000, NULL, NULL, 'any', 1, 
'Full scholarship for exceptional minority students with significant financial need. Covers full cost of attendance.', 
'https://www.thegatesscholarship.org/', 1),

-- Jack Kent Cooke
('Jack Kent Cooke Foundation College Scholarship', 'Jack Kent Cooke Foundation', 40000, 55000, '2025-11-15', 1, 3.5, 95000, NULL, NULL, 'any', 1, 
'For high-achieving students with financial need. Up to $55,000 per year for 4 years.', 
'https://www.jkcf.org/our-scholarships/college-scholarship-program/', 1),

-- Ron Brown Scholar
('Ron Brown Scholar Program', 'CAF America', 40000, 40000, '2025-01-09', 1, 3.0, NULL, NULL, NULL, 'any', 1, 
'For African American high school seniors demonstrating academic excellence, leadership, and community service.', 
'https://www.ronbrown.org/', 1),

-- Burger King Scholars
('Burger King McLamore Foundation Scholarship', 'Burger King Foundation', 1000, 50000, '2025-12-15', 0, 2.5, 60000, NULL, NULL, 'any', 1, 
'For high school seniors in US, Puerto Rico, and Canada. Priority to Burger King employees and children.', 
'https://www.scholarsapply.org/burgerkingscholars/', 1),

-- Dell Scholars
('Dell Scholars Program', 'Michael & Susan Dell Foundation', 20000, 20000, '2025-12-01', 0, 2.4, 60000, NULL, NULL, 'any', 1, 
'For students who have overcome barriers. Includes technology package and ongoing support.', 
'https://www.dellscholars.org/', 1),

-- Elks MVS
('Elks National Foundation Most Valuable Student', 'Elks National Foundation', 4000, 50000, '2025-11-15', 1, 0.0, NULL, NULL, NULL, 'any', 1, 
'Merit-based awards ranging from $4,000 to $50,000 over four years.', 
'https://www.elks.org/scholars/', 1),

-- Horatio Alger
('Horatio Alger Association Scholarship', 'Horatio Alger Association', 25000, 25000, '2025-10-25', 0, 2.0, 55000, NULL, NULL, 'any', 1, 
'For students who have exhibited integrity, perseverance, and financial need.', 
'https://scholars.horatioalger.org/', 1),

-- ====================
-- NURSING & HEALTHCARE
-- ====================

('Nurse Corps Scholarship Program', 'HRSA', 15000, 30000, '2025-04-30', 1, 0.0, NULL, 'Health', 'Nursing', 'any', 0, 
'Federal scholarship for nursing students. Recipients commit to work in critical shortage facilities.', 
'https://bhw.hrsa.gov/funding/apply-scholarship', 1),

('Johnson & Johnson Campaign for Nursing''s Future Scholarship', 'Johnson & Johnson', 5000, 10000, '2025-05-15', 0, 3.0, NULL, 'Health', 'Nursing', 'any', 1, 
'For students pursuing nursing degrees, with preference for diverse and male nursing students.', 
'https://www.jnj.com/nursingscholarship', 1),

('Breakthrough to Nursing Scholarship', 'National Student Nurses Association', 2500, 2500, '2025-01-15', 0, 3.0, NULL, 'Health', 'Nursing', 'any', 1, 
'For students from underrepresented groups in nursing.', 
'https://www.nsna.org/get-scholarships.html', 1),

-- ====================
-- BUSINESS & ENTREPRENEURSHIP
-- ====================

('NABA National Scholarship Program', 'National Association of Black Accountants', 1000, 10000, '2025-01-31', 0, 3.5, NULL, 'Business', 'Accounting', 'any', 1, 
'For minority students pursuing accounting degrees.', 
'https://nabainc.org/students/scholarships', 1),

('AICPA Foundation Scholarships', 'American Institute of CPAs', 5000, 10000, '2025-03-01', 0, 3.0, NULL, 'Business', 'Accounting', 'any', 1, 
'Multiple scholarships for accounting majors, including minority-specific awards.', 
'https://www.aicpa.org/career/scholarships', 1),

('Merchants Exchange Scholarship Fund', 'Merchants Exchange', 2500, 5000, '2025-03-15', 1, 3.0, NULL, 'Business', NULL, 'CA', 1, 
'For students studying business, economics, or related fields.', 
'https://www.sfmex.org/scholarship/', 1),

-- ====================
-- EDUCATION
-- ====================

('Aspiring Teachers Scholarship', 'PhysicsTeachers.org', 2000, 2000, '2025-04-01', 0, 3.0, NULL, 'Education', 'Teaching', 'any', 1, 
'For students planning to teach physics, physical science, or elementary science.', 
'https://www.aapt.org/programs/projects/physicsteachers.cfm', 1),

('Robert Noyce Teacher Scholarship Program', 'NSF', 10000, 30000, '2025-09-15', 1, 3.0, NULL, 'Education', 'STEM Teaching', 'any', 0, 
'For students pursuing STEM teaching careers. Requires teaching commitment.', 
'https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=5733', 1),

-- ====================
-- ARTS & HUMANITIES
-- ====================

('YoungArts Program', 'National YoungArts Foundation', 100, 10000, '2025-10-15', 0, 0.0, NULL, 'Arts', NULL, 'any', 0, 
'For high school students in visual, literary, design and performing arts.', 
'https://www.youngarts.org/apply', 1),

('Scholastic Art & Writing Awards', 'Alliance for Young Artists & Writers', 500, 10000, '2025-12-01', 0, 0.0, NULL, 'Arts', NULL, 'any', 0, 
'National competition for creative teenagers. Over $250,000 in scholarships.', 
'https://www.artandwriting.org/', 1),

('American Foreign Service Association Scholarship', 'AFSA', 1000, 4000, '2025-02-06', 0, 2.0, NULL, 'Humanities', 'Foreign Service', 'any', 1, 
'For children of US Foreign Service employees studying international relations or related fields.', 
'https://www.afsa.org/scholarship', 1),

-- ====================
-- STATE-SPECIFIC HIGH VALUE
-- ====================

-- California
('Cal Grant A', 'California Student Aid Commission', 5742, 14196, '2025-03-02', 1, 3.0, 111000, NULL, NULL, 'CA', 0, 
'For California residents attending in-state colleges. GPA and income requirements.', 
'https://www.csac.ca.gov/cal-grants', 1),

('Middle Class Scholarship (MCS)', 'California Student Aid Commission', 2000, 5000, '2025-03-02', 1, 0.0, 177000, NULL, NULL, 'CA', 0, 
'For CA middle-income families attending UC or CSU.', 'https://www.csac.ca.gov/middle-class-scholarship', 1),

-- Texas  
('TEXAS Grant', 'Texas Higher Education Coordinating Board', 2500, 6000, '2025-01-15', 1, 2.5, 60000, NULL, NULL, 'TX', 0, 
'For Texas residents with financial need attending Texas public universities.', 
'https://www.thecb.state.tx.us/apps/financialaid/tofa.cfm', 1),

('Texas Public Educational Grant', 'Texas Higher Education Coordinating Board', 1000, 3000, '2025-06-01', 1, 0.0, 80000, NULL, NULL, 'TX', 0, 
'Need-based grant for Texas residents at public institutions.', 
'https://www.thecb.state.tx.us/apps/financialaid/tofa.cfm', 1),

-- Florida
('Florida Bright Futures Scholarship', 'Florida Department of Education', 2000, 6500, '2025-08-31', 1, 3.5, NULL, NULL, NULL, 'FL', 0, 
'Merit scholarship for Florida high school graduates. Full tuition available for top performers.', 
'https://www.floridastudentfinancialaidsg.org/sapbfmain/bfmain.htm', 1),

-- New York
('NY Excelsior Scholarship', 'New York State', 5500, 5500, '2025-06-30', 1, 0.0, 125000, NULL, NULL, 'NY', 0, 
'Free tuition at SUNY and CUNY for NY residents. Income cap $125,000.', 
'https://www.hesc.ny.gov/pay-for-college/financial-aid/types-of-financial-aid/nys-grants-scholarships-awards/the-excelsior-scholarship.html', 1),

-- Illinois
('Illinois MAP Grant', 'Illinois Student Assistance Commission', 500, 8508, '2025-09-30', 1, 0.0, 95000, NULL, NULL, 'IL', 0, 
'Need-based grant for Illinois residents attending Illinois colleges.', 
'https://www.isac.org/students/before-college/types-of-financial-aid/grants/mapgrant.html', 1),

-- ====================
-- VETERAN & MILITARY FAMILIES
-- ====================

('AMVETS National Scholarship', 'AMVETS', 1000, 4000, '2025-04-30', 0, 0.0, NULL, NULL, NULL, 'any', 1, 
'For veterans, active military, and their dependents.', 
'https://amvets.org/scholarships/', 1),

('Folds of Honor Scholarship', 'Folds of Honor Foundation', 5000, 5000, '2025-03-31', 1, 0.0, NULL, NULL, NULL, 'any', 1, 
'For spouses and children of military service members killed or disabled in service.', 
'https://foldsofhonor.org/get-a-scholarship/', 1),

('Military Officers Association of America (MOAA) Scholarship', 'MOAA', 2500, 5000, '2025-03-01', 0, 3.0, NULL, NULL, NULL, 'any', 1, 
'For children of active, reserve, National Guard, retired, or deceased military officers.', 
'https://www.moaa.org/content/scholarships-and-grants/scholarships/', 1),

-- ====================
-- FIRST-GENERATION & UNDERREPRESENTED
-- ====================

('QuestBridge National College Match', 'QuestBridge', 40000, 80000, '2025-09-26', 1, 3.5, 65000, NULL, NULL, 'any', 1, 
'Full four-year scholarships to QuestBridge partner colleges for exceptional low-income students.', 
'https://www.questbridge.org/high-school-students/national-college-match', 1),

('Posse Foundation Scholarship', 'Posse Foundation', 50000, 70000, '2025-08-01', 1, 0.0, NULL, NULL, NULL, 'any', 0, 
'Full-tuition scholarships to partner colleges. Students nominated through high schools.', 
'https://www.possefoundation.org/', 1),

('Hispanic Scholarship Fund', 'Hispanic Scholarship Fund', 500, 5000, '2025-02-15', 1, 3.0, NULL, NULL, NULL, 'any', 1, 
'For students of Hispanic heritage. Must be enrolling or enrolled in college.', 
'https://hsf.net/scholarship', 1),

('United Negro College Fund Scholarships', 'UNCF', 1000, 10000, '2025-10-31', 0, 2.5, NULL, NULL, NULL, 'any', 1, 
'Multiple scholarships for African American students attending UNCF member schools.', 
'https://scholarships.uncf.org/', 1),

('Asian & Pacific Islander American Scholarship Fund', 'APIASF', 2500, 20000, '2025-01-15', 1, 2.7, 60000, NULL, NULL, 'any', 1, 
'For students of Asian and Pacific Islander ethnicity demonstrating financial need.', 
'https://apiasf.org/scholarship/', 1),

-- ====================
-- SPECIALTY & UNIQUE
-- ====================

('Flinn Scholars Program', 'Flinn Foundation', 120000, 120000, '2025-11-01', 1, 3.5, NULL, NULL, NULL, 'AZ', 1, 
'Full scholarship covering all costs for 4 years at Arizona State, U of Arizona, or Northern Arizona U. Only 20 awarded per year.', 
'https://flinn.org/flinn-scholars/', 1),

('Cameron Impact Scholarship', 'Bryan Cameron Education Foundation', 50000, 50000, '2025-09-10', 1, 3.7, NULL, NULL, NULL, 'any', 1, 
'Full four-year scholarship. Only 10-15 awarded nationally. Based on leadership and community impact.', 
'https://www.bryancameroneducationfoundation.org/cameron-impact-scholarship', 1),

('Davidson Fellows Scholarship', 'Davidson Institute', 10000, 50000, '2025-02-12', 0, 0.0, NULL, NULL, NULL, 'any', 0, 
'For students under 18 who have completed significant projects in STEM, literature, music, or philosophy.', 
'https://www.davidsongifted.org/gifted-programs/fellows-scholarship/', 1),

('Regeneron Science Talent Search', 'Regeneron', 25000, 250000, '2025-11-13', 0, 0.0, NULL, 'STEM', NULL, 'any', 0, 
'For high school seniors with original research projects. Top prize $250,000. 40 finalists receive at least $25,000.', 
'https://www.societyforscience.org/regeneron-sts/', 1);

-- Update existing scholarship counts if needed
-- Total should now be 200+ scholarships
