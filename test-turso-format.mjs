#!/usr/bin/env node

/**
 * Test Turso Row Format
 */

import { TursoAdapter } from './src/lib/turso-adapter.js';

const USERS_DB_URL = process.env.USERS_DB_URL;
const USERS_DB_TOKEN = process.env.USERS_DB_TOKEN;

async function testTursoRowFormat() {
  console.log('🔍 Testing Turso Row Format\n');
  
  const db = new TursoAdapter(USERS_DB_URL, USERS_DB_TOKEN);
  
  console.log('1️⃣ Testing prepare().get()...');
  const user = await db.prepare('SELECT * FROM users WHERE email = ?')
    .get('admin@collegecomps.com');
  
  console.log('Result:', user);
  console.log('Type:', typeof user);
  console.log('Is object?', user !== null && typeof user === 'object');
  
  if (user) {
    console.log('\nUser properties:');
    console.log('  id:', user.id);
    console.log('  email:', user.email);
    console.log('  password_hash:', user.password_hash);
    console.log('  name:', user.name);
  }
}

testTursoRowFormat().catch(console.error);
