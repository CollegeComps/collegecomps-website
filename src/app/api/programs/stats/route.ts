import { NextRequest, NextResponse } from 'next/server';
import { rateLimitByIP } from '@/lib/rate-limit';
import { getDatabase } from '@/lib/database';
import { getCached, setCached } from '@/lib/api-cache';

export const revalidate = 2592000;

export async function GET(request: NextRequest) {
  const limited = rateLimitByIP(request, 'prog-stats', { limit: 10, windowSeconds: 60 });
  if (limited) return limited;

  // Serve from cache if available — this query is very expensive
  const cacheKey = `prog-stats:${request.url}`;
  const cachedResponse = getCached<unknown>(cacheKey);
  if (cachedResponse) {
    return NextResponse.json(cachedResponse, {
      headers: { 'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=604800' },
    });
  }

  try {
    const db = getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }
    
    // Use academic_programs directly to avoid:
    // 1. programs_safe_view INNER JOIN exclusions (missing institution_metadata rows)
    // 2. Year-duplicate inflation (programs appear once per year in the view)
    // We pick each program's peak year count per (unitid, cipcode, credential_level).
    const dedupeBase = `
      WITH peak AS (
        SELECT cipcode, cip_title, unitid,
               SUM(completions) as year_completions
        FROM academic_programs
        WHERE completions > 0 AND cipcode IS NOT NULL AND cipcode != '00.0099'
              AND cip_title IS NOT NULL
        GROUP BY unitid, cipcode, credential_level, year
      ),
      best AS (
        SELECT cipcode, cip_title, unitid, MAX(year_completions) as peak_completions
        FROM peak
        GROUP BY unitid, cipcode
      )
    `;

    // Get top programs by total graduates
    const topPrograms = await db.prepare(`
      ${dedupeBase}
      SELECT
        cipcode,
        MAX(cip_title) as cip_title,
        SUM(peak_completions) as total_graduates,
        COUNT(DISTINCT unitid) as num_institutions
      FROM best
      GROUP BY cipcode
      ORDER BY total_graduates DESC
      LIMIT 20
    `).all();

    // Get program categories (2-digit CIP codes)
    const categories = await db.prepare(`
      ${dedupeBase}
      SELECT
        SUBSTR(cipcode, 1, 2) as category_code,
        COUNT(DISTINCT cipcode) as num_programs,
        SUM(peak_completions) as total_graduates,
        COUNT(DISTINCT unitid) as num_institutions
      FROM best
      GROUP BY category_code
      ORDER BY total_graduates DESC
      LIMIT 15
    `).all();

    // Get overall statistics
    const stats = await db.prepare(`
      ${dedupeBase}
      SELECT
        COUNT(DISTINCT cipcode) as unique_programs,
        COUNT(DISTINCT unitid) as institutions_offering_programs,
        SUM(peak_completions) as total_graduates
      FROM best
    `).get();

    const payload = {
      topPrograms,
      categories,
      stats,
      success: true
    };
    setCached(cacheKey, payload, 2592000);
    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=604800' },
    });

  } catch (error) {
    console.error('Error fetching program stats:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 });
  }
}
