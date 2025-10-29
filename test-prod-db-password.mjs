#!/usr/bin/env node

/**
 * Test Production Database Login
 */

import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const USERS_DB_URL = process.env.USERS_DB_URL;
const USERS_DB_TOKEN = process.env.USERS_DB_TOKEN;

async function testProductionDB() {
  console.log('🔍 Testing Production Database Login\n');
  
  if (!USERS_DB_URL || !USERS_DB_TOKEN) {
    console.log('❌ Missing environment variables');
    console.log('USERS_DB_URL:', USERS_DB_URL ? 'Set' : 'Missing');
    console.log('USERS_DB_TOKEN:', USERS_DB_TOKEN ? 'Set' : 'Missing');
    return;
  }

  const client = createClient({
    url: USERS_DB_URL,
    authToken: USERS_DB_TOKEN,
  });

  // Test 1: Check if user exists
  console.log('1️⃣ Checking if admin@collegecomps.com exists...');
  const userResult = await client.execute({
    sql: 'SELECT id, email, password_hash, name FROM users WHERE email = ?',
    args: ['admin@collegecomps.com']
  });

  if (userResult.rows.length === 0) {
    console.log('❌ User not found!');
    return;
  }

  const user = userResult.rows[0];
  console.log('✅ User found:');
  console.log('  ID:', user.id);
  console.log('  Email:', user.email);
  console.log('  Name:', user.name);
  console.log('  Password Hash:', user.password_hash);

  // Test 2: Verify password
  console.log('\n2️⃣ Testing password "Admin123!@#"...');
  const isValid = await bcrypt.compare('Admin123!@#', user.password_hash);
  
  if (isValid) {
    console.log('✅ Password is CORRECT!');
  } else {
    console.log('❌ Password is WRONG!');
    console.log('   Hash in DB:', user.password_hash);
    console.log('   Testing password: Admin123!@#');
  }

  // Test 3: Try other common passwords
  console.log('\n3️⃣ Testing other common passwords...');
  const testPasswords = [
    'Admin123',
    'Admin123!',
    'admin123!@#',
    'password',
    'Password123!@#'
  ];

  for (const pwd of testPasswords) {
    const matches = await bcrypt.compare(pwd, user.password_hash);
    if (matches) {
      console.log(`✅ FOUND IT! Password is: "${pwd}"`);
      break;
    }
  }
}

testProductionDB().catch(console.error);
