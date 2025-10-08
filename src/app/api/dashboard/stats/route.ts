import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET() {
  try {
    const db = getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }
    
    // Overall statistics - using available data
    const overallStats = await db.prepare(`
      SELECT 
        COUNT(DISTINCT i.unitid) as total_institutions,
        AVG(f.tuition_in_state) as avg_in_state_tuition,
        AVG(f.tuition_out_state) as avg_out_state_tuition,
        AVG(f.room_board_on_campus) as avg_room_board
      FROM institutions i
      LEFT JOIN financial_data f ON i.unitid = f.unitid
    `).get();

    // Institutions by control type
    const byControlType = await db.prepare(`
      SELECT 
        i.control_public_private,
        COUNT(*) as count,
        AVG(f.tuition_in_state) as avg_tuition,
        AVG(f.room_board_on_campus) as avg_room_board
      FROM institutions i
      LEFT JOIN financial_data f ON i.unitid = f.unitid
      WHERE i.control_public_private IS NOT NULL AND i.control_public_private > 0
      GROUP BY i.control_public_private
    `).all();

    // Top states by number of institutions
    const topStates = await db.prepare(`
      SELECT 
        i.state,
        COUNT(DISTINCT i.unitid) as num_institutions,
        AVG(f.tuition_in_state) as avg_tuition,
        AVG(f.room_board_on_campus) as avg_room_board
      FROM institutions i
      LEFT JOIN financial_data f ON i.unitid = f.unitid
      WHERE i.state IS NOT NULL
      GROUP BY i.state
      ORDER BY num_institutions DESC
      LIMIT 15
    `).all();

    // Cost distribution (buckets)
    const costDistribution = await db.prepare(`
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
      FROM financial_data f
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
    `).all();

    // Room & Board distribution
    const roomBoardDistribution = await db.prepare(`
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
      FROM financial_data f
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
    `).all();

    // Total cost leaders (tuition + room & board)
    const totalCostLeaders = await db.prepare(`
      SELECT 
        i.name,
        i.state,
        i.control_public_private,
        f.tuition_in_state,
        f.room_board_on_campus,
        f.tuition_in_state + COALESCE(f.room_board_on_campus, 0) as total_cost
      FROM institutions i
      JOIN financial_data f ON i.unitid = f.unitid
      WHERE f.tuition_in_state > 0
      ORDER BY total_cost DESC
      LIMIT 20
    `).all();

    // Most affordable public institutions
    const affordablePublic = await db.prepare(`
      SELECT 
        i.name,
        i.state,
        f.tuition_in_state,
        f.fees,
        f.room_board_on_campus,
        f.net_price
      FROM institutions i
      JOIN financial_data f ON i.unitid = f.unitid
      WHERE i.control_public_private = 1
        AND f.tuition_in_state > 0
        AND f.tuition_in_state < 20000
      ORDER BY f.tuition_in_state ASC
      LIMIT 20
    `).all();

    return NextResponse.json({
      overallStats,
      byControlType,
      topStates,
      costDistribution,
      roomBoardDistribution,
      totalCostLeaders,
      affordablePublic,
      success: true
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 });
  }
}
