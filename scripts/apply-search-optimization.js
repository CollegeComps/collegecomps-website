const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

async function applyOptimization() {
  const client = createClient({
    url: envVars.TURSO_DATABASE_URL,
    authToken: envVars.TURSO_AUTH_TOKEN
  });

  try {
    console.log('Creating programs_search_cache table...');
    
    await client.execute(`
      CREATE TABLE IF NOT EXISTS programs_search_cache (
        cipcode TEXT PRIMARY KEY,
        cip_title TEXT NOT NULL,
        cip_title_lower TEXT NOT NULL,
        institution_count INTEGER NOT NULL,
        total_completions INTEGER NOT NULL,
        avg_completions REAL NOT NULL
      )
    `);
    
    console.log('Creating indexes...');
    
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_programs_cache_title_lower 
      ON programs_search_cache(cip_title_lower)
    `);
    
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_programs_cache_completions 
      ON programs_search_cache(total_completions DESC)
    `);
    
    console.log('Populating cache table...');
    
    await client.execute(`
      INSERT OR REPLACE INTO programs_search_cache 
      (cipcode, cip_title, cip_title_lower, institution_count, total_completions, avg_completions)
      SELECT 
        ap.cipcode,
        ap.cip_title,
        LOWER(ap.cip_title) as cip_title_lower,
        COUNT(DISTINCT ap.unitid) as institution_count,
        SUM(ap.completions) as total_completions,
        AVG(ap.completions) as avg_completions
      FROM academic_programs ap
      WHERE ap.cip_title IS NOT NULL 
        AND ap.completions > 0
      GROUP BY ap.cipcode, ap.cip_title
    `);
    
    const result = await client.execute('SELECT COUNT(*) as count FROM programs_search_cache');
    console.log(`✅ Success! Cached ${result.rows[0].count} programs`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

applyOptimization();
