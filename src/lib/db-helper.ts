import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

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
  return process.env.NEXT_PHASE === 'phase-production-build' ||
         (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL);
}

// Singleton instances for frequently used databases
let usersDb: Database.Database | null | undefined = undefined;
let collegeDb: Database.Database | null | undefined = undefined;

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
 */
export function getCollegeDb(): Database.Database | null {
  if (collegeDb === undefined) {
    const dbPath = path.join(process.cwd(), '..', 'college-scrapper', 'data', 'college_data.db');
    collegeDb = safeOpenDatabase(dbPath, { readonly: true });
  }
  return collegeDb;
}
