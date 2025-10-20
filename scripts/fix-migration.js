/**
 * Manual fix to add missing columns from migration
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });
const { createClient } = require('@libsql/client');

async function fixMigration() {
  console.log('🔧 Fixing missing columns...\n');

  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log('✅ Connected to Turso database\n');

  // Add implied_roi column
  try {
    console.log('Adding implied_roi column...');
    await db.execute('ALTER TABLE institutions ADD COLUMN implied_roi REAL');
    console.log('✅ Added implied_roi column\n');
  } catch (error) {
    if (error.message.includes('duplicate column')) {
      console.log('⚠️  implied_roi column already exists\n');
    } else {
      console.error('❌ Failed to add implied_roi:', error.message, '\n');
    }
  }

  // Add acceptance_rate column
  try {
    console.log('Adding acceptance_rate column...');
    await db.execute('ALTER TABLE institutions ADD COLUMN acceptance_rate REAL');
    console.log('✅ Added acceptance_rate column\n');
  } catch (error) {
    if (error.message.includes('duplicate column')) {
      console.log('⚠️  acceptance_rate column already exists\n');
    } else {
      console.error('❌ Failed to add acceptance_rate:', error.message, '\n');
    }
  }

  // Create indexes
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_institutions_implied_roi ON institutions(implied_roi DESC)',
    'CREATE INDEX IF NOT EXISTS idx_institutions_acceptance_rate ON institutions(acceptance_rate)',
    'CREATE INDEX IF NOT EXISTS idx_institutions_roi_state ON institutions(state, implied_roi DESC)'
  ];

  for (const sql of indexes) {
    try {
      console.log(`Creating index: ${sql.substring(0, 60)}...`);
      await db.execute(sql);
      console.log('✅ Index created\n');
    } catch (error) {
      console.error(`❌ Failed: ${error.message}\n`);
    }
  }

  // Verify columns exist
  console.log('🔍 Verifying columns...\n');
  try {
    const result = await db.execute(`
      SELECT 
        implied_roi,
        acceptance_rate,
        average_sat,
        average_act
      FROM institutions
      LIMIT 1
    `);
    console.log('✅ All columns verified successfully!');
    console.log('   Columns:', Object.keys(result.rows[0] || {}).join(', '));
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }

  console.log('\n🎉 Done!');
}

fixMigration().catch(error => {
  console.error('\n❌ Fix failed:', error);
  process.exit(1);
});
