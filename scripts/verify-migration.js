require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@libsql/client');

async function verifyMigration() {
  const client = createClient({
    url: process.env.USERS_DB_URL,
    authToken: process.env.USERS_DB_TOKEN
  });

  try {
    const result = await client.execute('PRAGMA table_info(users)');
    
    console.log('✓ Users table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.type})`);
    });
    
    // Check for the new columns
    const columnNames = result.rows.map(row => row.name);
    const required = ['verification_token', 'verification_token_expires', 'email_preferences'];
    const missing = required.filter(col => !columnNames.includes(col));
    
    console.log('\n✓ Migration verification:');
    if (missing.length === 0) {
      console.log('  ✅ All required columns present!');
      console.log('  ✅ Migration applied successfully!');
    } else {
      console.log('  ❌ Missing columns:', missing.join(', '));
      console.log('  ⚠️  Migration needs to be applied');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.close();
  }
}

verifyMigration();
