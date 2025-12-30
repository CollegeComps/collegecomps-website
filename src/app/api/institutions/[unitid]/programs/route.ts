import { NextRequest, NextResponse } from 'next/server';
import { CollegeDataService } from '@/lib/database';

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

    const collegeService = new CollegeDataService();
    const allowedLevels = new Set(['', 'associates', 'bachelors', 'masters', 'doctorate', 'certificate']);
    const normalizedLevel = degreeLevel && allowedLevels.has(degreeLevel) ? (degreeLevel as any) : undefined;
    const programs = await collegeService.getInstitutionPrograms(unitidNum, normalizedLevel);
    
    return NextResponse.json({ programs });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}