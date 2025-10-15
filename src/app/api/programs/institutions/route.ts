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

    try {
      // Get all institutions offering this program
      // Using only guaranteed columns from academic_programs table
      const institutions = await db.prepare(`
        SELECT DISTINCT
          i.unitid,
          i.name,
          i.city,
          i.state,
          i.control_public_private,
          ap.cip_title,
          ap.completions as total_completions,
          COALESCE(ap.credential_level, 0) as credential_level
        FROM institutions i
        INNER JOIN academic_programs ap ON i.unitid = ap.unitid
        WHERE ap.cipcode = ?
          AND i.state IS NOT NULL
          AND i.state != ''
        ORDER BY ap.completions DESC NULLS LAST
        LIMIT 500
      `).all(cipcode);

      console.log(`Found ${institutions.length} institutions for CIP code ${cipcode}`);

      // Map credential levels to names
      const credentialNames: { [key: number]: string } = {
        1: 'Award of less than 1 academic year',
        2: 'Award of at least 1 but less than 2 academic years',
        3: 'Associate\'s degree',
        4: 'Award of at least 2 but less than 4 academic years',
        5: 'Bachelor\'s degree',
        6: 'Postbaccalaureate certificate',
        7: 'Master\'s degree',
        8: 'Post-master\'s certificate',
        9: 'Doctor\'s degree'
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
        { error: 'Database query failed', details: String(queryError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching institutions by program:', error);
    return NextResponse.json(
      { error: 'Failed to fetch institutions', details: String(error) },
      { status: 500 }
    );
  }
}
