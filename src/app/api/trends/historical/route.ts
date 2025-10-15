import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCollegeDb, getUsersDb } from '@/lib/db-helper';

// Mark route as dynamic to prevent build-time rendering errors
export const dynamic = 'force-dynamic';

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

    // Historical Trends is now available to all tiers (free + premium)

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
      
      // Query top programs from materialized table (fast!)
      console.log('📊 [TRENDS] Query 2: Top programs...');  
      topGrowingFields = await db.prepare(`
        SELECT 
          cipcode,
          program_name,
          total_completions,
          school_count,
          avg_completions
        FROM top_programs_by_completions
        WHERE school_count >= 5
        ORDER BY total_completions DESC
        LIMIT 9
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
      const latestSalary = trends[trends.length - 1].avgSalary;
      const previousSalary = trends[trends.length - 2].avgSalary;
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
      const latestCost = trends[trends.length - 1].avgCost;
      const previousCost = trends[trends.length - 2].avgCost;
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
      const latestROI = trends[trends.length - 1].avgROI;
      const previousROI = trends[trends.length - 2].avgROI;
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
      
      for (let i = 1; i < trends.length; i++) {
        salaryChanges.push(trends[i].avgSalary - trends[i - 1].avgSalary);
        costChanges.push(trends[i].avgCost - trends[i - 1].avgCost);
      }
      
      const avgSalaryChange = salaryChanges.reduce((a, b) => a + b, 0) / salaryChanges.length;
      const avgCostChange = costChanges.reduce((a, b) => a + b, 0) / costChanges.length;

      // Project next 3 years from latest year
      const latestYear = trends[trends.length - 1].year;
      const latestSalary = trends[trends.length - 1].avgSalary;
      const latestCost = trends[trends.length - 1].avgCost;
      
      for (let i = 1; i <= 3; i++) {
        const predictedSalary = Math.round(latestSalary + (avgSalaryChange * i));
        const predictedCost = Math.round(latestCost + (avgCostChange * i));
        
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

    // Fetch real salary data by major from user submissions
    const userDb = await getUsersDb();
    let salaryByMajor: any[] = [];
    
    if (userDb) {
      salaryByMajor = await userDb.prepare(`
        SELECT 
          major,
          COUNT(*) as submission_count,
          ROUND(AVG(current_salary)) as avg_salary
        FROM salary_submissions
        WHERE is_approved = 1 
          AND current_salary > 0
        GROUP BY LOWER(major)
        HAVING COUNT(*) >= 3
      `).all() as any[];
    }
    
    console.log(`Historical Trends: Found ${salaryByMajor.length} majors with real salary data`);

    // Create a map for quick lookup (case-insensitive)
    const salaryDataMap = new Map<string, { avgSalary: number; count: number }>();
    salaryByMajor.forEach((item: any) => {
      salaryDataMap.set(item.major.toLowerCase().trim(), {
        avgSalary: item.avg_salary,
        count: item.submission_count
      });
    });

    // Helper function to get salary - uses real data if available, falls back to estimates
    const getSalaryForProgram = (cipcode: string, programName: string): { salary: number; isRealData: boolean; submissionCount: number } => {
      // Try to match with real user data first (case-insensitive partial match)
      const programLower = programName.toLowerCase();
      
      // Direct match
      if (salaryDataMap.has(programLower)) {
        const data = salaryDataMap.get(programLower)!;
        return { salary: data.avgSalary, isRealData: true, submissionCount: data.count };
      }
      
      // Partial match (e.g., "Computer Science" matches "computer science", "comp sci", etc.)
      for (const [major, data] of salaryDataMap.entries()) {
        if (programLower.includes(major) || major.includes(programLower)) {
          return { salary: data.avgSalary, isRealData: true, submissionCount: data.count };
        }
      }
      
      // Fall back to CIP code estimates
      const cip = cipcode.substring(0, 2);
      const salaryMap: { [key: string]: number } = {
        '11': 95000,  // Computer & Information Sciences
        '14': 82000,  // Engineering
        '15': 88000,  // Engineering Technologies
        '26': 68000,  // Biological Sciences
        '27': 72000,  // Mathematics & Statistics
        '40': 65000,  // Physical Sciences
        '42': 58000,  // Psychology
        '43': 62000,  // Homeland Security, Law Enforcement
        '45': 55000,  // Social Sciences
        '50': 48000,  // Visual & Performing Arts
        '51': 72000,  // Health Professions (Nursing)
        '52': 68000,  // Business, Management, Marketing
        '54': 52000,  // History
        '23': 48000,  // English Language & Literature
        '24': 52000,  // Liberal Arts & Sciences
        '13': 48000,  // Education
        '09': 58000,  // Communication & Journalism
        '16': 58000,  // Foreign Languages
        '19': 52000,  // Family & Consumer Sciences
        '22': 62000,  // Legal Professions
        '30': 65000,  // Multi/Interdisciplinary Studies
        '31': 52000,  // Parks, Recreation, Leisure
        '38': 58000,  // Philosophy & Religious Studies
        '39': 48000,  // Theology & Religious Vocations
        '44': 65000,  // Public Administration
      };
      
      return { salary: salaryMap[cip] || 60000, isRealData: false, submissionCount: 0 };
    };

    console.log('Historical Trends: Returning response');
    console.log(`🎯 [TRENDS] Total request time: ${Date.now() - startTime}ms`);
    return NextResponse.json({
      historical: trends, // Already in chronological order (oldest to newest)
      predictions,
      categoryTrends,
      topGrowingFields: topGrowingFields.map((field: any) => {
        const salaryData = getSalaryForProgram(field.cipcode, field.program_name);
        return {
          name: field.program_name,
          cipcode: field.cipcode,
          totalCompletions: field.total_completions,
          schoolCount: field.school_count,
          avgCompletions: Math.round(field.avg_completions),
          avgSalary: salaryData.salary,
          isRealData: salaryData.isRealData,
          submissionCount: salaryData.submissionCount,
          growthIndicator: 'high' // Based on completion numbers
        };
      }),
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
