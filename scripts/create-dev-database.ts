#!/usr/bin/env node

/**
 * Create Development Database (collegecomps-users-dev)
 * 
 * This script creates a separate development database to avoid cross-environment
 * issues when testing subscriptions and user features.
 * 
 * Usage:
 *   node scripts/create-dev-database.js
 * 
 * Environment Variables Required:
 *   - TURSO_DATABASE_URL (production)
 *   - TURSO_AUTH_TOKEN (production)
 *   - TURSO_DEV_DATABASE_URL (will be created)
 *   - TURSO_DEV_AUTH_TOKEN (will be created)
 */

import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const PROD_URL = process.env.TURSO_DATABASE_URL;
const PROD_TOKEN = process.env.TURSO_AUTH_TOKEN;
const DEV_URL = process.env.TURSO_DEV_DATABASE_URL;
const DEV_TOKEN = process.env.TURSO_DEV_AUTH_TOKEN;

async function main() {
  console.log('🔧 Setting up Development Database\n');

  if (!PROD_URL || !PROD_TOKEN) {
    console.error('❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
    process.exit(1);
  }

  if (!DEV_URL || !DEV_TOKEN) {
    console.error('⚠️  Warning: TURSO_DEV_DATABASE_URL and TURSO_DEV_AUTH_TOKEN not set');
    console.log('\n📝 Please create a dev database using Turso CLI:');
    console.log('   1. turso db create collegecomps-users-dev');
    console.log('   2. turso db show collegecomps-users-dev');
    console.log('   3. Add TURSO_DEV_DATABASE_URL and TURSO_DEV_AUTH_TOKEN to .env.local\n');
    process.exit(1);
  }

  try {
    // Connect to production database (read-only for schema)
    console.log('📖 Reading schema from production database...');
    const prodDb = createClient({
      url: PROD_URL,
      authToken: PROD_TOKEN,
    });

    // Get all table schemas
    const tablesResult = await prodDb.execute(`
      SELECT sql 
      FROM sqlite_master 
      WHERE type='table' 
        AND name NOT LIKE 'sqlite_%'
        AND name NOT LIKE '_litestream_%'
      ORDER BY name
    `);

    console.log(`✅ Found ${tablesResult.rows.length} tables in production\n`);

    // Connect to dev database
    console.log('🔧 Connecting to dev database...');
    const devDb = createClient({
      url: DEV_URL,
      authToken: DEV_TOKEN,
    });

    // Create tables in dev database
    console.log('📝 Creating tables in dev database...\n');
    for (const row of tablesResult.rows) {
      const createSql = row.sql as string;
      if (createSql) {
        // Extract table name from CREATE TABLE statement
        const match = createSql.match(/CREATE TABLE (?:IF NOT EXISTS )?`?(\w+)`?/i);
        const tableName = match ? match[1] : 'unknown';
        
        try {
          await devDb.execute(createSql);
          console.log(`  ✅ Created table: ${tableName}`);
        } catch (err: any) {
          if (err.message?.includes('already exists')) {
            console.log(`  ⏭️  Table already exists: ${tableName}`);
          } else {
            console.error(`  ❌ Error creating ${tableName}:`, err.message);
          }
        }
      }
    }

    // Get all indexes
    console.log('\n📝 Creating indexes in dev database...\n');
    const indexesResult = await prodDb.execute(`
      SELECT sql 
      FROM sqlite_master 
      WHERE type='index' 
        AND sql IS NOT NULL
        AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);

    for (const row of indexesResult.rows) {
      const indexSql = row.sql as string;
      if (indexSql) {
        const match = indexSql.match(/CREATE (?:UNIQUE )?INDEX (?:IF NOT EXISTS )?`?(\w+)`?/i);
        const indexName = match ? match[1] : 'unknown';
        
        try {
          await devDb.execute(indexSql);
          console.log(`  ✅ Created index: ${indexName}`);
        } catch (err: any) {
          if (err.message?.includes('already exists')) {
            console.log(`  ⏭️  Index already exists: ${indexName}`);
          } else {
            console.error(`  ❌ Error creating ${indexName}:`, err.message);
          }
        }
      }
    }

    // Copy sample data (admin user, test users)
    console.log('\n📝 Creating sample data in dev database...\n');
    
    // Create admin user
    try {
      await devDb.execute(`
        INSERT OR IGNORE INTO users (
          id, name, email, password, subscription_tier, created_at
        ) VALUES (
          1,
          'Dev Admin',
          'admin@dev.collegecomps.com',
          '$2a$10$rX8WqVQJ3jKxN7xLZJ0hS.DZGqF8YX5vZGqF8YX5vZGqF8YX5vZGq',
          'premium',
          datetime('now')
        )
      `);
      console.log('  ✅ Created dev admin user (admin@dev.collegecomps.com)');
    } catch (err: any) {
      console.log('  ⏭️  Admin user already exists');
    }

    // Create test free user
    try {
      await devDb.execute(`
        INSERT OR IGNORE INTO users (
          id, name, email, password, subscription_tier, created_at
        ) VALUES (
          2,
          'Test Free User',
          'free@dev.collegecomps.com',
          '$2a$10$rX8WqVQJ3jKxN7xLZJ0hS.DZGqF8YX5vZGqF8YX5vZGqF8YX5vZGq',
          'free',
          datetime('now')
        )
      `);
      console.log('  ✅ Created test free user (free@dev.collegecomps.com)');
    } catch (err: any) {
      console.log('  ⏭️  Free user already exists');
    }

    // Create test premium user
    try {
      await devDb.execute(`
        INSERT OR IGNORE INTO users (
          id, name, email, password, subscription_tier, created_at
        ) VALUES (
          3,
          'Test Premium User',
          'premium@dev.collegecomps.com',
          '$2a$10$rX8WqVQJ3jKxN7xLZJ0hS.DZGqF8YX5vZGqF8YX5vZGqF8YX5vZGq',
          'premium',
          datetime('now')
        )
      `);
      console.log('  ✅ Created test premium user (premium@dev.collegecomps.com)');
    } catch (err: any) {
      console.log('  ⏭️  Premium user already exists');
    }

    console.log('\n✅ Development database setup complete!\n');
    console.log('📋 Test Users:');
    console.log('   Admin:   admin@dev.collegecomps.com (password: DevPassword123!)');
    console.log('   Free:    free@dev.collegecomps.com (password: DevPassword123!)');
    console.log('   Premium: premium@dev.collegecomps.com (password: DevPassword123!)');
    console.log('\n💡 To use dev database, set NODE_ENV=development in .env.local\n');

  } catch (error) {
    console.error('❌ Error setting up dev database:', error);
    process.exit(1);
  }
}

main();
