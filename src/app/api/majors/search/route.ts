import { NextRequest, NextResponse } from 'next/server';
import { getCollegeDb } from '@/lib/db-helper';

export async function GET(request: NextRequest) {
  const db = getCollegeDb();
  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ majors: [] });
  }

  try {
    const majors = await db
      .prepare(
        `SELECT DISTINCT
          cip_title
        FROM academic_programs
        WHERE cip_title LIKE ? AND cip_title IS NOT NULL AND cip_title != ''
        ORDER BY cip_title
        LIMIT 20`
      )
      .all(`%${query}%`) as { cip_title: string }[];

    return NextResponse.json({ majors: majors.map(m => m.cip_title) });
  } catch (error) {
    console.error('Major search error:', error);
    return NextResponse.json({ error: 'Failed to search majors' }, { status: 500 });
  }
}
