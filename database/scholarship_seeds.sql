-- Real Scholarship Opportunities Database
-- ========================================
-- Curated list of legitimate scholarships for college students
-- Data compiled from federal programs, state agencies, and verified private organizations
-- Last updated: 2025

-- Clear existing sample data
DELETE FROM scholarships;

-- ====================
-- FEDERAL SCHOLARSHIPS
-- ====================

INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, renewable, gpa_min, income_max, major_category, state_residency, description, website_url, active) VALUES

-- Federal Pell Grant
('Federal Pell Grant', 'U.S. Department of Education', 750, 7395, '2025-06-30', 1, 0.0, 60000, 'any', 'any', 
'The largest federal grant program offering funds to low-income undergraduate students. Award amounts vary based on financial need, cost of attendance, and enrollment status.', 
'https://studentaid.gov/understand-aid/types/grants/pell', 1),

-- Federal Supplemental Educational Opportunity Grant (FSEOG)
('FSEOG Grant', 'U.S. Department of Education', 100, 4000, '2025-06-30', 1, 0.0, 40000, 'any', 'any', 
'For undergraduate students with exceptional financial need, priority given to Pell Grant recipients.', 
'https://studentaid.gov/understand-aid/types/grants/fseog', 1),

-- TEACH Grant
('TEACH Grant', 'U.S. Department of Education', 4000, 4000, '2025-06-30', 1, 3.25, NULL, 'Education', 'any', 
'For students who plan to teach in a high-need field in a low-income area. Requires 4 years of teaching service.', 
'https://studentaid.gov/understand-aid/types/grants/teach', 1),

-- ====================
-- NATIONAL SCHOLARSHIPS (Private Organizations)
-- ====================

-- Coca-Cola Scholars Program
('Coca-Cola Scholars Program', 'The Coca-Cola Scholars Foundation', 20000, 20000, '2025-10-31', 0, 3.0, NULL, 'any', 'any', 
'Merit-based scholarship for high school seniors with demonstrated leadership and commitment to community service.', 
'https://www.coca-colascholarsfoundation.org', 1),

-- Dell Scholars Program
('Dell Scholars Program', 'Michael & Susan Dell Foundation', 20000, 20000, '2025-12-01', 0, 2.4, 60000, 'any', 'any', 
'For students with financial need who have participated in college readiness programs. Includes laptop and ongoing support.', 
'https://www.dellscholars.org', 1),

-- Gates Scholarship
('The Gates Scholarship', 'Bill & Melinda Gates Foundation', 50000, 50000, '2025-09-15', 1, 3.3, 60000, 'any', 'any', 
'Full ride scholarship for exceptional, Pell-eligible minority high school seniors.', 
'https://www.thegatesscholarship.org', 1),

-- Jack Kent Cooke Foundation
('Jack Kent Cooke College Scholarship', 'Jack Kent Cooke Foundation', 40000, 40000, '2025-11-14', 1, 3.5, 95000, 'any', 'any', 
'For high-achieving students with financial need. One of the largest private scholarships in the country.', 
'https://www.jkcf.org', 1),

-- National Merit Scholarship
('National Merit Scholarship', 'National Merit Scholarship Corporation', 2500, 2500, '2025-10-15', 0, 3.5, NULL, 'any', 'any', 
'One-time scholarship for National Merit Finalists based on PSAT/NMSQT scores.', 
'https://www.nationalmerit.org', 1),

-- Ron Brown Scholar Program
('Ron Brown Scholar Program', 'Ron Brown Scholar Program', 10000, 40000, '2025-11-01', 1, 3.0, NULL, 'any', 'any', 
'For African American high school seniors demonstrating academic excellence, leadership, and community involvement.', 
'https://www.ronbrown.org', 1),

-- ====================
-- STEM SCHOLARSHIPS
-- ====================

('SMART Scholarship', 'Department of Defense', 25000, 38000, '2025-12-01', 1, 3.0, NULL, 'STEM', 'any', 
'Science, Mathematics And Research for Transformation scholarship. Full tuition plus stipend, requires DoD service commitment.', 
'https://www.smartscholarship.org', 1),

('Society of Women Engineers Scholarship', 'Society of Women Engineers', 1000, 15000, '2025-02-15', 1, 3.0, NULL, 'STEM', 'any', 
'Multiple scholarships for women pursuing STEM degrees. Various awards with different criteria.', 
'https://swe.org/scholarships', 1),

('Google Lime Scholarship', 'Google', 10000, 10000, '2025-12-11', 1, 3.5, NULL, 'STEM', 'any', 
'For students with disabilities pursuing computer science or related fields.', 
'https://www.limeconnect.com/programs/page/google-lime-scholarship', 1),

('NASA OSTEM Scholarships', 'NASA', 8000, 15000, '2025-03-01', 1, 3.0, NULL, 'STEM', 'any', 
'For students pursuing STEM degrees who are interested in NASA-related research and careers.', 
'https://www.nasa.gov/stem/scholarships-financial-aid', 1),

('Regeneron Science Talent Search', 'Regeneron Pharmaceuticals', 2000, 250000, '2025-11-15', 0, 3.5, NULL, 'STEM', 'any', 
'Nation''s oldest and most prestigious science research competition for high school seniors.', 
'https://www.societyforscience.org/regeneron-sts', 1),

-- ====================
-- BUSINESS SCHOLARSHIPS
-- ====================

('DECA Scholarship', 'DECA Inc.', 1000, 5000, '2025-01-15', 0, 3.0, NULL, 'Business', 'any', 
'For DECA members pursuing careers in marketing, finance, hospitality, or management.', 
'https://www.deca.org/scholarship', 1),

('NABA National Scholarship', 'National Association of Black Accountants', 1000, 10000, '2025-01-31', 1, 3.0, NULL, 'Business', 'any', 
'For minority students pursuing accounting, finance, or business-related degrees.', 'https://www.nabainc.org/page/Scholarship_Program', 1),

('Future Business Leaders of America Scholarship', 'FBLA-PBL', 1000, 5000, '2025-03-01', 0, 3.0, NULL, 'Business', 'any', 
'For FBLA members demonstrating leadership and academic excellence in business education.', 
'https://www.fbla.org/compete/awards-recognition/scholarships', 1),

-- ====================
-- HEALTH/MEDICAL SCHOLARSHIPS
-- ====================

('Tylenol Future Care Scholarship', 'Tylenol', 5000, 10000, '2025-06-15', 0, 3.0, NULL, 'Health', 'any', 
'For students pursuing careers in healthcare including medicine, nursing, pharmacy, and allied health.', 
'https://www.tylenol.com/news/scholarship', 1),

('Health Professions Scholarship Program (HPSP)', 'U.S. Army', 45000, 45000, '2025-12-31', 1, 3.0, NULL, 'Health', 'any', 
'Full tuition for medical, dental, pharmacy, or veterinary school. Requires military service commitment.', 
'https://www.goarmy.com/careers-and-jobs/find-your-path/army-medical-careers/hpsp.html', 1),

('Indian Health Service Scholarship', 'U.S. Department of Health and Human Services', 30000, 60000, '2025-03-28', 1, 2.0, NULL, 'Health', 'any', 
'For American Indian and Alaska Native students pursuing health professions degrees.', 
'https://www.ihs.gov/scholarship', 1),

('National Health Service Corps Scholarship', 'HRSA', 50000, 50000, '2025-04-15', 1, 3.0, NULL, 'Health', 'any', 
'Full tuition plus stipend for primary care health professionals. Requires service in underserved communities.', 
'https://nhsc.hrsa.gov/scholarships', 1),

-- ====================
-- ARTS & HUMANITIES SCHOLARSHIPS
-- ====================

('National YoungArts Foundation', 'YoungArts', 1000, 10000, '2025-10-15', 0, 0.0, NULL, 'Arts', 'any', 
'For talented young artists in visual, literary, design, and performing arts.', 
'https://www.youngarts.org', 1),

('Scholastic Art & Writing Awards', 'Scholastic Inc.', 500, 10000, '2025-09-15', 0, 0.0, NULL, 'Arts', 'any', 
'Nation''s longest-running recognition program for creative teens in visual arts and writing.', 
'https://www.artandwriting.org', 1),

('NPR Kroc Fellowship', 'NPR', 40000, 40000, '2025-11-01', 0, 3.0, NULL, 'Humanities', 'any', 
'One-year paid journalism fellowship at NPR for recent college graduates.', 
'https://www.npr.org/kroc', 1),

-- ====================
-- EDUCATION SCHOLARSHIPS
-- ====================

('Troops to Teachers', 'U.S. Department of Defense', 5000, 5000, '2025-06-30', 0, 2.5, NULL, 'Education', 'any', 
'For military service members transitioning to teaching careers in high-need schools.', 
'https://proudtoserveagain.com', 1),

('Kappa Delta Pi Scholarship', 'Kappa Delta Pi', 500, 2500, '2025-05-01', 0, 3.5, NULL, 'Education', 'any', 
'For members of the International Honor Society in Education pursuing teaching degrees.', 
'https://www.kdp.org/initiatives/scholarships.php', 1),

-- ====================
-- STATE-SPECIFIC SCHOLARSHIPS
-- ====================

-- CALIFORNIA
('Cal Grant A', 'California Student Aid Commission', 6000, 12970, '2025-03-02', 1, 3.0, 107800, 'any', 'CA', 
'Tuition assistance for California residents attending California colleges. Based on financial need and GPA.', 
'https://www.csac.ca.gov/cal-grants', 1),

('Cal Grant B', 'California Student Aid Commission', 1656, 12970, '2025-03-02', 1, 2.0, 58100, 'any', 'CA', 
'For low-income California students. Access award for living expenses plus tuition in later years.', 
'https://www.csac.ca.gov/cal-grants', 1),

('Middle Class Scholarship', 'California Student Aid Commission', 1000, 5742, '2025-03-02', 1, 0.0, 201200, 'any', 'CA', 
'For middle-income California families attending UC or CSU schools.', 
'https://www.csac.ca.gov/middle-class-scholarship', 1),

-- TEXAS
('TEXAS Grant', 'Texas Higher Education Coordinating Board', 2000, 6000, '2025-01-15', 1, 2.5, 50000, 'any', 'TX', 
'Need-based grant for Texas residents demonstrating financial need at participating Texas schools.', 
'https://www.hhloans.com/index.cfm?objectid=0FF8FE54-0BC8-11E8-AD0B0A4E86A2A52F', 1),

('Texas Armed Services Scholarship', 'Texas Veterans Commission', 10000, 10000, '2025-03-15', 1, 2.5, NULL, 'any', 'TX', 
'For Texas residents who are children of military members killed or disabled in action.', 
'https://www.tvc.texas.gov', 1),

('Top 10% Scholarship', 'State of Texas', 1000, 5000, '2025-06-01', 1, 0.0, NULL, 'any', 'TX', 
'Automatic scholarship for students graduating in top 10% of their Texas high school class.', 
'https://www.texasoncourse.org/top-10-percent', 1),

-- FLORIDA
('Florida Bright Futures', 'Florida Department of Education', 3000, 6500, '2025-08-31', 1, 3.5, NULL, 'any', 'FL', 
'Merit-based scholarship for Florida high school graduates based on GPA and standardized test scores.', 
'https://www.floridastudentfinancialaidsg.org/sapbfmain/bf.htm', 1),

('Florida Student Assistance Grant (FSAG)', 'Florida Department of Education', 200, 2610, '2025-06-30', 1, 0.0, 60000, 'any', 'FL', 
'Need-based grant for Florida residents attending Florida colleges.', 
'https://www.floridastudentfinancialaidsg.org', 1),

-- NEW YORK
('Excelsior Scholarship', 'New York State Higher Education Services Corporation', 5500, 5500, '2025-06-30', 1, 0.0, 125000, 'any', 'NY', 
'Covers tuition for NY residents at SUNY and CUNY schools. Family income must be $125k or less.', 
'https://www.hesc.ny.gov/pay-for-college/financial-aid/types-of-financial-aid/nys-grants-scholarships-awards/the-excelsior-scholarship.html', 1),

('NYS Tuition Assistance Program (TAP)', 'New York State', 500, 5665, '2025-06-30', 1, 0.0, 80000, 'any', 'NY', 
'Need-based grant for New York residents attending college in New York.', 
'https://www.hesc.ny.gov/pay-for-college/apply-for-financial-aid/nys-tap.html', 1),

-- ILLINOIS
('MAP Grant', 'Illinois Student Assistance Commission', 400, 6468, '2025-06-30', 1, 0.0, 75000, 'any', 'IL', 
'Monetary Award Program for Illinois residents with financial need attending Illinois schools.', 
'https://www.isac.org/students/during-college/types-of-financial-aid/grants/map/', 1),

('AIM HIGH Grant', 'Illinois Student Assistance Commission', 1000, 3000, '2025-09-30', 1, 3.0, 90000, 'any', 'IL', 
'Merit-based grant for Illinois students with strong academic performance attending Illinois colleges.', 
'https://www.isac.org/aimhigh', 1),

-- PENNSYLVANIA
('Pennsylvania State Grant', 'Pennsylvania Higher Education Assistance Agency', 500, 5750, '2025-05-01', 1, 0.0, 110000, 'any', 'PA', 
'Need-based grant for Pennsylvania residents attending approved Pennsylvania postsecondary institutions.', 
'https://www.pheaa.org/funding-opportunities/state-grant-program/', 1),

-- OHIO
('Ohio College Opportunity Grant', 'Ohio Department of Higher Education', 1000, 4494, '2025-10-01', 1, 0.0, 80000, 'any', 'OH', 
'Need-based grant for Ohio residents attending Ohio colleges and universities.', 
'https://www.ohiohighered.org/ocog', 1),

-- GEORGIA
('HOPE Scholarship', 'Georgia Student Finance Commission', 3000, 6000, '2025-07-01', 1, 3.0, NULL, 'any', 'GA', 
'Merit-based scholarship for Georgia residents with strong academic performance. Must maintain 3.0 GPA.', 
'https://gsfc.georgia.gov/hope', 1),

('Zell Miller Scholarship', 'Georgia Student Finance Commission', 6000, 10000, '2025-07-01', 1, 3.7, NULL, 'any', 'GA', 
'Georgia''s highest merit scholarship for valedictorians and students with 3.7+ GPA and high SAT/ACT scores.', 
'https://gsfc.georgia.gov/zell-miller', 1),

-- NORTH CAROLINA
('NC Need-Based Scholarship', 'State of North Carolina', 500, 7500, '2025-03-15', 1, 0.0, 60000, 'any', 'NC', 
'Need-based grant for North Carolina residents with substantial financial need.', 
'https://www.cfnc.org/pay-for-college/apply-for-financial-aid/financial-aid-basics/north-carolina-financial-aid/', 1),

-- MICHIGAN
('Michigan Tuition Grant', 'State of Michigan', 1000, 2750, '2025-03-01', 1, 0.0, 60000, 'any', 'MI', 
'Need-based grant for Michigan residents attending private Michigan colleges.', 
'https://www.michigan.gov/mistudentaid', 1),

-- VIRGINIA
('Virginia Tuition Assistance Grant', 'State Council of Higher Education for Virginia', 1000, 4500, '2025-07-31', 1, 0.0, NULL, 'any', 'VA', 
'For Virginia residents attending private Virginia colleges.', 
'https://www.schev.edu/students-parents/financial-aid/types-of-financial-aid/virginia-tuition-assistance-grant-program', 1),

-- WASHINGTON
('Washington College Grant', 'Washington Student Achievement Council', 1000, 12300, '2025-04-30', 1, 0.0, 100000, 'any', 'WA', 
'Need-based grant for Washington residents. Largest state financial aid program in Washington.', 
'https://wsac.wa.gov/wcg', 1),

-- MASSACHUSETTS
('MASSGrant', 'Massachusetts Office of Student Financial Assistance', 400, 1900, '2025-05-01', 1, 0.0, 85000, 'any', 'MA', 
'Need-based grant for Massachusetts residents with high financial need.', 
'https://www.mass.edu/osfa/programs/massgrant.asp', 1),

-- ARIZONA
('Arizona Leveraging Educational Assistance Partnership', 'Arizona Commission for Postsecondary Education', 2000, 4000, '2025-04-30', 1, 2.5, 60000, 'any', 'AZ', 
'Need-based grant for Arizona residents attending Arizona colleges.', 
'https://highered.az.gov', 1),

-- ====================
-- MINORITY & DEMOGRAPHIC-SPECIFIC
-- ====================

('United Negro College Fund (UNCF) Scholarship', 'UNCF', 1000, 10000, '2025-10-31', 1, 2.5, NULL, 'any', 'any', 
'Various scholarships for African American students attending UNCF member institutions and other HBCUs.', 
'https://www.uncf.org/scholarships', 1),

('Hispanic Scholarship Fund', 'Hispanic Scholarship Fund', 500, 5000, '2025-02-15', 1, 3.0, NULL, 'any', 'any', 
'For students of Hispanic heritage pursuing higher education.', 
'https://www.hsf.net/scholarship', 1),

('American Indian College Fund', 'American Indian College Fund', 1000, 10000, '2025-05-31', 1, 2.0, NULL, 'any', 'any', 
'For Native American and Alaska Native students attending tribal colleges and universities.', 
'https://collegefund.org/students/scholarships/', 1),

('APIA Scholarship', 'APIA Scholars', 2500, 20000, '2025-01-15', 1, 2.7, 100000, 'any', 'any', 
'For Asian & Pacific Islander American students demonstrating financial need and community service.', 
'https://apiascholars.org/scholarship/', 1),

('Point Foundation Scholarship', 'Point Foundation', 4800, 30000, '2025-01-31', 1, 3.5, NULL, 'any', 'any', 
'For LGBTQ+ students who have demonstrated leadership and community involvement.', 
'https://pointfoundation.org/point-apply/', 1),

-- ====================
-- FIRST GENERATION & LOW-INCOME
-- ====================

('Horatio Alger Scholarship', 'Horatio Alger Association', 10000, 25000, '2025-10-25', 0, 2.0, 55000, 'any', 'any', 
'For students who have overcome significant adversity and demonstrate financial need.', 
'https://scholars.horatioalger.org', 1),

('QuestBridge National College Match', 'QuestBridge', 50000, 50000, '2025-09-26', 1, 3.5, 65000, 'any', 'any', 
'Full four-year scholarships to QuestBridge partner colleges for high-achieving, low-income students.', 
'https://www.questbridge.org/high-school-students/national-college-match', 1),

('Posse Foundation Scholarship', 'Posse Foundation', 50000, 50000, '2025-08-01', 1, 3.0, NULL, 'any', 'any', 
'Full-tuition leadership scholarships for public high school students with extraordinary academic and leadership potential.', 
'https://www.possefoundation.org', 1);

