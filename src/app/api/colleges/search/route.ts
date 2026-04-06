import { NextRequest, NextResponse } from 'next/server';
import { rateLimitByIP } from '@/lib/rate-limit';
import { CollegeDataService } from '@/lib/database';

export async function GET(request: NextRequest) {
  const limited = rateLimitByIP(request, 'college-search', { limit: 20, windowSeconds: 60 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const degreeLevel = searchParams.get('degreeLevel'); // 'associates' | 'bachelors' | 'masters' | 'doctorate' | 'certificate'

  if (!query || query.length < 2) {
    return NextResponse.json({ colleges: [] });
  }

  try {
    const collegeService = new CollegeDataService();
    
    // Use the searchInstitutions method with name parameter and optional degree filter
    const institutions = await collegeService.searchInstitutions({
      name: query,
      degreeLevel: (['associates', 'bachelors', 'masters', 'doctorate', 'certificate'].includes(degreeLevel || '')) ? (degreeLevel as any) : undefined
    });

    // Map to the format expected by the frontend
    const colleges = institutions.slice(0, 20).map((inst) => ({
      id: inst.id,
      unitid: inst.unitid,
      name: inst.name,
      state: inst.state,
      city: inst.city,
      control: inst.control_of_institution === 1 ? 'Public' : 
               inst.control_of_institution === 2 ? 'Private nonprofit' : 'Private for-profit',
      tuition_in_state: inst.tuition_in_state,
      tuition_out_state: inst.tuition_out_state,
      avg_net_price: inst.net_price,
      admission_rate: inst.acceptance_rate || null,
      sat_avg: inst.average_sat || null,
      act_median: inst.average_act || null,
      median_earnings_6yr: inst.earnings_6_years_after_entry || inst.mean_earnings_6_years,
      median_earnings_10yr: inst.mean_earnings_10_years || null
    }));

    return NextResponse.json({ colleges });
  } catch (error) {
    console.error('College search error:', error);
    return NextResponse.json({ error: 'Failed to search colleges' }, { status: 500 });
  }
}
