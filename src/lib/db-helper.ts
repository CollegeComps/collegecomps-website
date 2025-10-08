import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { TursoAdapter } from './turso-adapter';

/**
 * Safely opens a SQLite database with build-time error handling
 * Returns null during build if database doesn't exist
 */
export function safeOpenDatabase(dbPath: string, options?: Database.Options): Database.Database | null {
  try {
    // Resolve relative paths
    const resolvedPath = path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath);
    
    // During build, check if file exists
    if (!fs.existsSync(resolvedPath)) {
      // If we're building for production, just warn and return null
      // The routes will handle null databases gracefully
      if (process.env.NEXT_PHASE === 'phase-production-build' || 
          process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL) {
        console.warn(`Database not found during build: ${resolvedPath}`);
        return null;
      }
    }
    
    return new Database(resolvedPath, options);
  } catch (error) {
    // During build, don't throw - just return null
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn(`Failed to open database during build: ${dbPath}`, error);
      return null;
    }
    throw error;
  }
}

/**
 * Checks if we're in a build environment where databases might not be available
 */
export function isBuildTime(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

// Singleton instances for frequently used databases
let usersDb: Database.Database | null | undefined = undefined;
let collegeDb: Database.Database | TursoAdapter | null | undefined = undefined;

/**
 * Get or create users database connection (lazy initialization)
 */
export function getUsersDb(): Database.Database | null {
  if (usersDb === undefined) {
    usersDb = safeOpenDatabase('data/users.db');
  }
  return usersDb;
}

/**
 * Get or create college database connection (lazy initialization)
 * Uses Turso in production (via TURSO_DATABASE_URL env var)
 * Uses local SQLite file in development
 */
export function getCollegeDb(): Database.Database | TursoAdapter | null {
  if (collegeDb === undefined) {
    // Check environment
    console.log('🔍 getCollegeDb() environment check:', {
      TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? 'SET' : 'NOT SET',
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL ? 'true' : 'false',
      isBuildTime: isBuildTime(),
    });

    // Production: Use Turso if URL is provided
    if (process.env.TURSO_DATABASE_URL && process.env.TURSO_DATABASE_URL.startsWith('libsql://')) {
      console.log('🚀 Initializing Turso client for college data...');
      try {
        collegeDb = new TursoAdapter(
          process.env.TURSO_DATABASE_URL,
          process.env.TURSO_AUTH_TOKEN || ''
        );
        console.log('✅ Turso client initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Turso client:', error);
        collegeDb = null;
      }
    } 
    // Development/Fallback: Use local SQLite file or return null
    else {
      if (isBuildTime()) {
        console.warn('⚠️ Build time detected, returning null for college database');
        collegeDb = null;
      } else if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        // In production but no Turso URL - return null instead of trying local file
        console.error('❌ TURSO_DATABASE_URL not set in production environment!');
        console.error('   Add environment variable in Vercel dashboard');
        collegeDb = null;
      } else {
        // Local development - try local file
        console.log('📁 Using local SQLite file for development');
        const dbPath = path.join(process.cwd(), '..', 'college-scrapper', 'data', 'college_data.db');
        collegeDb = safeOpenDatabase(dbPath, { readonly: true });
      }
    }
  }
  return collegeDb;
}
