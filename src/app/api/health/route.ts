import { NextRequest, NextResponse } from 'next/server';
import { rateLimitByIP } from '@/lib/rate-limit';
import { getDatabase } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const limited = rateLimitByIP(request, 'health', { limit: 5, windowSeconds: 60 });
  if (limited) return limited;

  let dbStatus: 'up' | 'down' = 'down';

  try {
    const db = getDatabase();
    if (db) {
      await db.prepare('SELECT 1').get();
      dbStatus = 'up';
    }
  } catch {
    // db is down
  }

  const status = dbStatus === 'up' ? 'healthy' : 'unhealthy';

  return NextResponse.json(
    { status, timestamp: new Date().toISOString() },
    {
      status: dbStatus === 'up' ? 200 : 503,
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
    }
  );
}
