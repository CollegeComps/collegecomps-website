import { NextRequest, NextResponse } from 'next/server';
import { rateLimitByIP } from '@/lib/rate-limit';
import { CollegeDataService } from '@/lib/database';
import { cached } from '@/lib/api-cache';

export const revalidate = 2592000;

export async function GET(request: NextRequest) {
  const limited = rateLimitByIP(request, 'programs', { limit: 30, windowSeconds: 60 });
  if (limited) return limited;

  try {
    const searchParams = request.nextUrl.searchParams;
    const unitid = searchParams.get('unitid');
    const degreeLevel = searchParams.get('degreeLevel');

    if (!unitid) {
      return NextResponse.json({ error: 'unitid is required' }, { status: 400 });
    }

    const unitidNum = parseInt(unitid);
    if (isNaN(unitidNum)) {
      return NextResponse.json({ error: 'unitid must be a valid number' }, { status: 400 });
    }

    const allowedLevels = new Set(['', 'associates', 'bachelors', 'masters', 'doctorate', 'certificate']);
    const normalizedLevel = degreeLevel && allowedLevels.has(degreeLevel) ? (degreeLevel as any) : undefined;

    const programs = await cached(`programs:${unitidNum}:${normalizedLevel || 'all'}`, 2592000, async () => {
      const db = new CollegeDataService();
      return db.getInstitutionPrograms(unitidNum, normalizedLevel);
    });

    const response = NextResponse.json({
      programs,
      count: programs.length,
      unitid: unitidNum
    });
    response.headers.set('Cache-Control', 'public, s-maxage=2592000, stale-while-revalidate=604800');
    return response;
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
