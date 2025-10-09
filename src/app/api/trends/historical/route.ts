import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCollegeDb, getUsersDb } from '@/lib/db-helper';

interface TrendData {
  year: number;
  avgSalary: number;
  avgCost: number;
  avgROI: number;
  dataPoints: number;
}

interface CategoryTrend {
  category: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export async function GET(req: NextRequest) {
  const db = getCollegeDb();
  if (!db) {
    console.error('Historical Trends: Database unavailable');
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    console.log('Historical Trends: Starting request');
    const session = await auth();
    
    if (!session?.user) {
      console.log('Historical Trends: No session/user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has Premium or Professional tier
    if (session.user.subscriptionTier === 'free') {
      console.log('Historical Trends: User is free tier');
      return NextResponse.json(
        { error: 'Historical Trends require Advance tier or higher. Upgrade to access trend analysis.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'all';
    const years = parseInt(searchParams.get('years') || '5');
    
    console.log(`Historical Trends: Fetching data for ${years} years, category: ${category}`);

    // Get actual financial data for the latest year
    console.log('Historical Trends: Querying financial data...');
    const actualData = await db.prepare(`
      SELECT 
        f.year,
        AVG(COALESCE(f.tuition_out_state, f.tuition_in_state, 0) + COALESCE(f.fees, 0) + COALESCE(f.room_board_on_campus, 0)) as avg_cost,
        COUNT(DISTINCT f.unitid) as data_points
      FROM financial_data f
      WHERE f.year IS NOT NULL 
        AND (f.tuition_in_state IS NOT NULL OR f.tuition_out_state IS NOT NULL)
      GROUP BY f.year
      ORDER BY f.year DESC
      LIMIT 1
    `).get() as any;
    
    console.log(`Historical Trends: Found actual data for year ${actualData?.year}`);

    // Try to get user-submitted salary data to enhance accuracy
    const usersDb = getUsersDb();
    let userSalaryData: any = null;
    if (usersDb) {
      try {
        userSalaryData = await usersDb.prepare(`
          SELECT 
            AVG(current_salary) as avg_salary,
            COUNT(*) as submission_count,
            AVG(years_since_graduation) as avg_years_out
          FROM salary_submissions
          WHERE is_approved = 1 
            AND current_salary > 0
        `).get();
        
        if (userSalaryData?.submission_count > 0) {
          console.log(`Historical Trends: Using ${userSalaryData.submission_count} user salary submissions to enhance data`);
        }
      } catch (err) {
        console.log('Historical Trends: No user salary data available');
      }
    }

    // Generate historical trends using industry-standard growth rates
    const currentYear = actualData?.year || 2023;
    const currentCost = actualData?.avg_cost || 0;
    const costInflationRate = 0.04; // 4% annual college cost inflation (historical average)
    const salaryGrowthRate = 0.03; // 3% annual salary growth
    
    // Use user-submitted data if available, otherwise use national median
    const baseSalary = userSalaryData?.avg_salary || 60000;
    
    // Generate historical data for requested years
    const trends: TrendData[] = [];
    for (let i = years - 1; i >= 0; i--) {
      const year = currentYear - i;
      const yearDiff = currentYear - year;
      
      // Calculate historical cost (deflate from current)
      const historicalCost = Math.round(currentCost / Math.pow(1 + costInflationRate, yearDiff));
      
      // Calculate historical salary (deflate from base)
      const historicalSalary = Math.round(baseSalary / Math.pow(1 + salaryGrowthRate, yearDiff));
      
      // ROI calculation: 10-year salary earnings - 4-year cost
      const roi = Math.round((historicalSalary * 10) - (historicalCost * 4));
      
      trends.push({
        year: year,
        avgSalary: historicalSalary,
        avgCost: historicalCost,
        avgROI: roi,
        dataPoints: year === currentYear ? (actualData?.data_points || 0) : 0
      });
    }
    
    console.log(`Historical Trends: Generated ${trends.length} years of trend data`);

    // Get category-specific trends
    const categoryTrends: CategoryTrend[] = [];

    // Overall salary trend
    if (trends.length >= 2) {
      const latestSalary = trends[0].avgSalary;
      const previousSalary = trends[1].avgSalary;
      const salaryChange = latestSalary - previousSalary;
      const salaryChangePercent = (salaryChange / previousSalary) * 100;

      categoryTrends.push({
        category: 'Average Salary',
        currentValue: latestSalary,
        previousValue: previousSalary,
        change: salaryChange,
        changePercent: salaryChangePercent,
        trend: salaryChange > 0 ? 'up' : salaryChange < 0 ? 'down' : 'stable'
      });

      // Cost trend
      const latestCost = trends[0].avgCost;
      const previousCost = trends[1].avgCost;
      const costChange = latestCost - previousCost;
      const costChangePercent = (costChange / previousCost) * 100;

      categoryTrends.push({
        category: 'Average Cost',
        currentValue: latestCost,
        previousValue: previousCost,
        change: costChange,
        changePercent: costChangePercent,
        trend: costChange > 0 ? 'up' : costChange < 0 ? 'down' : 'stable'
      });

      // ROI trend
      const latestROI = trends[0].avgROI;
      const previousROI = trends[1].avgROI;
      const roiChange = latestROI - previousROI;
      const roiChangePercent = previousROI !== 0 ? (roiChange / Math.abs(previousROI)) * 100 : 0;

      categoryTrends.push({
        category: 'Average ROI',
        currentValue: latestROI,
        previousValue: previousROI,
        change: roiChange,
        changePercent: roiChangePercent,
        trend: roiChange > 0 ? 'up' : roiChange < 0 ? 'down' : 'stable'
      });
    }

    // Generate predictions (simple linear regression for next 3 years)
    const predictions: TrendData[] = [];
    if (trends.length >= 3) {
      // Calculate average year-over-year changes
      const salaryChanges = [];
      const costChanges = [];
      
      for (let i = 0; i < trends.length - 1; i++) {
        salaryChanges.push(trends[i].avgSalary - trends[i + 1].avgSalary);
        costChanges.push(trends[i].avgCost - trends[i + 1].avgCost);
      }
      
      const avgSalaryChange = salaryChanges.reduce((a, b) => a + b, 0) / salaryChanges.length;
      const avgCostChange = costChanges.reduce((a, b) => a + b, 0) / costChanges.length;

      // Project next 3 years
      const latestYear = trends[0].year;
      for (let i = 1; i <= 3; i++) {
        const predictedSalary = Math.round(trends[0].avgSalary + (avgSalaryChange * i));
        const predictedCost = Math.round(trends[0].avgCost + (avgCostChange * i));
        
        predictions.push({
          year: latestYear + i,
          avgSalary: predictedSalary,
          avgCost: predictedCost,
          avgROI: Math.round((predictedSalary * 10) - (predictedCost * 4)),
          dataPoints: 0 // Predicted data
        });
      }
    }

    // Get top growing fields based on program completions and enrollment
    console.log('Historical Trends: Querying top programs...');
    const topGrowingFields = await db.prepare(`
      SELECT 
        ap.cipcode,
        ap.cip_title as program_name,
        SUM(ap.completions) as total_completions,
        COUNT(DISTINCT ap.unitid) as school_count,
        AVG(ap.completions) as avg_completions
      FROM academic_programs ap
      WHERE ap.cip_title IS NOT NULL 
        AND ap.completions > 0
      GROUP BY ap.cipcode, ap.cip_title
      HAVING school_count >= 5
      ORDER BY total_completions DESC
      LIMIT 10
    `).all() as any[];
    
    console.log(`Historical Trends: Found ${topGrowingFields.length} top programs with completions data`);

    console.log('Historical Trends: Returning response');
    return NextResponse.json({
      historical: trends, // Already in chronological order (oldest to newest)
      predictions,
      categoryTrends,
      topGrowingFields: topGrowingFields.map(field => ({
        name: field.program_name,
        cipcode: field.cipcode,
        totalCompletions: field.total_completions,
        schoolCount: field.school_count,
        avgCompletions: Math.round(field.avg_completions),
        growthIndicator: 'high' // Based on completion numbers
      })),
      summary: {
        yearsAnalyzed: trends.length,
        latestYear: currentYear,
        dataSource: 'Projected based on industry inflation rates and actual ' + currentYear + ' data',
        totalDataPoints: trends.reduce((sum, t) => sum + t.dataPoints, 0),
        predictionsGenerated: predictions.length,
        industryFieldsAnalyzed: topGrowingFields.length
      }
    });

  } catch (error) {
    console.error('Historical Trends error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        error: 'Failed to fetch historical trends',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
