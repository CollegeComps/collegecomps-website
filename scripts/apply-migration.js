#!/usr/bin/env node

// Apply database migration to Turso
// Run with: node scripts/apply-migration.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  console.log('🚀 Starting database migration...\n');

  // Check environment variables
  const dbUrl = process.env.USERS_DB_URL || process.env.USERS_DATABASE_URL;
  const dbToken = process.env.USERS_DB_TOKEN || process.env.USERS_DATABASE_AUTH_TOKEN;

  if (!dbUrl || !dbToken) {
    console.error('❌ Error: USERS_DB_URL and USERS_DB_TOKEN environment variables are required');
    console.error('   Make sure you have .env.local file with:');
    console.error('   USERS_DB_URL=your-turso-url');
    console.error('   USERS_DB_TOKEN=your-turso-token');
    process.exit(1);
  }

  console.log('✅ Environment variables found');
  console.log(`📡 Connecting to: ${dbUrl.substring(0, 30)}...\n`);

  // Create Turso client
  const client = createClient({
    url: dbUrl,
    authToken: dbToken,
  });

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../database/migrations/001_add_email_verification.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('📝 SQL statements to execute:\n');
    console.log(sql);
    console.log('\n' + '='.repeat(60) + '\n');

    // Split by semicolons and filter out comments/empty lines
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      console.log(`  ${statement.substring(0, 60)}...`);
      
      try {
        await client.execute(statement);
        console.log(`  ✅ Success\n`);
      } catch (error) {
        // Check if error is due to column already existing
        if (error.message && error.message.includes('duplicate column name')) {
          console.log(`  ⚠️  Column already exists, skipping\n`);
        } else if (error.message && error.message.includes('already exists')) {
          console.log(`  ⚠️  Already exists, skipping\n`);
        } else {
          throw error;
        }
      }
    }

    // Verify the migration
    console.log('🔍 Verifying migration...\n');
    
    const result = await client.execute('PRAGMA table_info(users)');
    const columns = result.rows.map(row => row.name);
    
    const requiredColumns = ['verification_token', 'verification_token_expires', 'email_preferences'];
    const missingColumns = requiredColumns.filter(col => !columns.includes(col));
    
    if (missingColumns.length > 0) {
      console.error(`❌ Migration incomplete. Missing columns: ${missingColumns.join(', ')}`);
      process.exit(1);
    }

    console.log('✅ All required columns exist:');
    requiredColumns.forEach(col => console.log(`   - ${col}`));
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('📊 Updated users table schema\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

applyMigration();
