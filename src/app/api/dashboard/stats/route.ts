import { NextRequest, NextResponse } from 'next/server';
import { rateLimitByIP } from '@/lib/rate-limit';
import { getDatabase } from '@/lib/database';

// Cache dashboard stats for 1 hour. This data changes at most yearly
// (IPEDS release cadence) so aggressive caching is safe.
export const revalidate = 3600;

// In-memory cache — survives warm invocations on the same Vercel instance.
let cachedPayload: { data: unknown; expires: number } | null = null;
const CACHE_TTL_MS = 3600 * 1000; // 1 hour

export async function GET(request: NextRequest) {
  const limited = rateLimitByIP(request, 'dashboard', { limit: 5, windowSeconds: 60 });
  if (limited) return limited;

  // Serve from in-memory cache if fresh
  if (cachedPayload && cachedPayload.expires > Date.now()) {
    return NextResponse.json(cachedPayload.data, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
    });
  }

  try {
    const db = getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // Build a single CTE of latest-year financial data and reuse it across every
    // aggregation. This reduces financial_data scans from 7 full-table scans
    // (one per query, unfiltered) to ONE filtered pass.
    const LATEST_FINANCIAL_CTE = `
      WITH latest_financial AS (
        SELECT f.unitid, f.tuition_in_state, f.tuition_out_state, f.fees,
               f.room_board_on_campus, f.net_price
        FROM financial_data f
        INNER JOIN (
          SELECT unitid, MAX(year) AS max_year
          FROM financial_data
          GROUP BY unitid
        ) latest ON f.unitid = latest.unitid AND f.year = latest.max_year
      )
    `;

    const [
      overallStats,
      byControlType,
      topStates,
      costDistribution,
      roomBoardDistribution,
      totalCostLeaders,
      affordablePublic,
    ] = await Promise.all([
      db.prepare(`${LATEST_FINANCIAL_CTE}
        SELECT
          COUNT(DISTINCT i.unitid) as total_institutions,
          AVG(f.tuition_in_state) as avg_in_state_tuition,
          AVG(f.tuition_out_state) as avg_out_state_tuition,
          AVG(f.room_board_on_campus) as avg_room_board
        FROM institutions i
        LEFT JOIN latest_financial f ON i.unitid = f.unitid
      `).get(),

      db.prepare(`${LATEST_FINANCIAL_CTE}
        SELECT
          i.control_public_private,
          COUNT(*) as count,
          AVG(f.tuition_in_state) as avg_tuition,
          AVG(f.room_board_on_campus) as avg_room_board
        FROM institutions i
        LEFT JOIN latest_financial f ON i.unitid = f.unitid
        WHERE i.control_public_private IS NOT NULL AND i.control_public_private > 0
        GROUP BY i.control_public_private
      `).all(),

      db.prepare(`${LATEST_FINANCIAL_CTE}
        SELECT
          i.state,
          COUNT(DISTINCT i.unitid) as num_institutions,
          AVG(f.tuition_in_state) as avg_tuition,
          AVG(f.room_board_on_campus) as avg_room_board
        FROM institutions i
        LEFT JOIN latest_financial f ON i.unitid = f.unitid
        WHERE i.state IS NOT NULL
        GROUP BY i.state
        ORDER BY num_institutions DESC
        LIMIT 15
      `).all(),

      db.prepare(`${LATEST_FINANCIAL_CTE}
        SELECT
          CASE
            WHEN f.tuition_in_state < 5000 THEN '< $5K'
            WHEN f.tuition_in_state < 10000 THEN '$5K-$10K'
            WHEN f.tuition_in_state < 20000 THEN '$10K-$20K'
            WHEN f.tuition_in_state < 30000 THEN '$20K-$30K'
            WHEN f.tuition_in_state < 40000 THEN '$30K-$40K'
            ELSE '$40K+'
          END as cost_range,
          COUNT(*) as count
        FROM latest_financial f
        WHERE f.tuition_in_state > 0
        GROUP BY cost_range
        ORDER BY
          CASE cost_range
            WHEN '< $5K' THEN 1
            WHEN '$5K-$10K' THEN 2
            WHEN '$10K-$20K' THEN 3
            WHEN '$20K-$30K' THEN 4
            WHEN '$30K-$40K' THEN 5
            ELSE 6
          END
      `).all(),

      db.prepare(`${LATEST_FINANCIAL_CTE}
        SELECT
          CASE
            WHEN f.room_board_on_campus < 5000 THEN '< $5K'
            WHEN f.room_board_on_campus < 8000 THEN '$5K-$8K'
            WHEN f.room_board_on_campus < 10000 THEN '$8K-$10K'
            WHEN f.room_board_on_campus < 12000 THEN '$10K-$12K'
            WHEN f.room_board_on_campus < 15000 THEN '$12K-$15K'
            ELSE '$15K+'
          END as price_range,
          COUNT(*) as count
        FROM latest_financial f
        WHERE f.room_board_on_campus > 0
        GROUP BY price_range
        ORDER BY
          CASE price_range
            WHEN '< $5K' THEN 1
            WHEN '$5K-$8K' THEN 2
            WHEN '$8K-$10K' THEN 3
            WHEN '$10K-$12K' THEN 4
            WHEN '$12K-$15K' THEN 5
            ELSE 6
          END
      `).all(),

      db.prepare(`${LATEST_FINANCIAL_CTE}
        SELECT
          i.name,
          i.state,
          i.control_public_private,
          f.tuition_in_state,
          f.room_board_on_campus,
          f.tuition_in_state + COALESCE(f.room_board_on_campus, 0) as total_cost
        FROM institutions i
        JOIN latest_financial f ON i.unitid = f.unitid
        WHERE f.tuition_in_state > 0
        ORDER BY total_cost DESC
        LIMIT 20
      `).all(),

      db.prepare(`${LATEST_FINANCIAL_CTE}
        SELECT
          i.name,
          i.state,
          f.tuition_in_state,
          f.fees,
          f.room_board_on_campus,
          f.net_price
        FROM institutions i
        JOIN latest_financial f ON i.unitid = f.unitid
        WHERE i.control_public_private = 1
          AND f.tuition_in_state > 0
          AND f.tuition_in_state < 20000
        ORDER BY f.tuition_in_state ASC
        LIMIT 20
      `).all(),
    ]);

    const payload = {
      overallStats,
      byControlType,
      topStates,
      costDistribution,
      roomBoardDistribution,
      totalCostLeaders,
      affordablePublic,
      success: true,
    };

    cachedPayload = { data: payload, expires: Date.now() + CACHE_TTL_MS };

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}
