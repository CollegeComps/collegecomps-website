import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET() {
  try {
    const db = getDatabase();
    
    // Get top programs by total graduates
    const topPrograms = db.prepare(`
      SELECT 
        cipcode, 
        cip_title, 
        SUM(total_completions) as total_graduates,
        COUNT(DISTINCT unitid) as num_institutions
      FROM programs_safe_view 
      WHERE total_completions > 0 AND cipcode != '00.0099'
      GROUP BY cipcode, cip_title
      ORDER BY total_graduates DESC 
      LIMIT 20
    `).all();

    // Get program categories (2-digit CIP codes)
    const categories = db.prepare(`
      SELECT 
        SUBSTR(cipcode, 1, 2) as category_code,
        COUNT(DISTINCT cipcode) as num_programs,
        SUM(total_completions) as total_graduates,
        COUNT(DISTINCT unitid) as num_institutions
      FROM programs_safe_view 
      WHERE total_completions > 0 AND cipcode != '00.0099'
      GROUP BY category_code
      ORDER BY total_graduates DESC
      LIMIT 15
    `).all();

    // Get overall statistics
    const stats = db.prepare(`
      SELECT 
        COUNT(DISTINCT cipcode) as unique_programs,
        COUNT(DISTINCT unitid) as institutions_offering_programs,
        SUM(total_completions) as total_graduates
      FROM programs_safe_view 
      WHERE total_completions > 0 AND cipcode != '00.0099'
    `).get();

    return NextResponse.json({
      topPrograms,
      categories,
      stats,
      success: true
    });

  } catch (error) {
    console.error('Error fetching program stats:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 });
  }
}
