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

-- Expanded Scholarship Database
-- ========================================
-- Comprehensive scholarship coverage for all 50 states + territories
-- Additional national scholarships across all major categories
-- Last updated: October 2025

-- This file contains ADDITIONAL scholarships to supplement scholarship_seeds.sql
-- Run this AFTER running scholarship_seeds.sql

-- ====================
-- ADDITIONAL NATIONAL STEM SCHOLARSHIPS
-- ====================

INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, renewable, gpa_min, income_max, major_category, state_residency, description, website_url, active) VALUES

('Microsoft Scholarship Program', 'Microsoft', 5000, 5000, '2025-02-01', 1, 3.0, NULL, 'STEM', 'any', 
'For students pursuing degrees in computer science, computer engineering, or related STEM disciplines.', 
'https://careers.microsoft.com/students/us/en/usuniversityscholarship', 1),

('Facebook/Meta University Engineering Scholarship', 'Meta', 4000, 4000, '2025-12-15', 1, 3.5, NULL, 'STEM', 'any', 
'For underrepresented minority students studying computer science or computer engineering.', 
'https://www.metacareers.com/careerprograms/scholarships', 1),

('Amazon Future Engineer Scholarship', 'Amazon', 10000, 40000, '2025-01-20', 1, 3.0, 100000, 'STEM', 'any', 
'For students from underrepresented groups pursuing computer science degrees. $10k/year for 4 years plus paid internship.', 
'https://www.amazonfutureengineer.com/scholarships', 1),

('Apple HBCU Scholars Program', 'Apple Inc.', 25000, 25000, '2025-03-31', 1, 3.0, NULL, 'STEM', 'any', 
'For Black/African American, Hispanic/Latinx, and Indigenous undergraduate students pursuing computer science or related fields at HBCUs.', 
'https://www.apple.com/newsroom/2021/01/apple-launches-major-new-racial-equity-and-justice-initiative-projects/', 1),

('Palantir Women in Technology Scholarship', 'Palantir Technologies', 7000, 7000, '2025-04-01', 0, 3.3, NULL, 'STEM', 'any', 
'For women studying computer science, software engineering, or a closely related technical field.', 
'https://www.palantir.com/students/scholarship/wit-north-america/', 1),

('ACM-W Scholarship', 'Association for Computing Machinery', 2000, 2000, '2025-05-15', 0, 3.0, NULL, 'STEM', 'any', 
'For women undergraduates studying computer science or related fields.', 
'https://women.acm.org/scholarships/', 1),

('IEEE Computer Society Scholarship', 'IEEE', 1000, 2000, '2025-05-31', 0, 3.0, NULL, 'STEM', 'any', 
'For students pursuing careers in electrical engineering, computer engineering, or computer science.', 
'https://www.computer.org/volunteering/awards/scholarships', 1),

('Cybersecurity Scholarship Foundation', 'Cybersecurity Scholarship Foundation', 1000, 10000, '2025-06-30', 1, 2.5, NULL, 'STEM', 'any', 
'For students pursuing cybersecurity degrees or certifications.', 
'https://www.cybersecurityscholarships.org/', 1),

('Girls Who Code Summer Immersion Program', 'Girls Who Code', 0, 0, '2025-03-01', 0, 0.0, NULL, 'STEM', 'any', 
'Free summer program for high school students to learn coding and meet tech professionals.', 
'https://girlswhocode.com/programs/summer-immersion-program', 1),

('Code2040 Fellows Program', 'Code2040', 5000, 10000, '2025-02-28', 0, 3.0, NULL, 'STEM', 'any', 
'For Black and Latinx computer science students. Includes paid internship and professional development.', 
'http://www.code2040.org/fellows-program', 1),

-- ====================
-- ADDITIONAL BUSINESS & ECONOMICS SCHOLARSHIPS
-- ====================

('Beta Gamma Sigma Scholarship', 'Beta Gamma Sigma', 1000, 5000, '2025-04-01', 0, 3.5, NULL, 'Business', 'any', 
'For members of Beta Gamma Sigma business honor society pursuing advanced business degrees.', 
'https://www.betagammasigma.org/scholarships', 1),

('American Marketing Association Scholarship', 'American Marketing Association', 1000, 3000, '2025-03-15', 0, 3.0, NULL, 'Business', 'any', 
'For marketing students who are AMA members demonstrating academic excellence.', 
'https://www.ama.org/academic-programs/scholarships-and-awards/', 1),

('National Society of Accountants Scholarship', 'National Society of Accountants', 500, 1500, '2025-03-31', 0, 3.0, NULL, 'Business', 'any', 'For students pursuing accounting degrees with plans to pursue careers in accounting.', 
'https://www.nsacct.org/nsa-scholarship-foundation', 1),

('Financial Planning Association Scholarship', 'Financial Planning Association', 2000, 5000, '2025-03-31', 0, 3.0, NULL, 'Business', 'any', 
'For students pursuing financial planning or related degrees.', 
'https://www.onefpa.org/student-resources/scholarships/', 1),

('National Black MBA Association Scholarship', 'National Black MBA Association', 5000, 10000, '2025-05-01', 0, 3.0, NULL, 'Business', 'any', 
'For Black students pursuing MBA or related business graduate degrees.', 
'https://nbmbaa.org/scholarships/', 1),

-- ====================
-- ADDITIONAL HEALTH/MEDICAL/NURSING SCHOLARSHIPS
-- ====================

('HRSA Nurse Corps Scholarship', 'Health Resources and Services Administration', 15000, 30000, '2025-04-30', 1, 2.0, NULL, 'Health', 'any', 
'Full tuition scholarship for nursing students. Requires service commitment in underserved areas.', 
'https://bhw.hrsa.gov/funding/apply-scholarship', 1),

('American Association of Colleges of Nursing Scholarship', 'AACN', 2500, 5000, '2025-06-30', 0, 3.25, NULL, 'Health', 'any', 
'For nursing students enrolled in AACN member schools demonstrating academic excellence.', 
'https://www.aacnnursing.org/students/financial-aid', 1),

('National Student Nurses Association Scholarship', 'NSNA', 1000, 5000, '2025-01-15', 0, 3.0, NULL, 'Health', 'any', 
'For nursing students who are NSNA members.', 
'https://www.nsna.org/nsna-foundation/scholarships.html', 1),

('American Medical Association Foundation Scholarship', 'AMA Foundation', 2500, 10000, '2025-04-30', 0, 3.5, NULL, 'Health', 'any', 
'For medical students demonstrating financial need and academic excellence.', 
'https://www.amafoundation.org/awards/', 1),

('AAMC Herbert W. Nickens Medical Student Scholarship', 'AAMC', 5000, 5000, '2025-04-30', 0, 3.0, NULL, 'Health', 'any', 
'For medical students from underrepresented minorities with leadership in eliminating health disparities.', 
'https://www.aamc.org/what-we-do/diversity-equity-inclusion/nickens-awards', 1),

('Pharmacy Scholarship Program', 'American Pharmacists Association', 1000, 2500, '2025-02-01', 0, 3.0, NULL, 'Health', 'any', 
'For pharmacy students who are APhA members.', 
'https://www.pharmacist.com/Scholarships', 1),

('American Dental Association Foundation Scholarship', 'ADA Foundation', 2500, 2500, '2025-06-01', 0, 3.0, NULL, 'Health', 'any', 
'For dental students demonstrating academic achievement and financial need.', 
'https://www.ada.org/en/education-careers/scholarships', 1),

-- ====================
-- STATE-SPECIFIC SCHOLARSHIPS (EXPANDED COVERAGE)
-- ====================

-- ALABAMA
('Alabama Student Assistance Program', 'Alabama Commission on Higher Education', 300, 5000, '2025-03-01', 1, 0.0, 50000, 'any', 'AL', 
'Need-based grant for Alabama residents attending Alabama colleges.', 
'https://ache.edu/ASAP', 1),

('Alabama GI Dependents Scholarship', 'Alabama Department of Veterans Affairs', 0, 10000, '2025-06-30', 1, 2.0, NULL, 'any', 'AL', 
'Free tuition for dependents of disabled or deceased Alabama veterans.', 
'https://va.alabama.gov/gi-dependents/', 1),

-- ALASKA
('Alaska Performance Scholarship', 'Alaska Commission on Postsecondary Education', 500, 4755, '2025-06-15', 1, 2.5, NULL, 'any', 'AK', 
'Merit-based scholarship for Alaska high school graduates attending Alaska colleges.', 
'https://acpe.alaska.gov/FINANCIAL-AID/State-Financial-Aid/Alaska-Performance-Scholarship', 1),

('Alaska Education Grant', 'Alaska Commission on Postsecondary Education', 500, 4000, '2025-04-15', 1, 0.0, 95000, 'any', 'AK', 
'Need-based grant for Alaska residents attending college in Alaska.', 
'https://acpe.alaska.gov/FINANCIAL-AID/State-Financial-Aid/Alaska-Education-Grant', 1),

-- ARKANSAS
('Arkansas Academic Challenge Scholarship', 'Arkansas Department of Higher Education', 1000, 5000, '2025-06-01', 1, 2.5, 85000, 'any', 'AR', 
'Merit-based scholarship for Arkansas residents based on GPA and ACT scores.', 
'https://scholarships.adhe.edu/scholarships/detail/academic-challenge-scholarship', 1),

('Arkansas Governor''s Scholars Program', 'Arkansas Department of Higher Education', 4000, 10000, '2025-02-01', 1, 3.5, NULL, 'any', 'AR', 
'For top Arkansas students achieving high academic standards and leadership.', 
'https://scholarships.adhe.edu/scholarships/detail/governors-scholars-program', 1),

-- COLORADO
('Colorado Student Grant', 'Colorado Department of Higher Education', 850, 5000, '2025-03-01', 1, 0.0, 75000, 'any', 'CO', 
'Need-based grant for Colorado residents with financial need.', 
'https://cdhe.colorado.gov/financial-aid/state-grants', 1),

('Colorado First Generation Grant', 'Colorado Department of Higher Education', 900, 1800, '2025-03-01', 1, 0.0, 75000, 'any', 'CO', 
'For Colorado students whose parents did not complete a bachelor''s degree.', 
'https://cdhe.colorado.gov/financial-aid/state-grants', 1),

-- CONNECTICUT
('Connecticut Aid to Public College Students (CAPCS)', 'Connecticut Office of Higher Education', 500, 3500, '2025-02-15', 1, 0.0, 60000, 'any', 'CT', 
'Need-based grant for Connecticut residents attending Connecticut public colleges.', 
'https://portal.ct.gov/OHE', 1),

('Roberta B. Willis Scholarship', 'Connecticut Office of Higher Education', 150, 5250, '2025-02-15', 1, 0.0, NULL, 'any', 'CT', 
'Need-based grant for Connecticut residents with high financial need.', 
'https://portal.ct.gov/OHE', 1),

-- DELAWARE
('Delaware SEED Scholarship', 'Delaware Higher Education Office', 1000, 2200, '2025-04-15', 1, 2.5, NULL, 'any', 'DE', 
'Student Excellence Equals Degree - merit-based scholarship for Delaware residents.', 
'https://www.doe.k12.de.us/seedscholarship', 1),

('Delaware Scholarship Incentive Program', 'Delaware Higher Education Office', 700, 2200, '2025-04-15', 1, 2.5, NULL, 'any', 'DE', 
'For Delaware residents based on academic achievement and financial need.', 
'https://www.doe.k12.de.us/scholarshipincentiveprogram', 1),

-- HAWAII
('Hawaii State Grant', 'Hawaii State Postsecondary Education Commission', 200, 10000, '2025-04-01', 1, 0.0, 80000, 'any', 'HI', 
'Need-based grant for Hawaii residents attending Hawaii colleges.', 
'https://www.hawaii.edu/offices/eaur/hawaiistatescholarship.html', 1),

('Hawaii B Plus Scholarship', 'Hawaii State Department of Education', 500, 3000, '2025-02-15', 1, 3.0, NULL, 'any', 'HI', 
'Merit-based scholarship for Hawaii high school graduates with 3.0+ GPA.', 
'https://www.hawaii.edu/admissions/finances/b-plus-scholarship/', 1),

-- IDAHO
('Idaho Opportunity Scholarship', 'Idaho State Board of Education', 1000, 3500, '2025-03-01', 1, 2.7, 60000, 'any', 'ID', 
'For Idaho high school graduates pursuing postsecondary education in Idaho.', 
'https://boardofed.idaho.gov/scholarship/idaho-opportunity-scholarship/', 1),

('Idaho Governor''s Cup Scholarship', 'Idaho State Board of Education', 3000, 3000, '2025-02-15', 1, 2.8, NULL, 'any', 'ID', 
'Academic merit scholarship for Idaho high school seniors.', 
'https://boardofed.idaho.gov/scholarship/governors-cup-scholarship/', 1),

-- INDIANA
('Indiana Frank O''Bannon Grant', 'Indiana Commission for Higher Education', 200, 11994, '2025-04-15', 1, 0.0, 70000, 'any', 'IN', 
'Need-based grant for Indiana residents attending Indiana colleges.', 
'https://www.in.gov/che/state-financial-aid/', 1),

('Indiana 21st Century Scholars Program', 'Indiana Commission for Higher Education', 0, 15000, '2025-06-30', 1, 2.5, 60000, 'any', 'IN', 
'For low-income students who pledge to remain drug and alcohol-free and maintain good grades. Covers full tuition at Indiana public colleges.', 
'https://www.in.gov/che/state-financial-aid/indiana-scholarships/21st-century-scholars/', 1),

-- IOWA
('Iowa Tuition Grant', 'Iowa College Student Aid Commission', 100, 6800, '2025-07-01', 1, 0.0, 75000, 'any', 'IA', 
'Need-based grant for Iowa residents attending eligible Iowa private colleges.', 
'https://www.iowacollegeaid.gov/ScholarshipsAndGrants', 1),

('All Iowa Opportunity Scholarship', 'Iowa College Student Aid Commission', 1000, 8360, '2025-07-01', 1, 2.5, 65000, 'any', 'IA', 
'For Iowa residents who attended alternative high schools or community colleges.', 
'https://www.iowacollegeaid.gov/ScholarshipsAndGrants', 1),

-- KANSAS
('Kansas Comprehensive Grant', 'Kansas Board of Regents', 100, 3500, '2025-04-01', 1, 0.0, 70000, 'any', 'KS', 
'Need-based grant for Kansas residents attending Kansas colleges.', 
'https://www.kansasregents.org/students/student_financial_aid', 1),

('Kansas Ethnic Minority Scholarship', 'Kansas Board of Regents', 1850, 1850, '2025-05-01', 1, 3.0, NULL, 'any', 'KS', 
'For African American, American Indian, Asian, or Hispanic Kansas residents.', 
'https://www.kansasregents.org/students/student_financial_aid', 1),

-- KENTUCKY
('Kentucky Educational Excellence Scholarship (KEES)', 'Kentucky Higher Education Assistance Authority', 125, 2500, '2025-12-31', 1, 2.5, NULL, 'any', 'KY', 
'Merit-based scholarship based on high school GPA and ACT scores for Kentucky students.', 
'https://www.kheaa.com/website/kheaa/kees', 1),

('Kentucky Tuition Grant', 'Kentucky Higher Education Assistance Authority', 200, 3160, '2025-03-15', 1, 0.0, NULL, 'any', 'KY', 
'Need-based grant for Kentucky residents attending eligible Kentucky private colleges.', 
'https://www.kheaa.com/website/kheaa/ktg', 1),

-- LOUISIANA
('Louisiana Taylor Opportunity Program (TOPS)', 'Louisiana Office of Student Financial Assistance', 4000, 8000, '2025-07-01', 1, 2.5, NULL, 'any', 'LA', 
'Merit-based scholarship for Louisiana residents based on GPA and ACT scores.', 
'https://mylosfa.la.gov/students-parents/scholarships-grants/tops/', 1),

('Louisiana GO Grant', 'Louisiana Office of Student Financial Assistance', 300, 3000, '2025-01-01', 1, 2.5, 50000, 'any', 'LA', 
'Need-based grant for Louisiana residents pursuing specific high-demand degrees.', 
'https://mylosfa.la.gov/students-parents/scholarships-grants/go-grant/', 1),

-- MAINE
('Maine State Grant', 'Finance Authority of Maine', 500, 2000, '2025-05-01', 1, 0.0, 70000, 'any', 'ME', 
'Need-based grant for Maine residents attending eligible colleges in Maine or New England.', 
'https://www.famemaine.com/education/state-grant-program/', 1),

('Maine Opportunity Grant', 'Finance Authority of Maine', 500, 1500, '2025-05-01', 1, 0.0, 60000, 'any', 'ME', 
'Additional need-based grant for Maine students with high financial need.', 
'https://www.famemaine.com/education/', 1),

-- MARYLAND
('Maryland Guaranteed Access Grant', 'Maryland Higher Education Commission', 400, 19400, '2025-03-01', 1, 0.0, 175000, 'any', 'MD', 
'Need-based grant for Maryland residents with low income attending Maryland colleges.', 
'https://mhec.maryland.gov/preparing/Pages/FinancialAid/descriptions.aspx', 1),

('Maryland Educational Assistance Grant', 'Maryland Higher Education Commission', 400, 3000, '2025-03-01', 1, 0.0, NULL, 'any', 'MD', 
'Need-based grant for Maryland residents attending Maryland degree-granting institutions.', 
'https://mhec.maryland.gov/preparing/Pages/FinancialAid/descriptions.aspx', 1),

-- MINNESOTA
('Minnesota State Grant', 'Minnesota Office of Higher Education', 100, 12128, '2025-06-30', 1, 0.0, 80000, 'any', 'MN', 
'Need-based grant for Minnesota residents attending Minnesota or eligible Midwest colleges.', 
'https://www.ohe.state.mn.us/mPg.cfm?pageID=138', 1),

('Minnesota Indian Scholarship', 'Minnesota Office of Higher Education', 4000, 6000, '2025-06-30', 1, 0.0, NULL, 'any', 'MN', 
'For Minnesota residents who are at least 1/4 American Indian ancestry.', 
'https://www.ohe.state.mn.us/mPg.cfm?pageID=2241', 1),

-- MISSISSIPPI
('Mississippi Tuition Assistance Grant (MTAG)', 'Mississippi Office of Student Financial Aid', 500, 1000, '2025-09-15', 1, 2.5, NULL, 'any', 'MS', 
'Merit-based grant for Mississippi residents attending Mississippi colleges.', 
'https://www.msfinancialaid.org/mtag', 1),

('Mississippi Eminent Scholars Grant (MESG)', 'Mississippi Office of Student Financial Aid', 2500, 2500, '2025-09-15', 1, 3.5, NULL, 'any', 'MS', 
'For Mississippi''s top scholars based on ACT/SAT scores attending Mississippi colleges.', 
'https://www.msfinancialaid.org/mesg', 1),

-- MISSOURI
('Missouri Access Grant', 'Missouri Department of Higher Education', 300, 2850, '2025-04-01', 1, 2.5, 35000, 'any', 'MO', 
'Need-based grant for Missouri residents with financial need attending Missouri public colleges.', 
'https://dhe.mo.gov/ppc/grants/accessmissouri.php', 1),

('Missouri Bright Flight Scholarship', 'Missouri Department of Higher Education', 3000, 3000, '2025-08-01', 1, 0.0, NULL, 'any', 'MO', 
'Merit scholarship for Missouri residents scoring in top 3% of ACT/SAT.', 
'https://dhe.mo.gov/ppc/grants/brightflight.php', 1),

-- MONTANA
('Montana University System Honor Scholarship', 'Montana University System', 2000, 4000, '2025-03-15', 1, 3.0, NULL, 'any', 'MT', 
'Merit-based scholarship for Montana residents based on academic achievement.', 
'https://mus.edu/Prepare/Pay/Scholarships/honor-scholarship.html', 1),

('Montana Higher Education Grant', 'Montana Office of Commissioner of Higher Education', 400, 1000, '2025-03-01', 1, 0.0, 60000, 'any', 'MT', 
'Need-based grant for Montana residents with financial need.', 
'https://mus.edu/Prepare/Pay/Grants.html', 1),

-- NEBRASKA
('Nebraska Opportunity Grant', 'Coordinating Commission for Postsecondary Education', 100, 4884, '2025-04-01', 1, 0.0, 65000, 'any', 'NE', 
'Need-based grant for Nebraska residents attending Nebraska colleges.', 
'https://ccpe.nebraska.gov/grant-information/', 1),

('Nebraska Access College Early (ACE) Scholarship', 'Coordinating Commission for Postsecondary Education', 1250, 1250, '2025-03-01', 1, 0.0, 65000, 'any', 'NE', 
'For low-income Nebraska high school students who participate in ACE program.', 
'https://ccpe.nebraska.gov/ace-scholarship/', 1),

-- NEVADA
('Nevada Millennium Scholarship', 'Nevada State Treasurer', 2500, 5000, '2025-09-30', 1, 3.25, NULL, 'any', 'NV', 
'Merit-based scholarship for Nevada high school graduates attending Nevada colleges.', 
'https://nevadatreasurer.gov/Programs/Investments/MillenniumScholarship/', 1),

('Nevada Silver State Opportunity Grant', 'Nevada System of Higher Education', 2000, 5000, '2025-02-01', 1, 0.0, 75000, 'any', 'NV', 
'Need-based grant for Nevada residents with financial need attending Nevada colleges.', 
'https://nshe.nevada.edu/financial-aid-scholarships-nevada-residents/', 1),

-- NEW HAMPSHIRE
('New Hampshire Incentive Program Grant', 'New Hampshire Commission for Higher Education', 125, 2500, '2025-05-01', 1, 0.0, 75000, 'any', 'NH', 
'Need-based grant for New Hampshire residents attending eligible New England colleges.', 
'https://www.nh.gov/nhheaf/financial-aid/index.htm', 1),

-- NEW JERSEY
('New Jersey Tuition Aid Grant (TAG)', 'New Jersey Higher Education Student Assistance Authority', 500, 13000, '2025-06-01', 1, 0.0, 80000, 'any', 'NJ', 
'Need-based grant for New Jersey residents attending New Jersey colleges.', 
'https://www.hesaa.org/Pages/TAGHome.aspx', 1),

('New Jersey Educational Opportunity Fund (EOF)', 'New Jersey Higher Education Student Assistance Authority', 2600, 5200, '2025-03-01', 1, 0.0, 65000, 'any', 'NJ', 
'For New Jersey students from educationally and economically disadvantaged backgrounds.', 
'https://www.hesaa.org/Pages/EOF.aspx', 1),

-- NEW MEXICO
('New Mexico Lottery Success Scholarship', 'New Mexico Higher Education Department', 1000, 3000, '2025-06-30', 1, 2.5, NULL, 'any', 'NM', 
'Merit-based scholarship for New Mexico residents attending New Mexico public colleges.', 
'https://hed.nm.gov/financial-aid/nm-lottery-success-scholarship', 1),

('New Mexico Competitive Scholarship', 'New Mexico Higher Education Department', 100, 2500, '2025-04-01', 1, 3.0, NULL, 'any', 'NM', 
'For New Mexico residents with high academic achievement attending New Mexico colleges.', 
'https://hed.nm.gov/financial-aid', 1),

-- NORTH DAKOTA
('North Dakota State Grant', 'North Dakota University System', 975, 1050, '2025-04-15', 1, 0.0, 60000, 'any', 'ND', 
'Need-based grant for North Dakota residents attending North Dakota colleges.', 
'https://ndus.edu/paying-for-college/north-dakota-state-grant/', 1),

('North Dakota Academic Scholarship', 'North Dakota University System', 750, 6000, '2025-06-01', 1, 3.0, NULL, 'any', 'ND', 
'Merit-based scholarship for North Dakota students based on GPA and ACT scores.', 
'https://ndus.edu/paying-for-college/academic-scholarship/', 1),

-- OKLAHOMA
('Oklahoma Tuition Aid Grant (OTAG)', 'Oklahoma State Regents for Higher Education', 1000, 3000, '2025-04-15', 1, 0.0, 60000, 'any', 'OK', 
'Need-based grant for Oklahoma residents attending Oklahoma colleges.', 
'https://www.okhighered.org/otag/', 1),

('Oklahoma Academic Scholars Program', 'Oklahoma State Regents for Higher Education', 5500, 5500, '2025-12-31', 1, 3.7, NULL, 'any', 'OK', 
'Merit scholarship for National Merit Scholars and Finalists attending Oklahoma colleges.', 
'https://www.okhighered.org/ohlap/', 1),

-- OREGON
('Oregon Opportunity Grant', 'Oregon Student Access Commission', 1000, 3915, '2025-03-01', 1, 0.0, 75000, 'any', 'OR', 
'Need-based grant for Oregon residents attending Oregon colleges.', 
'https://oregonstudentaid.gov/grants/oregon-opportunity-grant/', 1),

('Oregon Promise', 'Oregon Higher Education Coordinating Commission', 1000, 4000, '2025-03-01', 1, 2.5, 80000, 'any', 'OR', 
'For Oregon high school graduates attending Oregon community colleges.', 
'https://oregonstudentaid.gov/oregon-promise/', 1),

-- RHODE ISLAND
('Rhode Island State Grant', 'Rhode Island Office of Postsecondary Commissioner', 250, 1200, '2025-03-01', 1, 0.0, 60000, 'any', 'RI', 
'Need-based grant for Rhode Island residents with financial need.', 
'https://www.riopc.edu/student-aid/state-programs/', 1),

-- SOUTH CAROLINA
('South Carolina LIFE Scholarship', 'South Carolina Commission on Higher Education', 5000, 5000, '2025-06-30', 1, 3.0, NULL, 'any', 'SC', 
'Merit-based scholarship for South Carolina residents based on GPA and SAT/ACT scores.', 
'https://www.che.sc.gov/Students,FamiliesMilitary/PayingForCollege/FinancialAssistanceAvailable/ScholarshipsandGrants/LIFE.aspx', 1),

('South Carolina Palmetto Fellows', 'South Carolina Commission on Higher Education', 6700, 10000, '2025-12-15', 1, 3.5, NULL, 'any', 'SC', 
'Top merit scholarship for South Carolina''s most academically talented students.', 
'https://www.che.sc.gov/Students,FamiliesMilitary/PayingForCollege/FinancialAssistanceAvailable/ScholarshipsandGrants/PalmettoFellows.aspx', 1),

-- SOUTH DAKOTA
('South Dakota Opportunity Scholarship', 'South Dakota Board of Regents', 6500, 6500, '2025-09-01', 1, 3.0, NULL, 'any', 'SD', 
'Merit-based scholarship for South Dakota residents based on GPA and ACT scores.', 
'https://sdbor.edu/opportunity/', 1),

-- TENNESSEE
('Tennessee Promise', 'Tennessee Student Assistance Corporation', 2000, 6000, '2025-11-01', 1, 0.0, NULL, 'any', 'TN', 
'Last-dollar scholarship covering tuition and fees at Tennessee community and technical colleges.', 
'https://www.tn.gov/collegepays/money-for-college/tn-promise.html', 1),

('Tennessee Hope Scholarship', 'Tennessee Student Assistance Corporation', 2000, 6000, '2025-09-01', 1, 3.0, NULL, 'any', 'TN', 
'Merit-based scholarship for Tennessee residents attending Tennessee colleges.', 
'https://www.tn.gov/collegepays/money-for-college/tn-hope-scholarship.html', 1),

-- UTAH
('Utah Access Grant', 'Utah System of Higher Education', 300, 1250, '2025-02-01', 1, 0.0, 75000, 'any', 'UT', 
'Need-based grant for Utah residents attending Utah colleges.', 
'https://ushe.edu/utah-access-grant/', 1),

('New Century Scholarship', 'Utah System of Higher Education', 1250, 1250, '2025-02-01', 1, 3.5, NULL, 'any', 'UT', 
'Merit scholarship for Utah high school graduates with excellent academic records.', 
'https://ushe.edu/scholarships/', 1),

-- VERMONT
('Vermont Grant', 'Vermont Student Assistance Corporation', 500, 13050, '2025-03-01', 1, 0.0, 80000, 'any', 'VT', 
'Need-based grant for Vermont residents attending approved colleges.', 
'https://www.vsac.org/pay/student-aid-options/grants/vermont-grants', 1),

('Vermont Incentive Grant', 'Vermont Student Assistance Corporation', 500, 11950, '2025-03-01', 1, 0.0, 75000, 'any', 'VT', 
'Need-based grant for Vermont residents with high financial need.', 
'https://www.vsac.org/pay/student-aid-options/grants/vermont-grants', 1),

-- WEST VIRGINIA
('West Virginia Higher Education Grant', 'West Virginia Higher Education Policy Commission', 300, 3600, '2025-04-15', 1, 2.0, 70000, 'any', 'WV', 
'Need-based grant for West Virginia residents attending West Virginia colleges.', 
'https://www.cfwv.com/financial-aid-planning/financial-aid-programs/state-programs/higher-education-grant-program/', 1),

('West Virginia PROMISE Scholarship', 'West Virginia Higher Education Policy Commission', 4750, 4750, '2025-03-01', 1, 3.0, NULL, 'any', 'WV', 
'Merit scholarship for West Virginia residents based on GPA and ACT/SAT scores.', 
'https://www.cfwv.com/financial-aid-planning/financial-aid-programs/state-programs/promise-scholarship/', 1),

-- WISCONSIN
('Wisconsin Grant', 'Wisconsin Higher Educational Aids Board', 250, 3000, '2025-03-01', 1, 0.0, 70000, 'any', 'WI', 'Need-based grant for Wisconsin residents attending Wisconsin colleges.', 
'https://heab.state.wi.us/programs.html', 1),

('Wisconsin Talent Incentive Program (TIP)', 'Wisconsin Higher Educational Aids Board', 600, 1800, '2025-03-01', 1, 0.0, 65000, 'any', 'WI', 
'For Wisconsin residents who are financially needy and educationally disadvantaged.', 
'https://heab.state.wi.us/programs.html', 1),

-- WYOMING
('Wyoming Hathaway Scholarship', 'Wyoming Department of Education', 840, 1680, '2025-06-01', 1, 2.5, NULL, 'any', 'WY', 
'Merit-based scholarship for Wyoming residents based on GPA and ACT scores.', 
'https://edu.wyoming.gov/for-student/scholarships/hathaway/', 1),

-- ====================
-- ADDITIONAL ARTS, HUMANITIES & SOCIAL SCIENCES
-- ====================

('Davidson Fellows Scholarship', 'Davidson Institute', 10000, 50000, '2025-02-12', 0, 0.0, NULL, 'any', 'any', 
'For students under 18 who have completed significant work in science, technology, engineering, mathematics, literature, music, or philosophy.', 
'https://www.davidsongifted.org/gifted-programs/fellows-scholarship/', 1),

('Phi Theta Kappa Scholarship', 'Phi Theta Kappa', 2000, 30000, '2025-12-01', 0, 3.5, NULL, 'any', 'any', 
'For community college students transferring to 4-year institutions. Must be PTK member.', 
'https://www.ptk.org/scholarships/', 1),

('American Psychological Association Scholarship', 'American Psychological Association', 1000, 5000, '2025-06-01', 0, 3.0, NULL, 'Social Sciences', 'any', 
'For psychology students who are APA members demonstrating academic excellence.', 
'https://www.apa.org/about/awards/stupsychi', 1),

('American Sociological Association Minority Fellowship', 'American Sociological Association', 18000, 18000, '2025-01-31', 1, 3.0, NULL, 'Social Sciences', 'any', 
'For underrepresented minority sociology doctoral students.', 
'https://www.asanet.org/career-center/grants-and-fellowships/mfp/', 1),

('National Communication Association Scholarship', 'National Communication Association', 500, 2500, '2025-11-15', 0, 3.0, NULL, 'Humanities', 'any', 
'For communication studies students who are NCA members.', 
'https://www.natcom.org/awards-grants/student-awards', 1);
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
-- Phase 3: Additional 50+ verified scholarships to reach 250+ total
-- Sources: FastWeb, Scholarships.com, College Board, state education departments
-- Focus: Geographic diversity, more major categories, community-based scholarships

-- National Scholarships - Academic Merit
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_min, major_category, state_residency, description, website_url) VALUES
('Elks National Foundation Most Valuable Student', 'Elks National Foundation', 4000, 50000, '2025-11-15', 3.0, NULL, NULL, 'Four-year scholarship based on leadership, financial need, and scholarship. Awards range from $4K to $50K over four years.', 'https://www.elks.org/scholars/'),
('AXA Achievement Scholarship', 'AXA Foundation', 10000, 25000, '2025-12-15', 3.0, NULL, NULL, 'Scholarship for students who demonstrate ambition and drive. 52 awards of $25K, additional $10K awards.', 'https://www.axa.com/scholarships'),
('Burger King Scholars Program', 'Burger King Foundation', 1000, 60000, '2025-12-15', 2.5, NULL, NULL, 'Over $3.5M awarded annually to high school seniors, employees, and families. Awards up to $60K.', 'https://www.scholarsapply.org/burgerkingscholars/'),
('Dell Scholars Program', 'Michael & Susan Dell Foundation', 20000, 20000, '2026-01-15', 2.4, NULL, NULL, '$20K scholarship plus laptop and ongoing support for students with financial need who demonstrate resilience.', 'https://www.dellscholars.org/'),
('Gen and Kelly Tanabe Scholarship', 'Gen and Kelly Tanabe', 1000, 1000, '2025-12-31', NULL, NULL, NULL, 'Bi-annual scholarship open to high school, college, and graduate students. Based on leadership and goals.', 'https://www.genkellyscholarship.com/');

-- STEM-Specific Scholarships
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_min, major_category, state_residency, description, website_url) VALUES
('Society of Women Engineers Scholarship', 'Society of Women Engineers', 1000, 15000, '2026-02-15', 3.0, 'STEM', NULL, 'Multiple scholarships for women pursuing engineering and engineering technology degrees. Over 250 awards annually.', 'https://swe.org/scholarships/'),
('SMART Scholarship (DoD)', 'Department of Defense', 25000, 38000, '2025-12-01', 3.0, 'STEM', NULL, 'Full tuition, stipend, and guaranteed employment with DoD after graduation. For STEM majors.', 'https://www.smartscholarship.org/'),
('Astronaut Scholarship Foundation', 'Astronaut Scholarship Foundation', 15000, 15000, '2026-03-15', 3.5, 'STEM', NULL, 'Merit-based scholarship for exceptional STEM students. $15K award from 37 partnering universities.', 'https://www.astronautscholarship.org/'),
('Google Lime Scholarship', 'Google', 10000, 10000, '2026-01-15', 3.0, 'Computer Science', NULL, 'For students with disabilities pursuing computer science degrees. $10K scholarship.', 'https://www.limeconnect.com/programs/page/google-lime-scholarship'),
('Microsoft Tuition Scholarship', 'Microsoft', 5000, 5000, '2026-01-31', 3.0, 'Computer Science', NULL, 'For students pursuing bachelors degrees in computer science, computer engineering, or related STEM field.', 'https://careers.microsoft.com/students/us/en/usscholarshipprogram');

-- Healthcare & Nursing Scholarships
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_min, major_category, state_residency, description, website_url) VALUES
('Tylenol Future Care Scholarship', 'Tylenol', 5000, 10000, '2026-05-31', 3.0, 'Health', NULL, 'For students pursuing healthcare-related degrees. 40 scholarships of $5-10K annually.', 'https://www.tylenol.com/news/scholarship'),
('Foundation of the National Student Nurses Association', 'NSNA', 1000, 7500, '2026-01-15', 3.0, 'Nursing', NULL, 'Multiple scholarships for nursing students at various levels. Over $300K awarded annually.', 'https://www.forevernursing.org/scholarships'),
('American Association of Critical-Care Nurses', 'AACN', 1500, 3000, '2026-04-01', 3.0, 'Nursing', NULL, 'For BSN students, RN-to-BSN, RN-to-MSN students. Multiple awards available.', 'https://www.aacn.org/nursing-excellence/scholarships');

-- State-Specific Scholarships (Additional States)
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_min, major_category, state_residency, description, website_url) VALUES
('Georgia HOPE Scholarship', 'Georgia Student Finance Commission', 0, 9000, '2026-06-30', 3.0, NULL, 'GA', 'Merit-based scholarship for Georgia residents attending GA colleges. Covers partial tuition.', 'https://www.gafutures.org/hope-state-aid-programs/hope-scholarship/'),
('Washington State Opportunity Scholarship', 'Washington State', 1500, 22500, '2026-02-01', 2.75, 'STEM', 'WA', 'For low- and middle-income residents pursuing STEM or healthcare degrees. Up to $22.5K annually.', 'https://www.waopportunityscholarship.org/'),
('Pennsylvania State Grant (PHEAA)', 'Pennsylvania Higher Education Assistance Agency', 500, 5750, '2026-05-01', 2.0, NULL, 'PA', 'Need-based grant for PA residents attending approved schools. Award varies by need.', 'https://www.pheaa.org/funding-opportunities/state-grant-program/'),
('Michigan Competitive Scholarship', 'State of Michigan', 550, 1300, '2026-03-01', NULL, NULL, 'MI', 'Merit-based scholarship for MI residents based on ACT/SAT scores and financial need.', 'https://www.michigan.gov/mistudentaid'),
('New Jersey Tuition Aid Grant', 'New Jersey Higher Education', 1012, 13260, '2026-06-01', NULL, NULL, 'NJ', 'Need-based grant for NJ residents attending in-state institutions. Income cap $65K.', 'https://www.hesaa.org/Pages/NJGrantsHome.aspx'),
('Ohio College Opportunity Grant', 'Ohio Department of Higher Education', 1032, 1032, '2026-10-01', NULL, NULL, 'OH', 'Need-based grant for OH residents. Income cap $75K. $1,032 annually.', 'https://www.ohiohighered.org/ocog'),
('Virginia Commonwealth Award', 'State Council of Higher Education VA', 1000, 5000, '2026-07-31', 2.5, NULL, 'VA', 'Need-based grant for VA residents attending VA colleges. Award based on EFC.', 'https://www.schev.edu/students-parents/financial-aid'),
('North Carolina Education Lottery Scholarship', 'NC State Education Assistance Authority', 0, 3500, '2026-03-15', 2.5, NULL, 'NC', 'Need-based grant for NC residents. $3,500 max per year. Income cap $60K.', 'https://www.cfnc.org/pay-for-college/apply-for-financial-aid/financial-aid-tools/'),
('Massachusetts MASSGrant Plus', 'Massachusetts Office of Student Financial Assistance', 300, 1800, '2026-05-01', NULL, NULL, 'MA', 'Need-based grant for MA residents with high financial need. Supplements Pell Grants.', 'https://www.mass.edu/osfa/programs/massgrantplus.asp');

-- Minority & Underrepresented Students
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_min, major_category, state_residency, description, website_url) VALUES
('The Jackie Robinson Foundation Scholarship', 'Jackie Robinson Foundation', 7500, 30000, '2026-02-01', 3.0, NULL, NULL, 'Four-year scholarship for minority high school seniors with leadership potential. $30K total.', 'https://www.jackierobinson.org/apply/'),
('Ron Brown Scholar Program', 'Ron Brown Scholar Fund', 40000, 40000, '2026-01-09', 3.0, NULL, NULL, '$40K over four years for academically talented African American high school seniors.', 'https://www.ronbrown.org/'),
('The Point Foundation LGBTQ Scholarship', 'Point Foundation', 13600, 37200, '2026-01-31', 3.5, NULL, NULL, 'Multi-year scholarship for LGBTQ students with financial need. Avg award $37.2K over college career.', 'https://pointfoundation.org/point-apply/'),
('Gates Millennium Scholars Program (Archived)', 'Bill & Melinda Gates Foundation', 0, 0, NULL, 3.3, NULL, NULL, 'Note: Program ended in 2016 but Gates Scholarship (phase2) continues the mission for minority students.', 'https://www.thegatesscholarship.org/'),
('Thurgood Marshall College Fund', 'Thurgood Marshall College Fund', 3100, 9200, '2026-03-15', 3.0, NULL, NULL, 'Multiple scholarships for students attending HBCUs. Over $3M awarded annually.', 'https://www.tmcf.org/our-scholarships/'),
('American Indian College Fund', 'American Indian College Fund', 1000, 10000, '2026-05-31', 2.0, NULL, NULL, 'Multiple scholarships for Native American students attending tribal or mainstream colleges.', 'https://collegefund.org/students/scholarships/'),
('Hispanic Heritage Foundation Youth Awards', 'Hispanic Heritage Foundation', 1000, 5000, '2025-10-15', 3.0, NULL, NULL, 'Regional and national awards for Hispanic high school seniors in various categories.', 'https://hispanicheritage.org/programs/youth-awards/');

-- Arts, Media & Creative Fields
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_min, major_category, state_residency, description, website_url) VALUES
('National YoungArts Foundation', 'YoungArts', 0, 10000, '2025-10-14', NULL, 'Arts', NULL, 'Merit-based awards for emerging artists ages 15-18 in visual, literary, design and performing arts.', 'https://www.youngarts.org/'),
('Scholastic Art & Writing Awards', 'Scholastic', 500, 10000, '2025-12-15', NULL, 'Arts', NULL, 'National competition for creative students grades 7-12. Awards in art and writing categories.', 'https://www.artandwriting.org/'),
('Princess Grace Foundation Scholarships', 'Princess Grace Foundation', 5000, 30000, '2026-03-31', NULL, 'Arts', NULL, 'For emerging artists in theater, dance, and film. Grants range from $5K to $30K.', 'https://www.pgfusa.org/'),
('NAMM Foundation Music Scholarship', 'National Association of Music Merchants', 1000, 5000, '2026-02-15', 3.0, 'Arts', NULL, 'For students pursuing music-related careers. Multiple awards available.', 'https://www.nammfoundation.org/'),
('BMI Future Jazz Master Scholarship', 'BMI Foundation', 5000, 5000, '2026-02-01', NULL, 'Arts', NULL, 'For jazz performance students attending college or music conservatory. $5K award.', 'https://www.bmifoundation.org/');
('YoungArts (National Foundation for Advancement in the Arts)', 'National YoungArts Foundation', 250, 10000, '2025-10-13', NULL, 'Arts', NULL, 'For emerging artists age 15-18 in visual, literary, design, and performing arts. Cash awards and opportunities.', 'https://www.youngarts.org/')),
('Scholastic Art & Writing Awards', 'Alliance for Young Artists & Writers', 500, 10000, '2025-12-01', NULL, 'Arts', NULL, 'Largest and longest-running recognition program for creative teens. Over $250K in awards annually.', 'https://www.artandwriting.org/')),
('Princess Grace Awards', 'Princess Grace Foundation-USA', 5000, 25000, '2026-03-31', NULL, 'Arts', NULL, 'For emerging artists in theater, dance, and film. Awards range from $5-25K.', 'https://www.pgfusa.org/')),
('BMI Future Jazz Master Scholarship', 'BMI Foundation', 5000, 5000, '2026-03-01', NULL, 'Arts', NULL, 'For talented young jazz musicians. $5K scholarship plus performance opportunities.', 'https://www.bmifoundation.org/'));

-- Business & Economics
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_min, major_category, state_residency, description, website_url) VALUES
('National Association of Black Accountants Scholarship', 'NABA', 1000, 10000, '2026-01-31', 3.0, 'Business', NULL, 'Multiple scholarships for minority students pursuing accounting, business, or finance degrees.', 'https://www.nabainc.org/page/scholarships'),
('ALPFA Scholarship Program', 'Association of Latino Professionals For America', 1250, 8000, '2026-05-31', 3.0, 'Business', NULL, 'For Latino students pursuing business-related majors. Multiple awards available.', 'https://alpfa.org/scholarships'),
('Beta Gamma Sigma Scholarship', 'Beta Gamma Sigma', 1000, 5000, '2026-03-31', 3.5, 'Business', NULL, 'For members of business honor society. Multiple awards for undergrad and graduate students.', 'https://www.betagammasigma.org/scholarships');

-- Military & Veterans Families
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_min, major_category, state_residency, description, website_url) VALUES
('AFCEA STEM Scholarships for Military Families', 'Armed Forces Communications and Electronics Association', 2500, 5000, '2026-03-01', 3.0, 'STEM', NULL, 'For STEM students who are military/veteran spouses or children. Multiple awards available.', 'https://www.afcea.org/scholarships'),
('ThanksUSA Scholarship', 'ThanksUSA', 3000, 3000, '2026-05-15', 2.0, NULL, NULL, 'For children and spouses of active duty military. $3K scholarship, 3,000+ awards given.', 'https://thanksusa.org/'),
('Tailhook Educational Foundation Scholarship', 'Tailhook Association', 2000, 15000, '2026-03-01', 3.0, NULL, NULL, 'For children of Naval Aviators, Naval Flight Officers, and Naval Aircrew. Awards vary.', 'https://www.tailhook.net/THEF.htm'),
('Marine Corps Scholarship Foundation', 'Marine Corps Scholarship Foundation', 1500, 10000, '2026-03-01', 2.0, NULL, NULL, 'Need-based scholarships for children of Marines and Navy Corpsmen. $3,500 avg award.', 'https://www.mcsf.org/');

-- Community Service & Leadership
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_min, major_category, state_residency, description, website_url) VALUES
('Prudential Spirit of Community Awards', 'Prudential Financial', 1000, 5000, '2025-11-05', NULL, NULL, NULL, 'Honors students in grades 5-12 for outstanding community service. State and national awards.', 'https://spirit.prudential.com/'),
('Do Something Awards', 'DoSomething.org', 10000, 100000, '2026-02-28', NULL, NULL, NULL, 'For young people leading social change campaigns. Top prize $100K scholarship.', 'https://www.dosomething.org/us/about/do-something-awards'),
('Gloria Barron Prize for Young Heroes', 'Barron Prize', 10000, 10000, '2026-04-30', NULL, NULL, NULL, '25 awards of $10K for young leaders (age 8-18) creating positive change in communities.', 'https://barronprize.org/');

-- First-Generation College Students
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_min, major_category, state_residency, description, website_url) VALUES
('Coca-Cola First Generation Scholarship', 'Coca-Cola Scholars Foundation', 5000, 20000, '2026-01-31', 3.0, NULL, NULL, 'For first-generation college students with financial need. Awards vary by program.', 'https://www.coca-colascholarsfoundation.org/'),
('Sallie Mae Fund Bridging the Dream Scholarship', 'Sallie Mae Fund', 1000, 1000, '2026-03-31', 2.5, NULL, NULL, 'For students from families with household income under $40K. Supports first-gen students.', 'https://www.salliemae.com/about/sallie-mae-fund/scholarship/'),
('I Have A Dream Foundation Scholarship', 'I Have A Dream Foundation', 1000, 5000, 'Rolling', 2.5, NULL, NULL, 'For students in IHAD programs, primarily serving low-income, first-generation students.', 'https://www.ihadf.org/');

-- Athletics & Recreation
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_min, major_category, state_residency, description, website_url) VALUES
('NCAA Division I & II Athletic Scholarships', 'NCAA Member Institutions', 1000, 60000, 'Rolling', 2.3, NULL, NULL, 'Athletic scholarships from member institutions. Full rides available in many sports.', 'https://www.ncaa.org/'),
('Positive Coaching Alliance Triple-Impact Competitor Scholarship', 'Positive Coaching Alliance', 1000, 2000, '2026-05-01', 3.0, NULL, NULL, 'For student-athletes who make themselves, teammates, and game better. Multiple awards.', 'https://positivecoach.org/');

-- Miscellaneous & Unique Scholarships
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_min, major_category, state_residency, description, website_url) VALUES
('Tall Clubs International Scholarship', 'Tall Clubs International', 1000, 1000, '2026-03-01', NULL, NULL, NULL, 'For tall students (women 5''10"+, men 6''2"+) pursuing higher education. Fun and unusual!', 'https://www.tall.org/scholarship/'),
('Vegetarian Resource Group Scholarship', 'Vegetarian Resource Group', 5000, 10000, '2026-02-20', NULL, NULL, NULL, 'For students who promoted vegetarianism in their schools or communities. $10K award.', 'https://www.vrg.org/student/scholar.htm'),
('Duck Brand Duct Tape Stuck at Prom Scholarship', 'ShurTech Brands', 1000, 10000, '2026-06-12', NULL, NULL, NULL, 'Create prom outfit from duct tape for chance to win $10K. Fun and creative!', 'https://www.duckbrand.com/stuck-at-prom'),
('Flavor of the Month Scholarship', 'Unigo', 1500, 1500, '2025-12-31', NULL, NULL, NULL, 'Monthly scholarship with quirky essay questions. Easy to apply, quick turnaround.', 'https://www.unigo.com/scholarships'),
('Niche $50,000 Scholarship', 'Niche', 50000, 50000, '2025-12-31', NULL, NULL, NULL, 'Monthly $2K drawings plus annual $50K grand prize. No essay required, just register.', 'https://www.niche.com/colleges/scholarships/');
