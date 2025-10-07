import { NextRequest, NextResponse } from 'next/server';
import { CollegeDataService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unitid = searchParams.get('unitid');
    
    if (!unitid) {
      return NextResponse.json({ error: 'unitid parameter required' }, { status: 400 });
    }
    
    const collegeService = new CollegeDataService();
    const institution = collegeService.getInstitutionByUnitid(parseInt(unitid));
    
    return NextResponse.json({
      unitid: parseInt(unitid),
      found: !!institution,
      institution,
      debug: 'Test endpoint working'
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Failed to test institution lookup', details: error },
      { status: 500 }
    );
  }
}