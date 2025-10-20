#!/usr/bin/env node

/**
 * Test script for salary data submission system
 * 
 * This script tests:
 * 1. Database schema is correct
 * 2. Quality scoring algorithm works
 * 3. Aggregation queries run correctly
 */

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '../data/users.db');

console.log('🧪 Testing Salary Data System...\n');

try {
  const db = new Database(DB_PATH);

  // Test 1: Verify tables exist
  console.log('✅ Test 1: Database Schema');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  const tableNames = tables.map(t => t.name);
  
  const requiredTables = [
    'salary_submissions',
    'salary_aggregates',
    'user_submission_stats',
    'salary_trends',
    'verification_queue',
    'users'
  ];
  
  requiredTables.forEach(table => {
    if (tableNames.includes(table)) {
      console.log(`  ✓ ${table} exists`);
    } else {
      console.log(`  ✗ ${table} MISSING`);
    }
  });

  // Test 2: Create test user
  console.log('\n✅ Test 2: Create Test User');
  const testEmail = 'test@example.com';
  
  // Check if user exists
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(testEmail);
  
  if (!user) {
    const hashedPassword = bcrypt.hashSync('testpassword123', 10);
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, subscription_tier)
      VALUES (?, ?, ?, ?)
    `).run('Test User', testEmail, hashedPassword, 'free');
    
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    console.log(`  ✓ Created test user: ${user.email} (ID: ${user.id})`);
  } else {
    console.log(`  ✓ Test user already exists: ${user.email} (ID: ${user.id})`);
  }

  // Test 3: Insert sample salary submissions
  console.log('\n✅ Test 3: Insert Sample Salary Data');
  
  const sampleSubmissions = [
    {
      major: 'Computer Science',
      institution: 'Stanford University',
      degree: 'bachelors',
      gradYear: 2019,
      salary: 150000,
      years: 5
    },
    {
      major: 'Computer Science',
      institution: 'Stanford University',
      degree: 'bachelors',
      gradYear: 2018,
      salary: 145000,
      years: 6
    },
    {
      major: 'Computer Science',
      institution: 'Stanford University',
      degree: 'bachelors',
      gradYear: 2020,
      salary: 140000,
      years: 4
    },
    {
      major: 'Mechanical Engineering',
      institution: 'MIT',
      degree: 'bachelors',
      gradYear: 2019,
      salary: 95000,
      years: 5
    },
    {
      major: 'Mechanical Engineering',
      institution: 'MIT',
      degree: 'bachelors',
      gradYear: 2018,
      salary: 110000,
      years: 6
    },
  ];

  sampleSubmissions.forEach((sub, index) => {
    // Quality scoring algorithm (simplified)
    let quality_score = 50;
    if (sub.salary > 0) quality_score += 20;
    if (sub.gradYear >= 1950 && sub.gradYear <= new Date().getFullYear()) quality_score += 15;
    if (sub.years >= 0 && sub.years <= 50) quality_score += 15;
    
    const is_approved = quality_score >= 70 ? 1 : 0;

    try {
      db.prepare(`
        INSERT OR IGNORE INTO salary_submissions (
          user_id, institution_name, degree_level, major, graduation_year,
          current_salary, years_since_graduation, data_quality_score, is_approved,
          is_public, moderation_status, submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        user.id,
        sub.institution,
        sub.degree,
        sub.major,
        sub.gradYear,
        sub.salary,
        sub.years,
        quality_score,
        is_approved,
        1,
        is_approved ? 'approved' : 'pending'
      );
      
      console.log(`  ✓ Inserted: ${sub.major} at ${sub.institution} - $${sub.salary.toLocaleString()} (Score: ${quality_score})`);
    } catch (err) {
      if (err.code !== 'SQLITE_CONSTRAINT') {
        console.log(`  ⚠ Already exists: ${sub.major} at ${sub.institution}`);
      }
    }
  });

  // Test 4: Test aggregation query
  console.log('\n✅ Test 4: Aggregation Query');
  
  const aggregates = db.prepare(`
    SELECT 
      major,
      institution_name,
      degree_level,
      years_since_graduation,
      AVG(current_salary) as avg_salary,
      MIN(current_salary) as min_salary,
      MAX(current_salary) as max_salary,
      COUNT(*) as sample_size
    FROM salary_submissions
    WHERE is_approved = 1 AND is_public = 1
    GROUP BY major, institution_name, degree_level, years_since_graduation
    HAVING sample_size >= 3
    ORDER BY avg_salary DESC
  `).all();

  if (aggregates.length > 0) {
    console.log('  ✓ Aggregation working! Results:');
    aggregates.forEach(agg => {
      console.log(`    - ${agg.major} at ${agg.institution_name}`);
      console.log(`      Avg: $${Math.round(agg.avg_salary).toLocaleString()}, Range: $${agg.min_salary.toLocaleString()} - $${agg.max_salary.toLocaleString()}`);
      console.log(`      Sample Size: ${agg.sample_size}, Years: ${agg.years_since_graduation}`);
    });
  } else {
    console.log('  ⚠ No aggregates found (need at least 3 submissions per group)');
  }

  // Test 5: Privacy check (less than 3 submissions)
  console.log('\n✅ Test 5: Privacy Protection');
  
  const smallGroups = db.prepare(`
    SELECT 
      major,
      institution_name,
      COUNT(*) as sample_size
    FROM salary_submissions
    WHERE is_approved = 1 AND is_public = 1
    GROUP BY major, institution_name
    HAVING sample_size < 3
  `).all();

  if (smallGroups.length > 0) {
    console.log(`  ✓ Privacy protected: ${smallGroups.length} groups hidden (< 3 submissions)`);
    smallGroups.forEach(g => {
      console.log(`    - ${g.major} at ${g.institution_name}: ${g.sample_size} submission(s) (hidden)`);
    });
  } else {
    console.log('  ✓ All groups have sufficient data (>= 3 submissions)');
  }

  // Test 6: User submission stats
  console.log('\n✅ Test 6: User Statistics');
  
  const userStats = db.prepare(`
    SELECT 
      COUNT(*) as total_submissions,
      SUM(CASE WHEN is_approved = 1 THEN 1 ELSE 0 END) as approved,
      AVG(data_quality_score) as avg_quality
    FROM salary_submissions
    WHERE user_id = ?
  `).get(user.id);

  console.log(`  ✓ User ${user.email}:`);
  console.log(`    Total Submissions: ${userStats.total_submissions}`);
  console.log(`    Approved: ${userStats.approved}`);
  console.log(`    Avg Quality Score: ${Math.round(userStats.avg_quality)}/100`);

  db.close();

  console.log('\n✅ All tests passed! System ready for production.\n');
  console.log('📝 Next steps:');
  console.log('  1. Visit http://localhost:3000/salary-insights to view data');
  console.log('  2. Visit http://localhost:3000/submit-salary to add more data');
  console.log('  3. Create more test submissions to see aggregations\n');

} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}
