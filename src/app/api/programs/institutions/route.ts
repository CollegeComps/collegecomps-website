import { NextRequest, NextResponse } from 'next/server';
import { getCollegeDb } from '@/lib/db-helper';


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cipcode = searchParams.get('cipcode');
    const degreeLevel = searchParams.get('degreeLevel'); // 'bachelors' or 'masters'

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

    try {
      // Map degree level to canonical credential_level values (IPEDS + extended codes)
      let credentialLevelFilter = '';
      // Urban Institute / IPEDS data uses non-standard award_level codes:
      //   4 = Associate's, 7 = Bachelor's, 9 = Master's/Graduate,
      //   22 = Extended Bachelor's, 23 = Extended Master's
      if (degreeLevel === 'associates') {
        credentialLevelFilter = 'AND ap.credential_level IN (4)';
      } else if (degreeLevel === 'bachelors') {
        credentialLevelFilter = 'AND ap.credential_level IN (7, 22)';
      } else if (degreeLevel === 'masters') {
        credentialLevelFilter = 'AND ap.credential_level IN (9, 23)';
      } else if (degreeLevel === 'doctorate') {
        credentialLevelFilter = 'AND ap.credential_level IN (9, 17, 18, 19)';
      } else if (degreeLevel === 'certificate') {
        credentialLevelFilter = 'AND ap.credential_level IN (8, 24, 30, 31, 32, 33)';
      }

      // Get all institutions offering this program
      // Group by unitid to avoid duplicates from multiple years/gender breakdowns in IPEDS data
      const institutions = await db.prepare(`
        SELECT
          i.unitid,
          i.name,
          i.city,
          i.state,
          i.control_public_private,
          MAX(ap.cip_title) as cip_title,
          SUM(ap.completions) as total_completions,
          COALESCE(MAX(ap.credential_level), 0) as credential_level
        FROM institutions i
        INNER JOIN academic_programs ap ON i.unitid = ap.unitid
        WHERE ap.cipcode = ?
          AND i.state IS NOT NULL
          AND i.state != ''
          ${credentialLevelFilter}
        GROUP BY i.unitid, i.name, i.city, i.state, i.control_public_private
        ORDER BY total_completions DESC NULLS LAST
        LIMIT 500
      `).all(cipcode);


      // Map credential levels to human-readable names (Urban Institute coding)
      const credentialNames: { [key: number]: string } = {
        4:  "Associate's degree",
        7:  "Bachelor's degree",
        8:  'Post-baccalaureate certificate',
        9:  "Master's degree",
        22: "Bachelor's degree (extended, 5-yr program)",
        23: "Master's degree (extended)",
        24: "Doctoral degree",
        30: 'Occupational award (less than 1 year)',
        31: 'Occupational award (1 to less than 4 years)',
        32: 'Occupational certificate',
        33: 'Postbaccalaureate occupational certificate',
      };

      return NextResponse.json({ 
        institutions: institutions.map((inst: any) => ({
          ...inst,
          control: inst.control_public_private === 1 ? 'Public' : 
                   inst.control_public_private === 2 ? 'Private nonprofit' : 'Private for-profit',
          credential_name: credentialNames[inst.credential_level] || 'Unknown'
        }))
      });
    } catch (queryError) {
      console.error('Database query error:', queryError);
      return NextResponse.json(
        { error: 'Database query failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching institutions by program:', error);
    return NextResponse.json(
      { error: 'Failed to fetch institutions' },
      { status: 500 }
    );
  }
}
