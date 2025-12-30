import { NextRequest, NextResponse } from 'next/server';
import { CollegeDataService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const unitid = searchParams.get('unitid');
    const degreeLevel = searchParams.get('degreeLevel'); // '', 'associates' | 'bachelors' | 'masters' | 'doctorate' | 'certificate'
    
    if (!unitid) {
      return NextResponse.json({ error: 'unitid is required' }, { status: 400 });
    }

    const unitidNum = parseInt(unitid);
    if (isNaN(unitidNum)) {
      return NextResponse.json({ error: 'unitid must be a valid number' }, { status: 400 });
    }

    const db = new CollegeDataService();
    const allowedLevels = new Set(['', 'associates', 'bachelors', 'masters', 'doctorate', 'certificate']);
    const normalizedLevel = degreeLevel && allowedLevels.has(degreeLevel) ? (degreeLevel as any) : undefined;
    const programs = await db.getInstitutionPrograms(unitidNum, normalizedLevel);

    return NextResponse.json({
      programs,
      count: programs.length,
      unitid: unitidNum
    });

  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}