import { NextRequest, NextResponse } from 'next/server';
import { CollegeDataService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const zipCode = searchParams.get('zipCode');
    const control = searchParams.get('control');
    const maxTuition = searchParams.get('maxTuition');
    const minEarnings = searchParams.get('minEarnings');
    const sortBy = searchParams.get('sortBy') || 'implied_roi'; // Default to ROI sorting (ENG-18)
    const unitid = searchParams.get('unitid');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const collegeService = new CollegeDataService();
    
    let institutions;
    
    // Handle single institution lookup by unitid
    if (unitid) {
      const singleInst = await collegeService.getInstitutionByUnitid(parseInt(unitid));
      institutions = singleInst ? [singleInst] : [];
    } else if (search || state || city || zipCode || control || maxTuition || minEarnings || sortBy !== 'implied_roi') {
      // Use search with filters (or if non-default sort is specified)
      institutions = await collegeService.searchInstitutions({
        name: search || undefined,
        state: state || undefined,
        city: city || undefined,
        zipCode: zipCode || undefined,
        control: control ? parseInt(control) : undefined,
        maxTuition: maxTuition ? parseFloat(maxTuition) : undefined,
        minEarnings: minEarnings ? parseFloat(minEarnings) : undefined,
        sortBy: sortBy
      });
    } else {
      // Get all institutions with pagination
      const offset = (page - 1) * limit;
      institutions = await collegeService.getInstitutions(limit, offset, search || undefined, sortBy);
    }

    return NextResponse.json({
      institutions,
      page,
      limit,
      hasMore: institutions.length === limit
    });
  } catch (error) {
    console.error('Error fetching institutions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch institutions' },
      { status: 500 }
    );
  }
}