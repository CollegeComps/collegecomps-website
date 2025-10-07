import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '..', 'college-scrapper', 'data', 'college_data.db');

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ colleges: [] });
  }

  try {
    const db = new Database(dbPath, { readonly: true });

    const colleges = db
      .prepare(
        `SELECT 
          i.id,
          i.unitid,
          i.name,
          i.state,
          i.city,
          CASE 
            WHEN i.control_public_private = 1 THEN 'Public'
            WHEN i.control_public_private = 2 THEN 'Private nonprofit'
            WHEN i.control_public_private = 3 THEN 'Private for-profit'
            ELSE 'Unknown'
          END as control,
          f.tuition_in_state,
          f.tuition_out_state,
          f.net_price as avg_net_price,
          CASE 
            WHEN a.applicants_total > 0 
            THEN CAST(a.admissions_total AS REAL) / a.applicants_total
            ELSE NULL
          END as admission_rate,
          CAST((a.sat_math_75th + a.sat_verbal_75th) / 2 AS INTEGER) as sat_avg,
          CAST((a.act_composite_25th + a.act_composite_75th) / 2 AS INTEGER) as act_median,
          e.earnings_6_years_after_entry as median_earnings_6yr,
          e.earnings_10_years_after_entry as median_earnings_10yr
        FROM institutions i
        LEFT JOIN financial_data f ON i.unitid = f.unitid AND f.year = (SELECT MAX(year) FROM financial_data WHERE unitid = i.unitid)
        LEFT JOIN admissions_data a ON i.unitid = a.unitid AND a.year = (SELECT MAX(year) FROM admissions_data WHERE unitid = i.unitid)
        LEFT JOIN earnings_outcomes e ON i.unitid = e.unitid
        WHERE i.name LIKE ? OR i.city LIKE ? OR i.state LIKE ?
        ORDER BY i.name
        LIMIT 20`
      )
      .all(`%${query}%`, `%${query}%`, `%${query}%`);

    db.close();

    return NextResponse.json({ colleges });
  } catch (error) {
    console.error('College search error:', error);
    return NextResponse.json({ error: 'Failed to search colleges' }, { status: 500 });
  }
}
