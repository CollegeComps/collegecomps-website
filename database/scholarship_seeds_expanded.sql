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
