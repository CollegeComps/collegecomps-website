'use client';

import { ROICalculation, Institution, Program, CostInputs, EarningsInputs } from '@/types';
import { ROICalculator } from '@/utils/roiCalculator';
import DataCitation from './DataCitation';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface ROIResultsProps {
  result: ROICalculation;
  institution: Institution | null;
  program: Program | null;
  costs: CostInputs;
  earnings: EarningsInputs;
}

export default function ROIResults({ result, institution, program, costs, earnings }: ROIResultsProps) {
  const isPositiveROI = result.netROI > 0;
  const isReasonablePayback = result.paybackPeriod <= 10 && result.paybackPeriod !== Infinity;

  // Generate earnings trajectory data
  const generateEarningsTrajectory = () => {
    const programLength = costs.programLength;
    const maxYears = earnings.careerLength; // Use user-selected time horizon
    const timeline = [];
    
    let cumulativeWithDegree = 0;
    let cumulativeWithoutDegree = 0;
    let currentSalaryWithDegree = earnings.projectedSalary;
    let currentSalaryWithoutDegree = earnings.baselineSalary;
    let crossoverYear = null;
    
    for (let year = 0; year <= maxYears; year++) {
      // During college years (investment period)
      if (year < programLength) {
        // With degree: paying costs (negative accumulation)
        const annualCost = costs.tuition + costs.fees + costs.roomBoard + costs.books + costs.otherExpenses;
        cumulativeWithDegree -= annualCost;
        
        // Without degree: earning baseline salary
        cumulativeWithoutDegree += currentSalaryWithoutDegree;
        currentSalaryWithoutDegree *= (1 + earnings.salaryGrowthRate / 100);
      } 
      // Post-graduation (earning years)
      else {
        // With degree: earning projected salary
        cumulativeWithDegree += currentSalaryWithDegree;
        currentSalaryWithDegree *= (1 + earnings.salaryGrowthRate / 100);
        
        // Without degree: continuing to earn baseline
        cumulativeWithoutDegree += currentSalaryWithoutDegree;
        currentSalaryWithoutDegree *= (1 + earnings.salaryGrowthRate / 100);
      }
      
      // Find crossover point
      if (crossoverYear === null && cumulativeWithDegree >= cumulativeWithoutDegree && year >= programLength) {
        crossoverYear = year;
      }
      
      timeline.push({
        year,
        withDegree: Math.round(cumulativeWithDegree),
        withoutDegree: Math.round(cumulativeWithoutDegree),
        breakEven: year === crossoverYear
      });
    }
    
    return timeline;
  };

  // Generate cost breakdown data
  const generateCostBreakdown = () => {
    const years = costs.programLength;
    return [
      { name: 'Tuition', value: costs.tuition * years, color: '#3B82F6' },
      { name: 'Fees', value: costs.fees * years, color: '#10B981' },
      { name: 'Room & Board', value: costs.roomBoard * years, color: '#F59E0B' },
      { name: 'Books', value: costs.books * years, color: '#8B5CF6' },
      { name: 'Other Expenses', value: costs.otherExpenses * years, color: '#EF4444' }
    ].filter(item => item.value > 0);
  };

  const timelineData = generateEarningsTrajectory();
  const costBreakdownData = generateCostBreakdown();

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className={`rounded-lg shadow-lg border-2 p-6 ${
        isPositiveROI ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="text-2xl font-extrabold text-white">ROI Analysis</h2>
          <div className={`px-4 py-2 rounded-full text-sm font-bold text-center ${
            isPositiveROI ? 'bg-green-500/20 border border-green-500 text-green-400' : 'bg-red-500/20 border border-red-500 text-red-400'
          }`}>
            {isPositiveROI ? 'Positive ROI' : 'Negative ROI'}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-800/50 rounded-lg">
            <div className="text-3xl sm:text-2xl md:text-3xl font-extrabold text-orange-500 break-words">
              {ROICalculator.formatCurrency(result.netROI)}
            </div>
            <div className="text-sm text-gray-300 font-semibold mt-2">Net Return</div>
          </div>
          
          <div className="text-center p-4 bg-gray-800/50 rounded-lg">
            <div className="text-3xl sm:text-2xl md:text-3xl font-extrabold text-orange-500 break-words">
              {ROICalculator.formatPercentage(result.roiPercentage)}
            </div>
            <div className="text-sm text-gray-300 font-semibold mt-2">ROI Percentage</div>
          </div>
          
          <div className="text-center p-4 bg-gray-800/50 rounded-lg">
            <div className="text-3xl sm:text-2xl md:text-3xl font-extrabold text-orange-500 break-words">
              {result.paybackPeriod === Infinity ? 'Never' : `${result.paybackPeriod.toFixed(1)} yrs`}
            </div>
            <div className="text-sm text-gray-300 font-semibold mt-2">Payback Period</div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Financial Breakdown</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-300 font-medium">Total Education Cost</span>
            <span className="font-bold text-red-500">
              -{ROICalculator.formatCurrency(result.totalCost)}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-300 font-medium">Expected Additional Earnings</span>
            <span className="font-bold text-green-500">
              +{ROICalculator.formatCurrency(result.expectedEarnings)}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-t-2 border-gray-700">
            <span className="text-lg font-bold text-white">Net Return on Investment</span>
            <span className={`text-lg font-bold ${
              isPositiveROI ? 'text-green-500' : 'text-red-500'
            }`}>
              {ROICalculator.formatCurrency(result.netROI)}
            </span>
          </div>
        </div>
      </div>

      {/* Earnings Trajectory Visualization */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Earnings Trajectory</h3>
        <p className="text-sm text-gray-300 font-medium mb-4">
          Cumulative earnings over time: with degree vs. without degree. Shows the full investment period (years 0-{costs.programLength - 1}) and subsequent earnings.
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="year" 
              label={{ value: 'Years from Start', position: 'insideBottom', offset: -5 }}
              stroke="#9CA3AF"
            />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              label={{ value: 'Cumulative Earnings', angle: -90, position: 'insideLeft' }}
              stroke="#9CA3AF"
            />
            <Tooltip 
              formatter={(value: number) => `$${value.toLocaleString()}`}
              labelFormatter={(label) => {
                const year = Number(label);
                if (year < costs.programLength) {
                  return `Year ${label} (College Year ${year + 1})`;
                } else {
                  return `Year ${label} (${year - costs.programLength + 1} years post-grad)`;
                }
              }}
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#fff' }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="withDegree" 
              stroke="#F97316" 
              fill="#F97316" 
              fillOpacity={0.3}
              name="With Degree"
            />
            <Area 
              type="monotone" 
              dataKey="withoutDegree" 
              stroke="#EF4444" 
              fill="#EF4444" 
              fillOpacity={0.3}
              name="Without Degree"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500 rounded-lg">
          {result.paybackPeriod !== Infinity ? (
            <p className="text-sm text-blue-400 font-medium text-center">
              <strong>Crossover Point: Year {Math.ceil(result.paybackPeriod)}</strong>
              <br />
              The degree path surpasses the non-degree path at this point. Beyond this year, the cumulative earnings with a degree exceed those without.
            </p>
          ) : (
            <p className="text-sm text-red-400 font-medium text-center">
              Based on current projections, the investment may not break even within a typical career span.
            </p>
          )}
        </div>
      </div>

      {/* Cost Breakdown Visualization */}
      {costBreakdownData.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Total Cost Breakdown</h3>
          <p className="text-sm text-gray-300 font-medium mb-4">
            Distribution of education expenses over {costs.programLength} years
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costBreakdownData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number" 
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                stroke="#9CA3AF"
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={120}
                stroke="#9CA3AF"
              />
              <Tooltip 
                formatter={(value: number) => `$${value.toLocaleString()}`}
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#fff' }}
              />
              <Bar dataKey="value" fill="#F97316">
                {costBreakdownData.map((entry, index) => (
                  <rect key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-300 font-medium mt-4 text-center">
            Total Investment: {ROICalculator.formatCurrency(result.totalCost)}
          </p>
        </div>
      )}

      {/* Earnings Comparison */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Career Earnings Comparison</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <div className="text-2xl font-bold text-white">
              {ROICalculator.formatCurrency(ROICalculator.calculateBaselineEarnings(earnings))}
            </div>
            <div className="text-sm text-gray-300 font-semibold mt-1">Without Degree</div>
            <div className="text-xs text-gray-400 font-medium mt-1">
              Starting: {ROICalculator.formatCurrency(earnings.baselineSalary)}
            </div>
          </div>
          
          <div className="text-center p-4 bg-orange-500/10 border border-orange-500 rounded-lg">
            <div className="text-2xl font-bold text-white">
              {ROICalculator.formatCurrency(ROICalculator.calculateLifetimeEarnings(earnings))}
            </div>
            <div className="text-sm text-orange-400 font-semibold mt-1">With Degree</div>
            <div className="text-xs text-orange-300 font-medium mt-1">
              Starting: {ROICalculator.formatCurrency(earnings.projectedSalary)}
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-lg font-bold text-green-500">
            Additional Lifetime Earnings: {ROICalculator.formatCurrency(result.expectedEarnings)}
          </div>
          <div className="text-sm text-gray-400 font-medium mt-1">
            Over {earnings.careerLength} years with {earnings.salaryGrowthRate}% annual growth
          </div>
        </div>
      </div>

      {/* Institution & Program Info */}
      {institution && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Selected Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold text-gray-300 mb-2">Institution</h4>
              <p className="text-white font-medium">{institution.name}</p>
              <p className="text-sm text-gray-400 font-medium">{institution.city}, {institution.state}</p>
              <p className="text-sm text-gray-400 font-medium">{institution.control}</p>
            </div>
            
            {program && (
              <div>
                <h4 className="font-bold text-gray-300 mb-2">Program</h4>
                <p className="text-white font-medium">{program.cip_title}</p>
                <p className="text-sm text-gray-400 font-medium">CIP Code: {program.cipcode}</p>
                <p className="text-sm text-gray-400 font-medium">{program.completions} recent graduates</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assessment & Recommendations */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Assessment</h3>
        
        <div className="space-y-3">
          {isPositiveROI ? (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-green-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-white">
                <p className="font-bold">Positive Investment</p>
                <p className="text-sm text-gray-300 font-medium">This education investment is projected to generate positive returns.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-white">
                <p className="font-bold">Negative Investment</p>
                <p className="text-sm text-gray-300 font-medium">Consider reviewing costs, expected earnings, or exploring alternatives.</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-orange-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-white">
            <p className="font-bold">
              Payback Period: {result.paybackPeriod === Infinity ? 'Never' : `${result.paybackPeriod.toFixed(1)} years`}
            </p>
            <p className="text-sm text-gray-300 font-medium">
              {isReasonablePayback 
                ? 'Reasonable timeframe to recover your investment.'
                : 'Consider if this payback period aligns with your goals.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Data Sources & Methodology */}
      <DataCitation
        sources={[
          {
            name: 'ROI Calculation Methodology',
            description: 'Net ROI = Total Lifetime Earnings - Total Investment Cost'
          },
          {
            name: 'Investment Cost Components',
            description: 'Tuition, fees, room & board, books, supplies, opportunity cost, minus financial aid'
          },
          {
            name: 'Earnings Projections',
            description: 'Based on College Scorecard alumni data and BLS occupation forecasts'
          },
          {
            name: 'Time Value Considerations',
            description: 'Calculations use nominal dollars without present value discounting'
          }
        ]}
        assumptions={[
          'Steady employment throughout career period',
          'No major career changes or gaps in employment',
          'Baseline salary assumes no college degree in same field',
          'Does not account for taxes, inflation, or investment returns',
          'Regional cost of living differences not factored',
          'Graduate outcomes vary significantly by individual circumstances'
        ]}
      />
    </div>
    </div>
  );
}