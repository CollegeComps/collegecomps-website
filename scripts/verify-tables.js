#!/usr/bin/env node

/**
 * Verify that tables exist in database
 */

const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function verifyTables(dbUrl, authToken, dbName) {
  console.log(`\n📊 Checking tables in ${dbName}...`);
  
  const client = createClient({
    url: dbUrl,
    authToken: authToken
  });

  const tablesToCheck = [
    'user_submission_stats',
    'bookmarked_colleges',
    'roi_scenarios'
  ];

  try {
    for (const table of tablesToCheck) {
      try {
        const result = await client.execute(`SELECT name FROM sqlite_master WHERE type='table' AND name='${table}'`);
        if (result.rows.length > 0) {
          console.log(`  ✅ ${table} exists`);
          
          // Check row count
          const count = await client.execute(`SELECT COUNT(*) as count FROM ${table}`);
          console.log(`     Rows: ${count.rows[0].count}`);
        } else {
          console.log(`  ❌ ${table} MISSING`);
        }
      } catch (error) {
        console.log(`  ❌ ${table} error:`, error.message);
      }
    }
  } finally {
    client.close();
  }
}

async function main() {
  const env = process.argv[2] || 'dev';

  if (env === 'dev') {
    await verifyTables(
      process.env.TURSO_DATABASE_URL,
      process.env.TURSO_AUTH_TOKEN,
      'DEV'
    );
  } else if (env === 'prod') {
    await verifyTables(
      process.env.USERS_DB_URL,
      process.env.USERS_DB_TOKEN,
      'PRODUCTION'
    );
  }
}

main();
