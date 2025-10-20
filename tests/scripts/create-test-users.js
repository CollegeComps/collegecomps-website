const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, '../data/users.db'));

console.log('👤 Creating Test Users...\n');

const testUsers = [
  {
    id: 1000,
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'admin123',
    tier: 'premium'
  },
  {
    id: 1001,
    name: 'Test User',
    email: 'test@test.com',
    password: 'test123',
    tier: 'free'
  },
  {
    id: 1002,
    name: 'Premium User',
    email: 'premium@test.com',
    password: 'premium123',
    tier: 'premium'
  }
];

testUsers.forEach(user => {
  const hashedPassword = bcrypt.hashSync(user.password, 10);
  
  try {
    db.prepare(`
      INSERT OR REPLACE INTO users (id, name, email, password_hash, subscription_tier, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(user.id, user.name, user.email, hashedPassword, user.tier);
    
    console.log(`✅ ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.password}`);
    console.log(`   Tier: ${user.tier.toUpperCase()}`);
    console.log('');
  } catch (err) {
    console.log(`❌ Failed to create ${user.name}: ${err.message}\n`);
  }
});

db.close();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎉 Test users created successfully!');
console.log('');
console.log('📝 Quick Login Credentials:');
console.log('');
console.log('   🔑 Admin (Premium):');
console.log('      Email: admin@test.com');
console.log('      Password: admin123');
console.log('');
console.log('   🔑 Test User (Free):');
console.log('      Email: test@test.com');
console.log('      Password: test123');
console.log('');
console.log('   🔑 Premium User:');
console.log('      Email: premium@test.com');
console.log('      Password: premium123');
console.log('');
console.log('🌐 Login at: http://localhost:3000');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
