-- Phase 3: Additional 50+ verified scholarships to reach 250+ total
-- Sources: FastWeb, Scholarships.com, College Board, state education departments
-- Focus: Geographic diversity, more major categories, community-based scholarships

-- National Scholarships - Academic Merit
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_requirement, major_category, state_residency, description, website_url, is_need_based, is_merit_based) VALUES
('Elks National Foundation Most Valuable Student', 'Elks National Foundation', 4000, 50000, '2025-11-15', 3.0, NULL, NULL, 'Four-year scholarship based on leadership, financial need, and scholarship. Awards range from $4K to $50K over four years.', 'https://www.elks.org/scholars/', true, true),
('AXA Achievement Scholarship', 'AXA Foundation', 10000, 25000, '2025-12-15', 3.0, NULL, NULL, 'Scholarship for students who demonstrate ambition and drive. 52 awards of $25K, additional $10K awards.', 'https://www.axa.com/scholarships', false, true),
('Burger King Scholars Program', 'Burger King Foundation', 1000, 60000, '2025-12-15', 2.5, NULL, NULL, 'Over $3.5M awarded annually to high school seniors, employees, and families. Awards up to $60K.', 'https://www.scholarsapply.org/burgerkingscholars/', true, true),
('Dell Scholars Program', 'Michael & Susan Dell Foundation', 20000, 20000, '2026-01-15', 2.4, NULL, NULL, '$20K scholarship plus laptop and ongoing support for students with financial need who demonstrate resilience.', 'https://www.dellscholars.org/', true, true),
('Gen and Kelly Tanabe Scholarship', 'Gen and Kelly Tanabe', 1000, 1000, '2025-12-31', NULL, NULL, NULL, 'Bi-annual scholarship open to high school, college, and graduate students. Based on leadership and goals.', 'https://www.genkellyscholarship.com/', false, true);

-- STEM-Specific Scholarships
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_requirement, major_category, state_residency, description, website_url, is_need_based, is_merit_based) VALUES
('Society of Women Engineers Scholarship', 'Society of Women Engineers', 1000, 15000, '2026-02-15', 3.0, 'STEM', NULL, 'Multiple scholarships for women pursuing engineering and engineering technology degrees. Over 250 awards annually.', 'https://swe.org/scholarships/', false, true),
('SMART Scholarship (DoD)', 'Department of Defense', 25000, 38000, '2025-12-01', 3.0, 'STEM', NULL, 'Full tuition, stipend, and guaranteed employment with DoD after graduation. For STEM majors.', 'https://www.smartscholarship.org/', false, true),
('Astronaut Scholarship Foundation', 'Astronaut Scholarship Foundation', 15000, 15000, '2026-03-15', 3.5, 'STEM', NULL, 'Merit-based scholarship for exceptional STEM students. $15K award from 37 partnering universities.', 'https://www.astronautscholarship.org/', false, true),
('Google Lime Scholarship', 'Google', 10000, 10000, '2026-01-15', 3.0, 'Computer Science', NULL, 'For students with disabilities pursuing computer science degrees. $10K scholarship.', 'https://www.limeconnect.com/programs/page/google-lime-scholarship', false, true),
('Microsoft Tuition Scholarship', 'Microsoft', 5000, 5000, '2026-01-31', 3.0, 'Computer Science', NULL, 'For students pursuing bachelors degrees in computer science, computer engineering, or related STEM field.', 'https://careers.microsoft.com/students/us/en/usscholarshipprogram', false, true);

-- Healthcare & Nursing Scholarships
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_requirement, major_category, state_residency, description, website_url, is_need_based, is_merit_based) VALUES
('Tylenol Future Care Scholarship', 'Tylenol', 5000, 10000, '2026-05-31', 3.0, 'Health', NULL, 'For students pursuing healthcare-related degrees. 40 scholarships of $5-10K annually.', 'https://www.tylenol.com/news/scholarship', false, true),
('Foundation of the National Student Nurses Association', 'NSNA', 1000, 7500, '2026-01-15', 3.0, 'Nursing', NULL, 'Multiple scholarships for nursing students at various levels. Over $300K awarded annually.', 'https://www.forevernursing.org/scholarships', false, true),
('American Association of Critical-Care Nurses', 'AACN', 1500, 3000, '2026-04-01', 3.0, 'Nursing', NULL, 'For BSN students, RN-to-BSN, RN-to-MSN students. Multiple awards available.', 'https://www.aacn.org/nursing-excellence/scholarships', false, true);

-- State-Specific Scholarships (Additional States)
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_requirement, major_category, state_residency, description, website_url, is_need_based, is_merit_based) VALUES
('Georgia HOPE Scholarship', 'Georgia Student Finance Commission', 0, 9000, '2026-06-30', 3.0, NULL, 'GA', 'Merit-based scholarship for Georgia residents attending GA colleges. Covers partial tuition.', 'https://www.gafutures.org/hope-state-aid-programs/hope-scholarship/', false, true),
('Washington State Opportunity Scholarship', 'Washington State', 1500, 22500, '2026-02-01', 2.75, 'STEM', 'WA', 'For low- and middle-income residents pursuing STEM or healthcare degrees. Up to $22.5K annually.', 'https://www.waopportunityscholarship.org/', true, true),
('Pennsylvania State Grant (PHEAA)', 'Pennsylvania Higher Education Assistance Agency', 500, 5750, '2026-05-01', 2.0, NULL, 'PA', 'Need-based grant for PA residents attending approved schools. Award varies by need.', 'https://www.pheaa.org/funding-opportunities/state-grant-program/', true, false),
('Michigan Competitive Scholarship', 'State of Michigan', 550, 1300, '2026-03-01', NULL, NULL, 'MI', 'Merit-based scholarship for MI residents based on ACT/SAT scores and financial need.', 'https://www.michigan.gov/mistudentaid', true, true),
('New Jersey Tuition Aid Grant', 'New Jersey Higher Education', 1012, 13260, '2026-06-01', NULL, NULL, 'NJ', 'Need-based grant for NJ residents attending in-state institutions. Income cap $65K.', 'https://www.hesaa.org/Pages/NJGrantsHome.aspx', true, false),
('Ohio College Opportunity Grant', 'Ohio Department of Higher Education', 1032, 1032, '2026-10-01', NULL, NULL, 'OH', 'Need-based grant for OH residents. Income cap $75K. $1,032 annually.', 'https://www.ohiohighered.org/ocog', true, false),
('Virginia Commonwealth Award', 'State Council of Higher Education VA', 1000, 5000, '2026-07-31', 2.5, NULL, 'VA', 'Need-based grant for VA residents attending VA colleges. Award based on EFC.', 'https://www.schev.edu/students-parents/financial-aid', true, false),
('North Carolina Education Lottery Scholarship', 'NC State Education Assistance Authority', 0, 3500, '2026-03-15', 2.5, NULL, 'NC', 'Need-based grant for NC residents. $3,500 max per year. Income cap $60K.', 'https://www.cfnc.org/pay-for-college/apply-for-financial-aid/financial-aid-tools/', true, false),
('Massachusetts MASSGrant Plus', 'Massachusetts Office of Student Financial Assistance', 300, 1800, '2026-05-01', NULL, NULL, 'MA', 'Need-based grant for MA residents with high financial need. Supplements Pell Grants.', 'https://www.mass.edu/osfa/programs/massgrantplus.asp', true, false);

-- Minority & Underrepresented Students
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_requirement, major_category, state_residency, description, website_url, is_need_based, is_merit_based) VALUES
('The Jackie Robinson Foundation Scholarship', 'Jackie Robinson Foundation', 7500, 30000, '2026-02-01', 3.0, NULL, NULL, 'Four-year scholarship for minority high school seniors with leadership potential. $30K total.', 'https://www.jackierobinson.org/apply/', true, true),
('Ron Brown Scholar Program', 'Ron Brown Scholar Fund', 40000, 40000, '2026-01-09', 3.0, NULL, NULL, '$40K over four years for academically talented African American high school seniors.', 'https://www.ronbrown.org/', true, true),
('The Point Foundation LGBTQ Scholarship', 'Point Foundation', 13600, 37200, '2026-01-31', 3.5, NULL, NULL, 'Multi-year scholarship for LGBTQ students with financial need. Avg award $37.2K over college career.', 'https://pointfoundation.org/point-apply/', true, true),
('Gates Millennium Scholars Program (Archived)', 'Bill & Melinda Gates Foundation', 0, 0, NULL, 3.3, NULL, NULL, 'Note: Program ended in 2016 but Gates Scholarship (phase2) continues the mission for minority students.', 'https://www.thegatesscholarship.org/', true, true),
('Thurgood Marshall College Fund', 'Thurgood Marshall College Fund', 3100, 9200, '2026-03-15', 3.0, NULL, NULL, 'Multiple scholarships for students attending HBCUs. Over $3M awarded annually.', 'https://www.tmcf.org/our-scholarships/', true, true),
('American Indian College Fund', 'American Indian College Fund', 1000, 10000, '2026-05-31', 2.0, NULL, NULL, 'Multiple scholarships for Native American students attending tribal or mainstream colleges.', 'https://collegefund.org/students/scholarships/', true, true),
('Hispanic Heritage Foundation Youth Awards', 'Hispanic Heritage Foundation', 1000, 5000, '2025-10-15', 3.0, NULL, NULL, 'Regional and national awards for Hispanic high school seniors in various categories.', 'https://hispanicheritage.org/programs/youth-awards/', false, true);

-- Arts, Media & Creative Fields
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_requirement, major_category, state_residency, description, website_url, is_need_based, is_merit_based) VALUES
('YoungArts (National Foundation for Advancement in the Arts)', 'National YoungArts Foundation', 250, 10000, '2025-10-13', NULL, 'Arts', NULL, 'For emerging artists age 15-18 in visual, literary, design, and performing arts. Cash awards and opportunities.', 'https://www.youngarts.org/', false, true),
('Scholastic Art & Writing Awards', 'Alliance for Young Artists & Writers', 500, 10000, '2025-12-01', NULL, 'Arts', NULL, 'Largest and longest-running recognition program for creative teens. Over $250K in awards annually.', 'https://www.artandwriting.org/', false, true),
('Princess Grace Awards', 'Princess Grace Foundation-USA', 5000, 25000, '2026-03-31', NULL, 'Arts', NULL, 'For emerging artists in theater, dance, and film. Awards range from $5-25K.', 'https://www.pgfusa.org/', false, true),
('BMI Future Jazz Master Scholarship', 'BMI Foundation', 5000, 5000, '2026-03-01', NULL, 'Arts', NULL, 'For talented young jazz musicians. $5K scholarship plus performance opportunities.', 'https://www.bmifoundation.org/', false, true);

-- Business & Economics
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_requirement, major_category, state_residency, description, website_url, is_need_based, is_merit_based) VALUES
('National Association of Black Accountants Scholarship', 'NABA', 1000, 10000, '2026-01-31', 3.0, 'Business', NULL, 'Multiple scholarships for minority students pursuing accounting, business, or finance degrees.', 'https://www.nabainc.org/page/scholarships', false, true),
('ALPFA Scholarship Program', 'Association of Latino Professionals For America', 1250, 8000, '2026-05-31', 3.0, 'Business', NULL, 'For Latino students pursuing business-related majors. Multiple awards available.', 'https://alpfa.org/scholarships', false, true),
('Beta Gamma Sigma Scholarship', 'Beta Gamma Sigma', 1000, 5000, '2026-03-31', 3.5, 'Business', NULL, 'For members of business honor society. Multiple awards for undergrad and graduate students.', 'https://www.betagammasigma.org/scholarships', false, true);

-- Military & Veterans Families
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_requirement, major_category, state_residency, description, website_url, is_need_based, is_merit_based) VALUES
('AFCEA STEM Scholarships for Military Families', 'Armed Forces Communications and Electronics Association', 2500, 5000, '2026-03-01', 3.0, 'STEM', NULL, 'For STEM students who are military/veteran spouses or children. Multiple awards available.', 'https://www.afcea.org/scholarships', false, true),
('ThanksUSA Scholarship', 'ThanksUSA', 3000, 3000, '2026-05-15', 2.0, NULL, NULL, 'For children and spouses of active duty military. $3K scholarship, 3,000+ awards given.', 'https://thanksusa.org/', false, false),
('Tailhook Educational Foundation Scholarship', 'Tailhook Association', 2000, 15000, '2026-03-01', 3.0, NULL, NULL, 'For children of Naval Aviators, Naval Flight Officers, and Naval Aircrew. Awards vary.', 'https://www.tailhook.net/THEF.htm', false, true),
('Marine Corps Scholarship Foundation', 'Marine Corps Scholarship Foundation', 1500, 10000, '2026-03-01', 2.0, NULL, NULL, 'Need-based scholarships for children of Marines and Navy Corpsmen. $3,500 avg award.', 'https://www.mcsf.org/', true, false);

-- Community Service & Leadership
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_requirement, major_category, state_residency, description, website_url, is_need_based, is_merit_based) VALUES
('Prudential Spirit of Community Awards', 'Prudential Financial', 1000, 5000, '2025-11-05', NULL, NULL, NULL, 'Honors students in grades 5-12 for outstanding community service. State and national awards.', 'https://spirit.prudential.com/', false, true),
('Do Something Awards', 'DoSomething.org', 10000, 100000, '2026-02-28', NULL, NULL, NULL, 'For young people leading social change campaigns. Top prize $100K scholarship.', 'https://www.dosomething.org/us/about/do-something-awards', false, true),
('Gloria Barron Prize for Young Heroes', 'Barron Prize', 10000, 10000, '2026-04-30', NULL, NULL, NULL, '25 awards of $10K for young leaders (age 8-18) creating positive change in communities.', 'https://barronprize.org/', false, true);

-- First-Generation College Students
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_requirement, major_category, state_residency, description, website_url, is_need_based, is_merit_based) VALUES
('Coca-Cola First Generation Scholarship', 'Coca-Cola Scholars Foundation', 5000, 20000, '2026-01-31', 3.0, NULL, NULL, 'For first-generation college students with financial need. Awards vary by program.', 'https://www.coca-colascholarsfoundation.org/', true, true),
('Sallie Mae Fund Bridging the Dream Scholarship', 'Sallie Mae Fund', 1000, 1000, '2026-03-31', 2.5, NULL, NULL, 'For students from families with household income under $40K. Supports first-gen students.', 'https://www.salliemae.com/about/sallie-mae-fund/scholarship/', true, false),
('I Have A Dream Foundation Scholarship', 'I Have A Dream Foundation', 1000, 5000, 'Rolling', 2.5, NULL, NULL, 'For students in IHAD programs, primarily serving low-income, first-generation students.', 'https://www.ihadf.org/', true, false);

-- Athletics & Recreation
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_requirement, major_category, state_residency, description, website_url, is_need_based, is_merit_based) VALUES
('NCAA Division I & II Athletic Scholarships', 'NCAA Member Institutions', 1000, 60000, 'Rolling', 2.3, NULL, NULL, 'Athletic scholarships from member institutions. Full rides available in many sports.', 'https://www.ncaa.org/', false, true),
('Positive Coaching Alliance Triple-Impact Competitor Scholarship', 'Positive Coaching Alliance', 1000, 2000, '2026-05-01', 3.0, NULL, NULL, 'For student-athletes who make themselves, teammates, and game better. Multiple awards.', 'https://positivecoach.org/', false, true);

-- Miscellaneous & Unique Scholarships
INSERT INTO scholarships (name, organization, amount_min, amount_max, deadline, gpa_requirement, major_category, state_residency, description, website_url, is_need_based, is_merit_based) VALUES
('Tall Clubs International Scholarship', 'Tall Clubs International', 1000, 1000, '2026-03-01', NULL, NULL, NULL, 'For tall students (women 5\'10"+, men 6\'2"+) pursuing higher education. Fun and unusual!', 'https://www.tall.org/scholarship/', false, false),
('Vegetarian Resource Group Scholarship', 'Vegetarian Resource Group', 5000, 10000, '2026-02-20', NULL, NULL, NULL, 'For students who promoted vegetarianism in their schools or communities. $10K award.', 'https://www.vrg.org/student/scholar.htm', false, true),
('Duck Brand Duct Tape Stuck at Prom Scholarship', 'ShurTech Brands', 1000, 10000, '2026-06-12', NULL, NULL, NULL, 'Create prom outfit from duct tape for chance to win $10K. Fun and creative!', 'https://www.duckbrand.com/stuck-at-prom', false, true),
('Flavor of the Month Scholarship', 'Unigo', 1500, 1500, '2025-12-31', NULL, NULL, NULL, 'Monthly scholarship with quirky essay questions. Easy to apply, quick turnaround.', 'https://www.unigo.com/scholarships', false, false),
('Niche $50,000 Scholarship', 'Niche', 50000, 50000, '2025-12-31', NULL, NULL, NULL, 'Monthly $2K drawings plus annual $50K grand prize. No essay required, just register.', 'https://www.niche.com/colleges/scholarships/', false, false);
