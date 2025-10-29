#!/usr/bin/env node
/**
 * Reset admin password to "admin123"
 */

require('dotenv').config({ path: '.env.local' });

const bcrypt = require('bcryptjs');
const { createClient } = require('@libsql/client');

async function resetPassword() {
  console.log('🔐 Resetting Admin Password\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  const db = createClient({
    url: process.env.USERS_DB_URL,
    authToken: process.env.USERS_DB_TOKEN,
  });

  const newPassword = 'admin123';
  
  try {
    // Generate new hash
    console.log('1️⃣  Generating new password hash...');
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    console.log('✅ New hash generated');
    console.log(`   Password: ${newPassword}`);
    console.log(`   Hash length: ${newHash.length} chars`);
    console.log('');

    // Verify hash works before updating
    console.log('2️⃣  Verifying hash...');
    const testMatch = await bcrypt.compare(newPassword, newHash);
    if (!testMatch) {
      console.log('❌ Hash verification failed!');
      process.exit(1);
    }
    console.log('✅ Hash verified successfully');
    console.log('');

    // Update database
    console.log('3️⃣  Updating database...');
    await db.execute({
      sql: 'UPDATE users SET password_hash = ? WHERE email = ?',
      args: [newHash, 'admin@collegecomps.com']
    });
    console.log('✅ Database updated');
    console.log('');

    // Verify update
    console.log('4️⃣  Verifying database update...');
    const user = await db.execute({
      sql: 'SELECT email, password_hash FROM users WHERE email = ?',
      args: ['admin@collegecomps.com']
    });

    if (user.rows.length === 0) {
      console.log('❌ User not found after update');
      process.exit(1);
    }

    const updatedHash = user.rows[0].password_hash;
    const finalTest = await bcrypt.compare(newPassword, updatedHash);
    
    if (!finalTest) {
      console.log('❌ Final verification failed!');
      console.log('   Hash in database does not match expected');
      process.exit(1);
    }

    console.log('✅ Final verification passed');
    console.log('');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ PASSWORD RESET SUCCESSFUL');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('Admin credentials:');
    console.log(`  Email: admin@collegecomps.com`);
    console.log(`  Password: ${newPassword}`);
    console.log('');
    console.log('You can now login with these credentials.');
    console.log('');

  } catch (error) {
    console.log('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
