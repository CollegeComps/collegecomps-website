#!/usr/bin/env node
/**
 * Test database authentication locally
 * Verifies password hash and login flow
 */

require('dotenv').config({ path: '.env.local' });

const bcrypt = require('bcryptjs');
const { createClient } = require('@libsql/client');

async function testAuth() {
  console.log('🔍 Testing Database Authentication\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Create database client using the users database
  const db = createClient({
    url: process.env.USERS_DB_URL,
    authToken: process.env.USERS_DB_TOKEN,
  });

  try {
    // Test 1: Check if user exists
    console.log('1️⃣  Checking if admin user exists...');
    const user = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: ['admin@collegecomps.com']
    });

    if (user.rows.length === 0) {
      console.log('❌ User not found in database');
      console.log('   Email: admin@collegecomps.com');
      console.log('\n⚠️  Solution: Create user in database');
      process.exit(1);
    }

    console.log('✅ User found');
    const dbUser = user.rows[0];
    console.log('   Email:', dbUser.email);
    console.log('   Has password:', dbUser.password_hash ? 'Yes' : 'No');
    console.log('   Email verified:', dbUser.email_verified ? 'Yes' : 'No');
    console.log('   Subscription:', dbUser.subscription_tier);
    console.log('');

    // Test 2: Verify password hash exists
    if (!dbUser.password_hash) {
      console.log('❌ User has no password hash (OAuth-only user)');
      console.log('   This user cannot login with credentials');
      console.log('\n⚠️  Solution: Set password for this user');
      process.exit(1);
    }

    console.log('2️⃣  Testing password hash...');
    const testPassword = 'admin123';
    
    try {
      const isValid = await bcrypt.compare(testPassword, dbUser.password_hash);
      
      if (isValid) {
        console.log('✅ Password hash is VALID');
        console.log(`   Test password "${testPassword}" matches hash`);
        console.log('');
      } else {
        console.log('❌ Password hash is INVALID');
        console.log(`   Test password "${testPassword}" does NOT match hash`);
        console.log('\n⚠️  Possible issues:');
        console.log('   - Password in database is not "admin123"');
        console.log('   - Hash was corrupted during storage');
        console.log('   - Hash format is incorrect');
        console.log('\n💡 Solution: Reset password hash');
        console.log('   Run: node reset-admin-password.js');
        process.exit(1);
      }
    } catch (error) {
      console.log('❌ Error comparing password:', error.message);
      console.log('\n⚠️  Hash format may be corrupted');
      process.exit(1);
    }

    // Test 3: Simulate auth flow
    console.log('3️⃣  Simulating NextAuth credential flow...');
    
    // This is what NextAuth does in authorize()
    if (!dbUser.email || !testPassword) {
      console.log('❌ Missing credentials');
      process.exit(1);
    }

    if (!dbUser.password_hash) {
      console.log('❌ No password hash (OAuth user)');
      process.exit(1);
    }

    const authValid = await bcrypt.compare(testPassword, dbUser.password_hash);
    
    if (!authValid) {
      console.log('❌ Password invalid');
      process.exit(1);
    }

    console.log('✅ Auth flow would succeed');
    console.log('   User would be authenticated');
    console.log('');

    // Test 4: Check return object
    console.log('4️⃣  Checking return object structure...');
    const returnUser = {
      id: dbUser.id.toString(),
      email: dbUser.email,
      name: dbUser.name,
      subscriptionTier: dbUser.subscription_tier,
      subscriptionStatus: 'active'
    };

    console.log('✅ Return object created:');
    console.log('   ', JSON.stringify(returnUser, null, 2));
    console.log('');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ DATABASE AUTH TEST PASSED');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('Database authentication is working correctly.');
    console.log('If login still fails, the issue is likely:');
    console.log('');
    console.log('1. Cookie/Session issues:');
    console.log('   - Browser blocking cookies');
    console.log('   - Cookie domain mismatch');
    console.log('   - Session not persisting');
    console.log('');
    console.log('2. NextAuth configuration:');
    console.log('   - AUTH_SECRET not set');
    console.log('   - trustHost not working');
    console.log('   - Callback URL mismatch');
    console.log('');
    console.log('3. Frontend issues:');
    console.log('   - Form not submitting correctly');
    console.log('   - Redirect not working');
    console.log('   - Error not being displayed');
    console.log('');

  } catch (error) {
    console.log('❌ Database error:', error.message);
    console.log('\n⚠️  Check your environment variables:');
    console.log('   - USERS_DB_URL');
    console.log('   - USERS_DB_TOKEN');
    process.exit(1);
  }
}

testAuth();
