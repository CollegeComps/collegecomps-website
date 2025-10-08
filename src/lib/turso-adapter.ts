/**
 * Turso Adapter - Makes Turso client compatible with better-sqlite3 API
 * This allows existing code to work with both local SQLite and Turso without changes
 */

import { createClient, type Client } from '@libsql/client';

export class TursoAdapter {
  private client: Client;

  constructor(url: string, authToken: string) {
    this.client = createClient({ 
      url, 
      authToken: authToken || undefined 
    });
  }

  /**
   * Mimics better-sqlite3's prepare() API
   * Returns an object with all(), get(), and run() methods
   */
  prepare(sql: string) {
    const client = this.client;

    return {
      /**
       * Execute query and return all rows
       * @param params - Query parameters
       */
      all: async (...params: any[]) => {
        try {
          const result = await client.execute({
            sql: sql,
            args: params,
          });
          return result.rows;
        } catch (error) {
          console.error('Turso query error (all):', error);
          throw error;
        }
      },

      /**
       * Execute query and return first row only
       * @param params - Query parameters
       */
      get: async (...params: any[]) => {
        try {
          const result = await client.execute({
            sql: sql,
            args: params,
          });
          return result.rows[0] || null;
        } catch (error) {
          console.error('Turso query error (get):', error);
          throw error;
        }
      },

      /**
       * Execute query (for INSERT, UPDATE, DELETE)
       * @param params - Query parameters
       */
      run: async (...params: any[]) => {
        try {
          const result = await client.execute({
            sql: sql,
            args: params,
          });
          return {
            changes: result.rowsAffected,
            lastInsertRowid: result.lastInsertRowid,
          };
        } catch (error) {
          console.error('Turso query error (run):', error);
          throw error;
        }
      },
    };
  }

  /**
   * Execute a single SQL statement directly
   */
  async execute(sql: string, args: any[] = []) {
    return await this.client.execute({ sql, args });
  }

  /**
   * Close the database connection
   */
  close() {
    this.client.close();
  }
}
