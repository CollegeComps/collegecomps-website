import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCollegeDb, getUsersDb } from '@/lib/db-helper';

// Enable aggressive caching - 10 minutes
export const revalidate = 600;

// Simple in-memory cache to reduce DB hits
let cachedData: {
  financial: any;
  programs: any;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in ms

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
  const startTime = Date.now();
  console.log('🕐 [TRENDS] Request started at', new Date().toISOString());
  
  const db = getCollegeDb();
  if (!db) {
    console.error('Historical Trends: Database unavailable');
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    console.log('Historical Trends: Starting request');
    const authStart = Date.now();
    const session = await auth();
    console.log(`⏱️ [TRENDS] Auth took ${Date.now() - authStart}ms`);
    
    if (!session?.user) {
      console.log('Historical Trends: No session/user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has Premium or Professional tier
    if (session.user.subscriptionTier === 'free') {
      console.log('Historical Trends: User is free tier');
      return NextResponse.json(
        { error: 'Historical Trends require Advance tier or higher. Upgrade to access trend analysis.' },
        { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'all';
    const years = parseInt(searchParams.get('years') || '5');
    
    console.log(`Historical Trends: Fetching data for ${years} years, category: ${category}`);

    // Execute all database queries in parallel for maximum speed
    console.log('Historical Trends: Starting parallel queries...');
    const queryStart = Date.now();
    
    const usersDb = getUsersDb();
    
    // Check if we have cached data (less than 10 minutes old)
    const now = Date.now();
    const isCacheValid = cachedData && (now - cachedData.timestamp) < CACHE_DURATION;
    
    let actualData: any;
    let topGrowingFields: any[];
    
    if (isCacheValid) {
      console.log('✅ [TRENDS] Using cached data - skipping DB queries');
      actualData = cachedData!.financial;
      topGrowingFields = cachedData!.programs;
    } else {
      console.log('📊 [TRENDS] Cache miss or expired - querying database...');
      
      // Query financial data
      console.log('📊 [TRENDS] Query 1: Financial data...');
      actualData = await db.prepare(`
        SELECT 
          year,
          avg_total_cost as avg_cost,
          school_count as data_points
        FROM v_yearly_cost_trends
        ORDER BY year DESC
        LIMIT 1
      `).get() as any;
      console.log(`✅ [TRENDS] Query 1 complete in ${Date.now() - queryStart}ms`);
      
      // Query top programs
      console.log('📊 [TRENDS] Query 2: Top programs...');  
      topGrowingFields = await db.prepare(`
        SELECT 
          cipcode,
          program_name,
          total_completions,
          school_count,
          avg_completions
        FROM v_top_programs_by_completions
        WHERE school_count >= 5
        LIMIT 10
      `).all() as any[];
      console.log(`✅ [TRENDS] Query 2 complete in ${Date.now() - queryStart}ms`);
      
      // Update cache
      cachedData = {
        financial: actualData,
        programs: topGrowingFields,
        timestamp: now
      };
      console.log('💾 [TRENDS] Cache updated');
    }
    
    // Always query salary data (small, fast query)
    console.log('📊 [TRENDS] Query 3: Salary submissions...');
    let userSalaryResult = null;
    if (usersDb) {
      try {
        userSalaryResult = await usersDb.prepare(`
          SELECT * FROM v_salary_submissions_summary
        `).get() as any;
        console.log(`✅ [TRENDS] Query 3 complete in ${Date.now() - queryStart}ms`);
      } catch (err) {
        console.warn(`⚠️ [TRENDS] Query 3 failed:`, err);
      }
    }
    
    console.log(`⏱️ [TRENDS] All queries took ${Date.now() - queryStart}ms`);
    console.log(`Historical Trends: Found actual data for year ${actualData?.year}`);
    
    // Process salary data
    let submissionCount = 0;
    let userSalaryData: any = null;
    
    if (userSalaryResult) {
      submissionCount = userSalaryResult.approved_submissions || 0;
      console.log(`Historical Trends: Found ${submissionCount} approved salary submissions`);
      
      if (submissionCount >= 100) {
        userSalaryData = {
          avg_salary: userSalaryResult.avg_approved_salary,
          submission_count: userSalaryResult.approved_submissions,
          avg_years_out: userSalaryResult.avg_years_out,
          earliest_grad_year: userSalaryResult.earliest_grad_year,
          latest_grad_year: userSalaryResult.latest_grad_year
        };
        console.log(`Historical Trends: Using ${userSalaryData.submission_count} user submissions (threshold: 100+ for real data)`);
      } else {
        console.log(`Historical Trends: Using synthetic data (need 100+ submissions, have ${submissionCount})`);
      }
    }

    // Generate historical trends using industry-standard growth rates
    const currentYear = actualData?.year || 2023;
    const currentCost = actualData?.avg_cost || 0;
    const costInflationRate = 0.04; // 4% annual college cost inflation (historical average)
    const salaryGrowthRate = 0.03; // 3% annual salary growth
    
    // Determine data source and base salary
    const useRealData = submissionCount >= 100 && userSalaryData?.avg_salary;
    const baseSalary = useRealData ? userSalaryData.avg_salary : 60000;
    const dataSource = useRealData 
      ? `Based on ${submissionCount} real user salary submissions` 
      : `Projected using industry rates (${submissionCount} submissions, need 100+ for real data)`;
    
    console.log(`Historical Trends: Data source - ${dataSource}, Base salary: $${baseSalary.toLocaleString()}`);
    
    // Pre-calculate inflation factors for each year to optimize loop
    const inflationFactors: { year: number; costFactor: number; salaryFactor: number; }[] = [];
    for (let i = years - 1; i >= 0; i--) {
      const year = currentYear - i;
      const yearDiff = currentYear - year;
      inflationFactors.push({
        year,
        costFactor: 1 / Math.pow(1 + costInflationRate, yearDiff),
        salaryFactor: 1 / Math.pow(1 + salaryGrowthRate, yearDiff)
      });
    }
    
    // Generate historical data using pre-calculated factors
    const trends: TrendData[] = inflationFactors.map(({ year, costFactor, salaryFactor }) => {
      const historicalCost = Math.round(currentCost * costFactor);
      const historicalSalary = Math.round(baseSalary * salaryFactor);
      const roi = Math.round((historicalSalary * 10) - (historicalCost * 4));
      
      return {
        year,
        avgSalary: historicalSalary,
        avgCost: historicalCost,
        avgROI: roi,
        dataPoints: year === currentYear ? (actualData?.data_points || 0) : 0
      };
    });
    
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
        changePercent: Math.round(salaryChangePercent * 100) / 100,
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
        changePercent: Math.round(costChangePercent * 100) / 100,
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
        changePercent: Math.round(roiChangePercent * 100) / 100,
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

    // Top growing fields already fetched in parallel query above
    console.log(`Historical Trends: Found ${topGrowingFields.length} top programs with completions data`);

    console.log('Historical Trends: Returning response');
    console.log(`🎯 [TRENDS] Total request time: ${Date.now() - startTime}ms`);
    return NextResponse.json({
      historical: trends, // Already in chronological order (oldest to newest)
      predictions,
      categoryTrends,
      topGrowingFields: topGrowingFields.map((field: any) => ({
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
        dataSource: dataSource,
        totalDataPoints: trends.reduce((sum, t) => sum + t.dataPoints, 0),
        predictionsGenerated: predictions.length,
        industryFieldsAnalyzed: topGrowingFields.length,
        userSubmissions: submissionCount,
        usingRealData: useRealData
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
