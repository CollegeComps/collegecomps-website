import { NextRequest, NextResponse } from 'next/server';
import { CollegeDataService } from '@/lib/database';
import { cached } from '@/lib/api-cache';

export const revalidate = 2592000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ unitid: string }> }
) {
  try {
    const { unitid } = await params;
    const unitidNum = parseInt(unitid);
    const searchParams = request.nextUrl.searchParams;
    const degreeLevel = searchParams.get('degreeLevel');

    if (isNaN(unitidNum)) {
      return NextResponse.json(
        { error: 'Invalid institution ID' },
        { status: 400 }
      );
    }

    const allowedLevels = new Set(['', 'associates', 'bachelors', 'masters', 'doctorate', 'certificate']);
    const normalizedLevel = degreeLevel && allowedLevels.has(degreeLevel) ? (degreeLevel as any) : undefined;

    const programs = await cached(`inst-programs:${unitidNum}:${normalizedLevel || 'all'}`, 2592000, async () => {
      const collegeService = new CollegeDataService();
      return collegeService.getInstitutionPrograms(unitidNum, normalizedLevel);
    });

    const response = NextResponse.json({ programs });
    response.headers.set('Cache-Control', 'public, s-maxage=2592000, stale-while-revalidate=604800');
    return response;
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}
