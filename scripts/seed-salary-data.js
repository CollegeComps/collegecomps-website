const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../data/users.db'));

console.log('📝 Inserting test salary data...\n');

// Create demo user if doesn't exist
db.prepare(`
  INSERT OR IGNORE INTO users (id, name, email, password_hash, subscription_tier, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`).run(999, 'Demo User', 'demo@example.com', '$2a$10$abcdefghijk', 'free');

const submissions = [
  // Stanford CS
  {user_id: 999, institution: 'Stanford University', degree: 'bachelors', major: 'Computer Science', gradYear: 2019, salary: 150000, totalComp: 250000, years: 5, title: 'Software Engineer', company: 'Google', industry: 'Technology', state: 'CA', quality: 95},
  {user_id: 999, institution: 'Stanford University', degree: 'bachelors', major: 'Computer Science', gradYear: 2018, salary: 145000, totalComp: 240000, years: 6, title: 'Senior Software Engineer', company: 'Meta', industry: 'Technology', state: 'CA', quality: 93},
  {user_id: 999, institution: 'Stanford University', degree: 'bachelors', major: 'Computer Science', gradYear: 2020, salary: 140000, totalComp: 220000, years: 4, title: 'Software Engineer II', company: 'Amazon', industry: 'Technology', state: 'WA', quality: 91},
  {user_id: 999, institution: 'Stanford University', degree: 'bachelors', major: 'Computer Science', gradYear: 2019, salary: 165000, totalComp: 300000, years: 5, title: 'Staff Engineer', company: 'Netflix', industry: 'Technology', state: 'CA', quality: 96},
  
  // MIT Mechanical Engineering
  {user_id: 999, institution: 'MIT', degree: 'bachelors', major: 'Mechanical Engineering', gradYear: 2019, salary: 95000, totalComp: 105000, years: 5, title: 'Mechanical Engineer', company: 'Tesla', industry: 'Automotive', state: 'CA', quality: 88},
  {user_id: 999, institution: 'MIT', degree: 'bachelors', major: 'Mechanical Engineering', gradYear: 2018, salary: 110000, totalComp: 125000, years: 6, title: 'Senior Engineer', company: 'Boeing', industry: 'Aerospace', state: 'WA', quality: 89},
  {user_id: 999, institution: 'MIT', degree: 'bachelors', major: 'Mechanical Engineering', gradYear: 2020, salary: 88000, totalComp: 95000, years: 4, title: 'Mechanical Engineer', company: 'General Motors', industry: 'Automotive', state: 'MI', quality: 85},
  {user_id: 999, institution: 'MIT', degree: 'bachelors', major: 'Mechanical Engineering', gradYear: 2019, salary: 102000, totalComp: 115000, years: 5, title: 'R&D Engineer', company: 'SpaceX', industry: 'Aerospace', state: 'CA', quality: 90},
  
  // UC Berkeley Business
  {user_id: 999, institution: 'UC Berkeley', degree: 'bachelors', major: 'Business Administration', gradYear: 2019, salary: 85000, totalComp: 95000, years: 5, title: 'Marketing Manager', company: 'Salesforce', industry: 'Technology', state: 'CA', quality: 82},
  {user_id: 999, institution: 'UC Berkeley', degree: 'bachelors', major: 'Business Administration', gradYear: 2018, salary: 92000, totalComp: 105000, years: 6, title: 'Product Manager', company: 'Adobe', industry: 'Technology', state: 'CA', quality: 84},
  {user_id: 999, institution: 'UC Berkeley', degree: 'bachelors', major: 'Business Administration', gradYear: 2020, salary: 78000, totalComp: 85000, years: 4, title: 'Business Analyst', company: 'Deloitte', industry: 'Consulting', state: 'CA', quality: 80},
  {user_id: 999, institution: 'UC Berkeley', degree: 'bachelors', major: 'Business Administration', gradYear: 2019, salary: 110000, totalComp: 130000, years: 5, title: 'Senior Product Manager', company: 'Google', industry: 'Technology', state: 'CA', quality: 88},
  
  // Harvard Law
  {user_id: 999, institution: 'Harvard University', degree: 'professional', major: 'Law', gradYear: 2019, salary: 190000, totalComp: 210000, years: 5, title: 'Associate', company: 'Skadden Arps', industry: 'Legal', state: 'NY', quality: 94},
  {user_id: 999, institution: 'Harvard University', degree: 'professional', major: 'Law', gradYear: 2018, salary: 205000, totalComp: 230000, years: 6, title: 'Senior Associate', company: 'Cravath', industry: 'Legal', state: 'NY', quality: 95},
  {user_id: 999, institution: 'Harvard University', degree: 'professional', major: 'Law', gradYear: 2020, salary: 180000, totalComp: 195000, years: 4, title: 'Associate', company: 'Wachtell', industry: 'Legal', state: 'NY', quality: 92},
  
  // NYU Data Science
  {user_id: 999, institution: 'New York University', degree: 'masters', major: 'Data Science', gradYear: 2020, salary: 125000, totalComp: 145000, years: 4, title: 'Data Scientist', company: 'JPMorgan Chase', industry: 'Finance', state: 'NY', quality: 87},
  {user_id: 999, institution: 'New York University', degree: 'masters', major: 'Data Science', gradYear: 2019, salary: 135000, totalComp: 160000, years: 5, title: 'Senior Data Scientist', company: 'Bloomberg', industry: 'Finance', state: 'NY', quality: 89},
  {user_id: 999, institution: 'New York University', degree: 'masters', major: 'Data Science', gradYear: 2021, salary: 115000, totalComp: 130000, years: 3, title: 'Data Scientist', company: 'IBM', industry: 'Technology', state: 'NY', quality: 85},
];

const insertStmt = db.prepare(`
  INSERT INTO salary_submissions (
    user_id, institution_name, degree_level, major, graduation_year,
    current_salary, total_compensation, years_since_graduation,
    job_title, company_name, industry, location_state,
    data_quality_score, is_approved, is_verified, is_public, moderation_status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 1, 'approved')
`);

let inserted = 0;
submissions.forEach(sub => {
  try {
    insertStmt.run(
      sub.user_id, sub.institution, sub.degree, sub.major, sub.gradYear,
      sub.salary, sub.totalComp, sub.years,
      sub.title, sub.company, sub.industry, sub.state,
      sub.quality
    );
    inserted++;
    console.log(`✓ ${sub.major} @ ${sub.institution} - $${sub.salary.toLocaleString()}`);
  } catch (err) {
    if (!err.message.includes('UNIQUE constraint')) {
      console.log(`✗ Error: ${err.message}`);
    }
  }
});

console.log(`\n✅ Inserted ${inserted} salary submissions`);

// Verify
const count = db.prepare('SELECT COUNT(*) as total FROM salary_submissions').get();
console.log(`📊 Total in database: ${count.total}\n`);

db.close();
