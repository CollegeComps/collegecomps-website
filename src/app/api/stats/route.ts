import { NextRequest, NextResponse } from 'next/server';
import { rateLimitByIP } from '@/lib/rate-limit';
import { CollegeDataService } from '@/lib/database';
import { cached } from '@/lib/api-cache';

// Cache stats for 30 days — IPEDS data refreshes yearly.
export const revalidate = 2592000;

export async function GET(request: NextRequest) {
  const limited = rateLimitByIP(request, 'stats', { limit: 10, windowSeconds: 60 });
  if (limited) return limited;

  try {
    const stats = await cached('stats:db', 2592000, async () => {
      const collegeService = new CollegeDataService();
      return collegeService.getDatabaseStats();
    });

    const response = NextResponse.json(stats);
    // CDN/browser cache: fresh for 30 days, stale-while-revalidate for 7 days
    response.headers.set('Cache-Control', 'public, s-maxage=2592000, stale-while-revalidate=604800');
    return response;
  } catch (error) {
    console.error('Error fetching database stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}