#!/usr/bin/env node
/**
 * Apply Database Migration - Add Implied ROI Fields
 * =================================================
 * 
 * Applies migration 002_add_implied_roi_fields.sql to Turso database
 * 
 * Usage: node scripts/apply-roi-migration.js
 */

const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
require('dotenv/config');

async function applyMigration() {
  console.log('📊 Applying ROI Migration to Turso Database');
  console.log('============================================\n');

  // Initialize Turso client
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || !tursoToken) {
    console.error('❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
    process.exit(1);
  }

  const client = createClient({
    url: tursoUrl,
    authToken: tursoToken
  });

  console.log('✅ Connected to Turso database\n');

  // Read migration file
  const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '002_add_implied_roi_fields.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  // Split by semicolon and filter out empty statements
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const statementPreview = statement.substring(0, 60).replace(/\n/g, ' ') + '...';
    
    console.log(`[${i + 1}/${statements.length}] Executing: ${statementPreview}`);
    
    try {
      await client.execute(statement);
      console.log(`   ✅ Success\n`);
      successCount++;
    } catch (error) {
      // Check if error is because column/index already exists
      if (error.message.includes('already exists') || 
          error.message.includes('duplicate column name')) {
        console.log(`   ⚠️  Already exists (skipping)\n`);
        skipCount++;
      } else {
        console.error(`   ❌ Error: ${error.message}\n`);
        errorCount++;
      }
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log('====================');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`⚠️  Skipped: ${skipCount}`);
  console.log(`❌ Errors: ${errorCount}`);

  if (errorCount > 0) {
    console.log('\n⚠️  Some statements failed. Please review errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run calculate-roi');
    console.log('2. Verify data with queries');
  }
}

if (require.main === module) {
  applyMigration().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { applyMigration };
