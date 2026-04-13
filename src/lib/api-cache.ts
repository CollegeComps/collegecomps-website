/**
 * Persistent cache for DB queries backed by Next.js's Data Cache.
 *
 * Why this matters:
 * - Vercel runs multiple serverless instances in multiple regions
 * - Pure in-memory caches only help on warm invocations on the same instance
 * - unstable_cache stores results in Vercel's Data Cache which is shared
 *   across ALL instances and ALL regions — a true global cache
 *
 * Usage:
 *   const data = await cached('my-key', 2592000, async () => {
 *     return db.prepare('SELECT ...').all();
 *   });
 *
 * Cache invalidation:
 * - Automatic on deploy (new build id invalidates the cache)
 * - Manual via revalidateTag('db-data')
 * - Time-based via the ttlSeconds argument
 *
 * For the CollegeComps use case (IPEDS data, yearly refresh):
 * Use 2592000 (30 days) as the default TTL. Data rarely changes.
 */

import { unstable_cache } from 'next/cache';

const DEFAULT_TAG = 'db-data';

// Simple in-memory fallback for cases where we need sync cache or backup.
interface CacheEntry<T> {
  data: T;
  expires: number;
}
const inMemory = new Map<string, CacheEntry<unknown>>();

let lastCleanup = 0;
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 300_000) return;
  lastCleanup = now;
  for (const [key, entry] of inMemory) {
    if (entry.expires < now) inMemory.delete(key);
  }
}

/**
 * Cache a fetcher function's result in Vercel's Data Cache.
 * Persists across all serverless instances and regions.
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  // If ttl is 0, bypass cache entirely (e.g., user-specific data)
  if (ttlSeconds === 0) {
    return fetcher();
  }

  const wrapped = unstable_cache(
    fetcher,
    [key], // cache key parts
    {
      revalidate: ttlSeconds,
      tags: [DEFAULT_TAG, key],
    }
  );

  return wrapped();
}

/**
 * Synchronous in-memory getter — kept for routes that need early return
 * without async. Only useful within a single warm invocation.
 */
export function getCached<T>(key: string): T | null {
  cleanup();
  const entry = inMemory.get(key);
  if (!entry || entry.expires < Date.now()) return null;
  return entry.data as T;
}

/**
 * Synchronous in-memory setter — companion to getCached.
 */
export function setCached<T>(key: string, data: T, ttlSeconds: number): void {
  if (ttlSeconds === 0) return;
  inMemory.set(key, {
    data,
    expires: Date.now() + ttlSeconds * 1000,
  });
}
