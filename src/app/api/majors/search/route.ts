import { NextRequest, NextResponse } from 'next/server';
import { rateLimitByIP } from '@/lib/rate-limit';
import { getCollegeDb } from '@/lib/db-helper';
import { cached } from '@/lib/api-cache';

export const revalidate = 2592000;

export async function GET(request: NextRequest) {
  const limited = rateLimitByIP(request, 'major-search', { limit: 20, windowSeconds: 60 });
  if (limited) return limited;

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
    // Map degree level to canonical credential_level values (IPEDS + extended codes).
    let credentialLevelFilter = '';
    const params = [`%${query}%`];

    // Urban Institute / IPEDS data uses non-standard award_level codes:
    //   4 = Associate's, 7 = Bachelor's, 9 = Master's/Graduate,
    //   22 = Extended Bachelor's, 23 = Extended Master's
    if (degreeLevel === 'associates') {
      credentialLevelFilter = 'AND credential_level IN (4)';
    } else if (degreeLevel === 'bachelors') {
      credentialLevelFilter = 'AND credential_level IN (7, 22)';
    } else if (degreeLevel === 'masters') {
      credentialLevelFilter = 'AND credential_level IN (9, 23)';
    } else if (degreeLevel === 'doctorate') {
      credentialLevelFilter = 'AND credential_level IN (9, 17, 18, 19)';
    } else if (degreeLevel === 'certificate') {
      credentialLevelFilter = 'AND credential_level IN (8, 24, 30, 31, 32, 33)';
    }

    const names = await cached(
      `major-search:${query.toLowerCase()}:${degreeLevel || 'all'}`,
      2592000,
      async () => {
        const rows = await db
          .prepare(
            `SELECT DISTINCT
              cip_title
            FROM academic_programs
            WHERE cip_title LIKE ? AND cip_title IS NOT NULL AND cip_title != '' ${credentialLevelFilter}
            ORDER BY cip_title
            LIMIT 20`
          )
          .all(...params) as { cip_title: string }[];
        return rows.map((m) => m.cip_title);
      }
    );

    const response = NextResponse.json({ majors: names });
    response.headers.set('Cache-Control', 'public, s-maxage=2592000, stale-while-revalidate=604800');
    return response;
  } catch (error) {
    console.error('Major search error:', error);
    return NextResponse.json({ error: 'Failed to search majors' }, { status: 500 });
  }
}
