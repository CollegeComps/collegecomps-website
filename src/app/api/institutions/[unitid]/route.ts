import { NextRequest, NextResponse } from 'next/server';
import { CollegeDataService } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ unitid: string }> }
) {
  try {
    const { unitid } = await params;
    const unitidNum = parseInt(unitid);
    
    if (isNaN(unitidNum)) {
      return NextResponse.json(
        { error: 'Invalid institution ID' },
        { status: 400 }
      );
    }

    const collegeService = new CollegeDataService();
    const details = collegeService.getInstitutionDetails(unitidNum);
    
    if (!details) {
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(details);
  } catch (error) {
    console.error('Error fetching institution details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch institution details' },
      { status: 500 }
    );
  }
}