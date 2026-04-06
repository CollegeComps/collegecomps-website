import { NextRequest, NextResponse } from 'next/server';
import { rateLimitByIP } from '@/lib/rate-limit';
import { CollegeDataService } from '@/lib/database';

// Cache stats for 1 hour — counts change only when new data is loaded
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const limited = rateLimitByIP(request, 'stats', { limit: 10, windowSeconds: 60 });
  if (limited) return limited;

  try {
    const collegeService = new CollegeDataService();
    const stats = await collegeService.getDatabaseStats();

    const response = NextResponse.json(stats);
    // CDN/browser cache: fresh for 1hr, stale-while-revalidate for 24hrs
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (error) {
    console.error('Error fetching database stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}