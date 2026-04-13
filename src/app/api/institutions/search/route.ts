import { NextRequest, NextResponse } from 'next/server';
import { rateLimitByIP } from '@/lib/rate-limit';
import { getCollegeDb } from '@/lib/db-helper';
import { cached } from '@/lib/api-cache';

export async function GET(request: NextRequest) {
  const limited = rateLimitByIP(request, 'inst-search', { limit: 20, windowSeconds: 60 });
  if (limited) return limited;

  const db = getCollegeDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ institutions: [] });
  }

  try {
    // Normalize both the query and database names to handle ampersand variations
    const normalizedQuery = query.replace(/\s*&\s*/g, '&').toLowerCase();

    // Cache each search term for 30 days. Institution names rarely change.
    const names = await cached(`inst-search:${normalizedQuery}`, 2592000, async () => {
      const rows = await db
        .prepare(
          `SELECT DISTINCT name
           FROM institutions
           WHERE REPLACE(name, ' & ', '&') LIKE ?
           ORDER BY name
           LIMIT 15`
        )
        .all(`%${normalizedQuery}%`) as { name: string }[];
      return rows.map((r) => r.name);
    });

    const response = NextResponse.json({ institutions: names });
    response.headers.set('Cache-Control', 'public, s-maxage=2592000, stale-while-revalidate=604800');
    return response;
  } catch (error) {
    console.error('Institution search error:', error);
    return NextResponse.json({ error: 'Failed to search institutions' }, { status: 500 });
  }
}
