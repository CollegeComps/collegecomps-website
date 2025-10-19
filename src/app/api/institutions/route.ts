import { NextRequest, NextResponse } from 'next/server';
import { CollegeDataService } from '@/lib/database';
import { 
  getZipCodeCoordinates, 
  filterByProximity, 
  normalizeZipCode 
} from '@/lib/geo-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const zipCode = searchParams.get('zipCode');
    const proximityZip = searchParams.get('proximityZip'); // New: zip code for proximity search
    const radiusMiles = parseInt(searchParams.get('radiusMiles') || '50'); // Default 50 mile radius
    const control = searchParams.get('control');
    const maxTuition = searchParams.get('maxTuition');
    const minEarnings = searchParams.get('minEarnings');
    const sortBy = searchParams.get('sortBy') || 'name';
    const unitid = searchParams.get('unitid');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const collegeService = new CollegeDataService();
    
    let institutions;
    
    // Handle single institution lookup by unitid
    if (unitid) {
      const singleInst = await collegeService.getInstitutionByUnitid(parseInt(unitid));
      institutions = singleInst ? [singleInst] : [];
    } else if (search || state || city || zipCode || control || maxTuition || minEarnings || sortBy !== 'name') {
      // Use search with filters
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

    // Apply proximity filter if proximityZip is provided
    if (proximityZip) {
      const normalizedZip = normalizeZipCode(proximityZip);
      
      if (normalizedZip) {
        const coordinates = await getZipCodeCoordinates(normalizedZip);
        
        if (coordinates) {
          // Filter institutions by proximity
          institutions = filterByProximity(
            institutions,
            coordinates.latitude,
            coordinates.longitude,
            radiusMiles
          );
        } else {
          // If we couldn't get coordinates, return empty array with helpful message
          return NextResponse.json({
            institutions: [],
            page,
            limit,
            hasMore: false,
            error: `Unable to find coordinates for zip code ${proximityZip}. Please try a different zip code.`
          });
        }
      } else {
        return NextResponse.json({
          institutions: [],
          page,
          limit,
          hasMore: false,
          error: 'Invalid zip code format. Please provide a 5-digit US zip code.'
        });
      }
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