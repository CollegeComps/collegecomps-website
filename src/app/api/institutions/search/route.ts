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
    return NextResponse.json({ institutions: [] });
  }

  try {
    const institutions = await db
      .prepare(
        `SELECT DISTINCT
          name
        FROM institutions
        WHERE name LIKE ?
        ORDER BY name
        LIMIT 15`
      )
      .all(`%${query}%`) as { name: string }[];

    return NextResponse.json({ institutions: institutions.map(i => i.name) });
  } catch (error) {
    console.error('Institution search error:', error);
    return NextResponse.json({ error: 'Failed to search institutions' }, { status: 500 });
  }
}
