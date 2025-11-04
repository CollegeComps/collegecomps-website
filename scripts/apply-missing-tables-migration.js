#!/usr/bin/env node

/**
 * Apply missing tables migration to Turso databases
 * Run with: node scripts/apply-missing-tables-migration.js [dev|prod]
 */

const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MIGRATION_FILE = path.join(__dirname, '../database/migrations/001_add_missing_tables.sql');

async function applyMigration(dbUrl, authToken, dbName) {
  console.log(`\n📊 Applying migration to ${dbName}...`);
  
  const client = createClient({
    url: dbUrl,
    authToken: authToken
  });

  try {
    // Read migration file
    const migrationSQL = fs.readFileSync(MIGRATION_FILE, 'utf8');
    
    console.log(`  Executing migration SQL...`);

    // Execute the entire migration as one batch
    try {
      await client.executeMultiple(migrationSQL);
      console.log(`  ✅ All tables and indexes created successfully`);
    } catch (error) {
      // If batch fails, try individual statements
      console.log(`  ⚠️  Batch execution failed, trying individual statements...`);
      
      // Split by statement
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      console.log(`  Found ${statements.length} SQL statements`);

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i] + ';';
        try {
          await client.execute(stmt);
          
          // Extract table/index name for logging
          const match = stmt.match(/CREATE (?:TABLE|INDEX)[^(]*?(?:EXISTS\s+)?(\w+)/i);
          const objName = match ? match[1] : `statement ${i + 1}`;
          console.log(`  ✅ Created ${objName}`);
        } catch (error) {
          // Ignore "already exists" errors
          if (error.message.includes('already exists')) {
            const match = stmt.match(/CREATE (?:TABLE|INDEX)[^(]*?(?:EXISTS\s+)?(\w+)/i);
            const objName = match ? match[1] : `statement ${i + 1}`;
            console.log(`  ⏭️  ${objName} already exists`);
          } else {
            console.error(`  ❌ Error executing statement ${i + 1}:`, error.message);
            console.error(`     Statement: ${stmt.substring(0, 100)}...`);
          }
        }
      }
    }

    console.log(`\n✅ Migration completed for ${dbName}`);
    
  } catch (error) {
    console.error(`❌ Error applying migration to ${dbName}:`, error);
    throw error;
  } finally {
    client.close();
  }
}

async function main() {
  const env = process.argv[2] || 'dev';
  
  console.log(`🚀 Starting migration for ${env} environment`);
  console.log(`📄 Migration file: ${MIGRATION_FILE}\n`);

  if (env === 'dev') {
    // Apply to dev database
    const devDbUrl = process.env.TURSO_DATABASE_URL;
    const devAuthToken = process.env.TURSO_AUTH_TOKEN;

    if (!devDbUrl || !devAuthToken) {
      console.error('❌ Missing dev database credentials in .env.local');
      process.exit(1);
    }

    await applyMigration(devDbUrl, devAuthToken, 'DEV (users DB)');

  } else if (env === 'prod') {
    // Apply to production database
    const prodDbUrl = process.env.USERS_DB_URL;
    const prodAuthToken = process.env.USERS_DB_TOKEN;

    if (!prodDbUrl || !prodAuthToken) {
      console.error('❌ Missing production database credentials');
      console.error('   Make sure USERS_DB_URL and USERS_DB_TOKEN are set');
      process.exit(1);
    }

    console.log('⚠️  WARNING: You are about to apply this migration to PRODUCTION');
    console.log('   Please ensure you have tested this migration in dev first!');
    console.log('\n   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

    await new Promise(resolve => setTimeout(resolve, 5000));

    await applyMigration(prodDbUrl, prodAuthToken, 'PRODUCTION (users DB)');

  } else {
    console.error('❌ Invalid environment. Use "dev" or "prod"');
    process.exit(1);
  }

  console.log('\n✨ All migrations applied successfully!');
}

main().catch(error => {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
});
