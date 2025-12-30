import { NextRequest, NextResponse } from 'next/server';
import { getCollegeDb } from '@/lib/db-helper';

export async function GET(request: NextRequest) {
  const db = getCollegeDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const degreeLevel = searchParams.get('degreeLevel'); // 'bachelors' or 'masters'

  if (!query || query.length < 2) {
    return NextResponse.json({ majors: [] });
  }

  try {
    // Map degree level to credential_level values. Extended codes cover IPEDS variants.
    let credentialLevelFilter = '';
    const params = [`%${query}%`];

    if (degreeLevel === 'bachelors') {
      credentialLevelFilter = 'AND credential_level IN (5, 22, 31)';
    } else if (degreeLevel === 'masters') {
      credentialLevelFilter = 'AND credential_level IN (7, 23)';
    }

    const majors = await db
      .prepare(
        `SELECT DISTINCT
          cip_title
        FROM academic_programs
        WHERE cip_title LIKE ? AND cip_title IS NOT NULL AND cip_title != '' ${credentialLevelFilter}
        ORDER BY cip_title
        LIMIT 20`
      )
      .all(...params) as { cip_title: string }[];

    return NextResponse.json({ majors: majors.map(m => m.cip_title) });
  } catch (error) {
    console.error('Major search error:', error);
    return NextResponse.json({ error: 'Failed to search majors' }, { status: 500 });
  }
}
