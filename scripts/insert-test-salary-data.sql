-- Insert test salary data for demonstration

-- First, let's check if we have users
INSERT OR IGNORE INTO users (id, name, email, password_hash, subscription_tier, created_at, updated_at)
VALUES (999, 'Demo User', 'demo@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'free', datetime('now'), datetime('now'));

-- Insert Computer Science @ Stanford data (5+ submissions for aggregation)
INSERT INTO salary_submissions (
  user_id, institution_name, degree_level, major, graduation_year,
  current_salary, total_compensation, years_since_graduation,
  job_title, company_name, industry, location_state,
  data_quality_score, is_approved, is_verified, is_public, moderation_status, submitted_at
) VALUES
(999, 'Stanford University', 'bachelors', 'Computer Science', 2019, 150000, 250000, 5, 'Software Engineer', 'Google', 'Technology', 'CA', 95, 1, 0, 1, 'approved', datetime('now', '-30 days')),
(999, 'Stanford University', 'bachelors', 'Computer Science', 2018, 145000, 240000, 6, 'Senior Software Engineer', 'Meta', 'Technology', 'CA', 93, 1, 0, 1, 'approved', datetime('now', '-25 days')),
(999, 'Stanford University', 'bachelors', 'Computer Science', 2020, 140000, 220000, 4, 'Software Engineer II', 'Amazon', 'Technology', 'WA', 91, 1, 0, 1, 'approved', datetime('now', '-20 days')),
(999, 'Stanford University', 'bachelors', 'Computer Science', 2019, 165000, 300000, 5, 'Staff Engineer', 'Netflix', 'Technology', 'CA', 96, 1, 0, 1, 'approved', datetime('now', '-15 days')),
(999, 'Stanford University', 'bachelors', 'Computer Science', 2017, 175000, 350000, 7, 'Senior Software Engineer', 'Stripe', 'Technology', 'CA', 97, 1, 0, 1, 'approved', datetime('now', '-10 days'));

-- Insert MIT Mechanical Engineering data
INSERT INTO salary_submissions (
  user_id, institution_name, degree_level, major, graduation_year,
  current_salary, total_compensation, years_since_graduation,
  job_title, company_name, industry, location_state,
  data_quality_score, is_approved, is_verified, is_public, moderation_status, submitted_at
) VALUES
(999, 'MIT', 'bachelors', 'Mechanical Engineering', 2019, 95000, 105000, 5, 'Mechanical Engineer', 'Tesla', 'Automotive', 'CA', 88, 1, 0, 1, 'approved', datetime('now', '-28 days')),
(999, 'MIT', 'bachelors', 'Mechanical Engineering', 2018, 110000, 125000, 6, 'Senior Engineer', 'Boeing', 'Aerospace', 'WA', 89, 1, 0, 1, 'approved', datetime('now', '-22 days')),
(999, 'MIT', 'bachelors', 'Mechanical Engineering', 2020, 88000, 95000, 4, 'Mechanical Engineer', 'General Motors', 'Automotive', 'MI', 85, 1, 0, 1, 'approved', datetime('now', '-18 days')),
(999, 'MIT', 'bachelors', 'Mechanical Engineering', 2019, 102000, 115000, 5, 'R&D Engineer', 'SpaceX', 'Aerospace', 'CA', 90, 1, 0, 1, 'approved', datetime('now', '-12 days'));

-- Insert UC Berkeley Business Administration data
INSERT INTO salary_submissions (
  user_id, institution_name, degree_level, major, graduation_year,
  current_salary, total_compensation, years_since_graduation,
  job_title, company_name, industry, location_state,
  data_quality_score, is_approved, is_verified, is_public, moderation_status, submitted_at
) VALUES
(999, 'UC Berkeley', 'bachelors', 'Business Administration', 2019, 85000, 95000, 5, 'Marketing Manager', 'Salesforce', 'Technology', 'CA', 82, 1, 0, 1, 'approved', datetime('now', '-26 days')),
(999, 'UC Berkeley', 'bachelors', 'Business Administration', 2018, 92000, 105000, 6, 'Product Manager', 'Adobe', 'Technology', 'CA', 84, 1, 0, 1, 'approved', datetime('now', '-24 days')),
(999, 'UC Berkeley', 'bachelors', 'Business Administration', 2020, 78000, 85000, 4, 'Business Analyst', 'Deloitte', 'Consulting', 'CA', 80, 1, 0, 1, 'approved', datetime('now', '-19 days')),
(999, 'UC Berkeley', 'bachelors', 'Business Administration', 2019, 110000, 130000, 5, 'Senior Product Manager', 'Google', 'Technology', 'CA', 88, 1, 0, 1, 'approved', datetime('now', '-14 days'));

-- Insert Harvard Law (Graduate) data
INSERT INTO salary_submissions (
  user_id, institution_name, degree_level, major, graduation_year,
  current_salary, total_compensation, years_since_graduation,
  job_title, company_name, industry, location_state,
  data_quality_score, is_approved, is_verified, is_public, moderation_status, submitted_at
) VALUES
(999, 'Harvard University', 'professional', 'Law', 2019, 190000, 210000, 5, 'Associate', 'Skadden Arps', 'Legal', 'NY', 94, 1, 0, 1, 'approved', datetime('now', '-27 days')),
(999, 'Harvard University', 'professional', 'Law', 2018, 205000, 230000, 6, 'Senior Associate', 'Cravath', 'Legal', 'NY', 95, 1, 0, 1, 'approved', datetime('now', '-23 days')),
(999, 'Harvard University', 'professional', 'Law', 2020, 180000, 195000, 4, 'Associate', 'Wachtell', 'Legal', 'NY', 92, 1, 0, 1, 'approved', datetime('now', '-17 days')),
(999, 'Harvard University', 'professional', 'Law', 2019, 200000, 225000, 5, 'Associate', 'Sullivan & Cromwell', 'Legal', 'NY', 96, 1, 0, 1, 'approved', datetime('now', '-11 days'));

-- Insert NYU Data Science (Masters) data
INSERT INTO salary_submissions (
  user_id, institution_name, degree_level, major, graduation_year,
  current_salary, total_compensation, years_since_graduation,
  job_title, company_name, industry, location_state,
  data_quality_score, is_approved, is_verified, is_public, moderation_status, submitted_at
) VALUES
(999, 'New York University', 'masters', 'Data Science', 2020, 125000, 145000, 4, 'Data Scientist', 'JPMorgan Chase', 'Finance', 'NY', 87, 1, 0, 1, 'approved', datetime('now', '-21 days')),
(999, 'New York University', 'masters', 'Data Science', 2019, 135000, 160000, 5, 'Senior Data Scientist', 'Bloomberg', 'Finance', 'NY', 89, 1, 0, 1, 'approved', datetime('now', '-16 days')),
(999, 'New York University', 'masters', 'Data Science', 2021, 115000, 130000, 3, 'Data Scientist', 'IBM', 'Technology', 'NY', 85, 1, 0, 1, 'approved', datetime('now', '-13 days')),
(999, 'New York University', 'masters', 'Data Science', 2020, 140000, 170000, 4, 'ML Engineer', 'Meta', 'Technology', 'NY', 90, 1, 0, 1, 'approved', datetime('now', '-9 days'));

-- Verify insertion
SELECT 'Total Submissions: ' || COUNT(*) FROM salary_submissions;
SELECT 'Approved Submissions: ' || COUNT(*) FROM salary_submissions WHERE is_approved = 1;
SELECT 'Unique Majors: ' || COUNT(DISTINCT major) FROM salary_submissions;
SELECT 'Unique Institutions: ' || COUNT(DISTINCT institution_name) FROM salary_submissions;
