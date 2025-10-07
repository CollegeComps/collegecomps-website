import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '..', 'college-scrapper', 'data', 'college_data.db');

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ majors: [] });
  }

  try {
    const db = new Database(dbPath, { readonly: true });

    const majors = db
      .prepare(
        `SELECT DISTINCT
          cip_title
        FROM academic_programs
        WHERE cip_title LIKE ? AND cip_title IS NOT NULL AND cip_title != ''
        ORDER BY cip_title
        LIMIT 20`
      )
      .all(`%${query}%`) as { cip_title: string }[];

    db.close();

    return NextResponse.json({ majors: majors.map(m => m.cip_title) });
  } catch (error) {
    console.error('Major search error:', error);
    return NextResponse.json({ error: 'Failed to search majors' }, { status: 500 });
  }
}
