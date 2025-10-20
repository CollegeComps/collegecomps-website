const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../data/users.db'));

console.log('📊 Salary Data Summary:\n');

const stats = db.prepare(`
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN is_approved = 1 THEN 1 ELSE 0 END) as approved,
    COUNT(DISTINCT major) as majors,
    COUNT(DISTINCT institution_name) as schools
  FROM salary_submissions
`).get();

console.log(`Total Submissions: ${stats.total}`);
console.log(`Approved: ${stats.approved}`);
console.log(`Unique Majors: ${stats.majors}`);
console.log(`Unique Institutions: ${stats.schools}\n`);

if (stats.total > 0) {
  console.log('Sample Data:');
  const samples = db.prepare(`
    SELECT major, institution_name, current_salary, years_since_graduation
    FROM salary_submissions
    WHERE is_approved = 1
    LIMIT 5
  `).all();
  
  samples.forEach(s => {
    console.log(`- ${s.major} @ ${s.institution_name}: $${s.current_salary.toLocaleString()} (${s.years_since_graduation} years)`);
  });
}

db.close();
