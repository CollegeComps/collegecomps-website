import { NextRequest, NextResponse } from 'next/server';
import { CollegeDataService } from '@/lib/database';
import { 
  getZipCodeCoordinates, 
  filterByProximity, 
  normalizeZipCode 
} from '@/lib/geo-utils';
import { MajorCategory } from '@/lib/cip-category-mapping';
import { 
  calculateEFC, 
  assessAffordability, 
  getInstitutionType,
  type FinancialProfile 
} from '@/lib/financial-calculator';

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
    const majorCategory = searchParams.get('majorCategory') as MajorCategory | null; // ENG-25: Major category filter
    const sortBy = searchParams.get('sortBy') || 'implied_roi'; // Default to ROI sorting (ENG-18)
    const unitid = searchParams.get('unitid');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // ENG-29: Financial affordability filtering
    const studentIncome = searchParams.get('studentIncome');
    const parentIncome = searchParams.get('parentIncome');
    const parentAssets = searchParams.get('parentAssets');
    const maxCostMultiplier = parseFloat(searchParams.get('maxCostMultiplier') || '1.5'); // Allow up to 150% of EFC

    const collegeService = new CollegeDataService();
    
    let institutions;
    
    // If proximity filtering, get more results before filtering (pagination will be applied after)
    const effectiveLimit = proximityZip ? 1000 : limit; // Get up to 1000 for proximity, then filter
    const effectiveOffset = proximityZip ? 0 : (page - 1) * limit;
    
    // Handle single institution lookup by unitid
    if (unitid) {
      const singleInst = await collegeService.getInstitutionByUnitid(parseInt(unitid));
      institutions = singleInst ? [singleInst] : [];
    } else if (search || state || city || zipCode || control || maxTuition || minEarnings || majorCategory || sortBy !== 'implied_roi') {
      // Use search with filters (or if non-default sort is specified)
      institutions = await collegeService.searchInstitutions({
        name: search || undefined,
        state: state || undefined,
        city: city || undefined,
        zipCode: zipCode || undefined,
        control: control ? parseInt(control) : undefined,
        maxTuition: maxTuition ? parseFloat(maxTuition) : undefined,
        minEarnings: minEarnings ? parseFloat(minEarnings) : undefined,
        majorCategory: majorCategory || undefined,
        sortBy: sortBy
      });
    } else {
      // Get all institutions with pagination
      institutions = await collegeService.getInstitutions(effectiveLimit, effectiveOffset, search || undefined, sortBy);
    }

    // ENG-29: Apply financial affordability filtering if financial data provided
    if (studentIncome || parentIncome || parentAssets) {
      const financialProfile: FinancialProfile = {
        studentIncome: parseFloat(studentIncome || '0'),
        studentAssets: 0, // Can be added to questionnaire later
        parentIncome: parseFloat(parentIncome || '0'),
        parentAssets: parseFloat(parentAssets || '0'),
        numberOfParents: 2, // Default assumption
        numberOfDependents: 2, // Default assumption
        numberOfInCollege: 1, // Default assumption
      };
      
      const efcCalc = calculateEFC(financialProfile);
      const efc = efcCalc.totalEFC;
      const maxAffordableCost = efc * maxCostMultiplier;
      
      // Filter institutions by affordability
      institutions = institutions.filter(inst => {
        const cost = (inst.tuition_in_state || inst.tuition_out_state || 0) + 
                    (inst.room_board_on_campus || 0);
        return cost <= maxAffordableCost || cost === 0; // Include institutions with no cost data
      });
      
      // Add affordability metadata to each institution
      institutions = institutions.map(inst => {
        const cost = (inst.tuition_in_state || inst.tuition_out_state || 0) + 
                    (inst.room_board_on_campus || 0);
        const instType = getInstitutionType(inst.control_public_private);
        const affordability = assessAffordability(efc, cost, instType);
        
        return {
          ...inst,
          affordability: {
            tier: affordability.affordabilityTier,
            estimatedCost: cost,
            estimatedEFC: efc,
            estimatedNetPrice: affordability.estimatedNetPrice,
            gapAmount: affordability.gapAmount,
          }
        };
      });
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
          
          // Apply pagination after proximity filtering
          const startIdx = (page - 1) * limit;
          const endIdx = startIdx + limit;
          const hasMore = institutions.length > endIdx;
          institutions = institutions.slice(startIdx, endIdx);
          
          return NextResponse.json({
            institutions,
            page,
            limit,
            hasMore
          });
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