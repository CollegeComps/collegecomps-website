import { NextRequest, NextResponse } from 'next/server';
import { getCollegeDb } from '@/lib/db-helper';

/**
 * GET /api/occupation-salary?cipcode=52.0801
 * Returns occupation salary data for a given CIP code by joining
 * cip_to_soc_mapping → occupation_salary_data (BLS OES).
 *
 * Optional query params:
 *   cipcode  – 6-digit CIP code (e.g. "52.0801")
 *   cip2     – 2-digit CIP family (e.g. "52") to get all occupations for a field
 *   limit    – max results (default 20)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cipcode = searchParams.get('cipcode');
    const cip2 = searchParams.get('cip2');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    if (!cipcode && !cip2) {
      return NextResponse.json(
        { error: 'Either cipcode or cip2 parameter is required' },
        { status: 400 }
      );
    }

    const db = getCollegeDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    try {
      let occupations;

      if (cipcode) {
        // Exact CIP code → related occupations with salary data
        occupations = await db.prepare(`
          SELECT
            csm.soc_code,
            csm.soc_title,
            osd.occupation_title,
            osd.median_annual_wage,
            osd.wage_25th_percentile,
            osd.wage_75th_percentile,
            osd.total_employment,
            osd.major_category,
            csm.relevance_score
          FROM cip_to_soc_mapping csm
          LEFT JOIN occupation_salary_data osd ON csm.soc_code = osd.soc_code
          WHERE csm.cip_code = ?
          ORDER BY csm.relevance_score DESC, osd.median_annual_wage DESC
          LIMIT ?
        `).all(cipcode, limit);
      } else {
        // 2-digit CIP family → aggregated salary data across all related occupations
        occupations = await db.prepare(`
          SELECT
            csm.soc_code,
            COALESCE(osd.occupation_title, csm.soc_title) as occupation_title,
            osd.median_annual_wage,
            osd.wage_25th_percentile,
            osd.wage_75th_percentile,
            osd.total_employment,
            osd.major_category,
            MAX(csm.relevance_score) as relevance_score,
            COUNT(DISTINCT csm.cip_code) as related_programs
          FROM cip_to_soc_mapping csm
          LEFT JOIN occupation_salary_data osd ON csm.soc_code = osd.soc_code
          WHERE csm.cip_code LIKE ? || '.%'
          GROUP BY csm.soc_code
          ORDER BY osd.median_annual_wage DESC
          LIMIT ?
        `).all(cip2, limit);
      }

      // Compute summary stats
      const withSalary = occupations.filter((o: any) => o.median_annual_wage != null);
      const salaries = withSalary.map((o: any) => o.median_annual_wage);

      const summary = salaries.length > 0 ? {
        count: salaries.length,
        median: salaries.sort((a: number, b: number) => a - b)[Math.floor(salaries.length / 2)],
        min: Math.min(...salaries),
        max: Math.max(...salaries),
        avg: Math.round(salaries.reduce((s: number, v: number) => s + v, 0) / salaries.length),
      } : null;

      return NextResponse.json({
        occupations: occupations.map((o: any) => ({
          soc_code: o.soc_code,
          title: o.occupation_title || o.soc_title || 'Unknown',
          median_annual_wage: o.median_annual_wage,
          wage_25th: o.wage_25th_percentile,
          wage_75th: o.wage_75th_percentile,
          total_employment: o.total_employment,
          major_category: o.major_category,
          relevance_score: o.relevance_score,
          related_programs: o.related_programs,
        })),
        summary,
        query: cipcode ? { cipcode } : { cip2 },
      });
    } catch (queryError) {
      console.error('Occupation salary query error:', queryError);
      return NextResponse.json(
        { error: 'Database query failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in occupation-salary route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
