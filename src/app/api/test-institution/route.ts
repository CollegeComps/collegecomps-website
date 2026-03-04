import { NextRequest, NextResponse } from 'next/server';
import { CollegeDataService } from '@/lib/database';

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const unitid = searchParams.get('unitid');

    if (!unitid) {
      return NextResponse.json({ error: 'unitid parameter required' }, { status: 400 });
    }

    const collegeService = new CollegeDataService();
    const institution = await collegeService.getInstitutionByUnitid(parseInt(unitid));

    return NextResponse.json({
      unitid: parseInt(unitid),
      found: !!institution,
      institution,
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}