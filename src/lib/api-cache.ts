/**
 * Simple in-memory cache for API responses. Survives warm invocations on
 * the same Vercel serverless instance. Reset on cold start — which is fine
 * since data is public and reproducible.
 *
 * Use this for endpoints where:
 * - The response is the same for all users, or
 * - The variation is small enough to key by query params
 *
 * Do NOT use for user-specific data.
 */

interface CacheEntry<T> {
  data: T;
  expires: number;
}

const store = new Map<string, CacheEntry<unknown>>();

// Periodic cleanup to prevent unbounded growth
let lastCleanup = 0;
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 300_000) return; // every 5 minutes
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (entry.expires < now) store.delete(key);
  }
}

export function getCached<T>(key: string): T | null {
  cleanup();
  const entry = store.get(key);
  if (!entry || entry.expires < Date.now()) return null;
  return entry.data as T;
}

export function setCached<T>(key: string, data: T, ttlSeconds: number): void {
  store.set(key, {
    data,
    expires: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Fetch with in-memory cache wrapper. Returns cached value if available,
 * otherwise calls fetcher() and caches the result.
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const hit = getCached<T>(key);
  if (hit !== null) return hit;

  const fresh = await fetcher();
  setCached(key, fresh, ttlSeconds);
  return fresh;
}
