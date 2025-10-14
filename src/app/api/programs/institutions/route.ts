import { NextRequest, NextResponse } from 'next/server';
import { getCollegeDb } from '@/lib/db-helper';
import { getStatesInClause } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cipcode = searchParams.get('cipcode');

    if (!cipcode) {
      return NextResponse.json(
        { error: 'CIP code is required' },
        { status: 400 }
      );
    }

    const db = getCollegeDb();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 500 }
      );
    }

    const { clause: statesClause, params: stateParams } = getStatesInClause();
    
    // Get all institutions offering this program
    const institutions = await db.prepare(`
      SELECT DISTINCT
        i.unitid,
        i.name,
        i.city,
        i.state,
        i.control_public_private,
        ap.cip_title,
        ap.total_completions,
        ap.credential_name
      FROM institutions i
      INNER JOIN academic_programs ap ON i.unitid = ap.unitid
      WHERE ap.cipcode = ?
        AND ${statesClause}
      ORDER BY ap.total_completions DESC
    `).all(cipcode, ...stateParams);

    return NextResponse.json({ 
      institutions: institutions.map((inst: any) => ({
        ...inst,
        control: inst.control_public_private === 1 ? 'Public' : 
                 inst.control_public_private === 2 ? 'Private nonprofit' : 'Private for-profit'
      }))
    });
  } catch (error) {
    console.error('Error fetching institutions by program:', error);
    return NextResponse.json(
      { error: 'Failed to fetch institutions' },
      { status: 500 }
    );
  }
}
