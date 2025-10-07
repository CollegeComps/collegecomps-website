import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '..', 'college-scrapper', 'data', 'college_data.db');

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ institutions: [] });
  }

  try {
    const db = new Database(dbPath, { readonly: true });

    const institutions = db
      .prepare(
        `SELECT DISTINCT
          name
        FROM institutions
        WHERE name LIKE ?
        ORDER BY name
        LIMIT 15`
      )
      .all(`%${query}%`) as { name: string }[];

    db.close();

    return NextResponse.json({ institutions: institutions.map(i => i.name) });
  } catch (error) {
    console.error('Institution search error:', error);
    return NextResponse.json({ error: 'Failed to search institutions' }, { status: 500 });
  }
}
