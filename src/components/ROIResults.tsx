'use client';

import { ROICalculation, Institution, Program, CostInputs, EarningsInputs } from '@/types';
import { ROICalculator } from '@/utils/roiCalculator';
import DataCitation from './DataCitation';

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

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className={`rounded-lg shadow-lg p-6 ${
        isPositiveROI ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      } border-2`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">ROI Analysis</h2>
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
            isPositiveROI ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isPositiveROI ? 'Positive ROI' : 'Negative ROI'}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {ROICalculator.formatCurrency(result.netROI)}
            </div>
            <div className="text-sm text-gray-600">Net Return</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {ROICalculator.formatPercentage(result.roiPercentage)}
            </div>
            <div className="text-sm text-gray-600">ROI Percentage</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {result.paybackPeriod === Infinity ? 'Never' : `${result.paybackPeriod.toFixed(1)} yrs`}
            </div>
            <div className="text-sm text-gray-600">Payback Period</div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Financial Breakdown</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-700">Total Education Cost</span>
            <span className="font-semibold text-red-600">
              -{ROICalculator.formatCurrency(result.totalCost)}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-700">Expected Additional Earnings</span>
            <span className="font-semibold text-green-600">
              +{ROICalculator.formatCurrency(result.expectedEarnings)}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-t-2 border-gray-300">
            <span className="text-lg font-semibold text-gray-900">Net Return on Investment</span>
            <span className={`text-lg font-bold ${
              isPositiveROI ? 'text-green-600' : 'text-red-600'
            }`}>
              {ROICalculator.formatCurrency(result.netROI)}
            </span>
          </div>
        </div>
      </div>

      {/* Earnings Comparison */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Career Earnings Comparison</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">
              {ROICalculator.formatCurrency(ROICalculator.calculateBaselineEarnings(earnings))}
            </div>
            <div className="text-sm text-gray-600 mt-1">Without Degree</div>
            <div className="text-xs text-gray-500 mt-1">
              Starting: {ROICalculator.formatCurrency(earnings.baselineSalary)}
            </div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-800">
              {ROICalculator.formatCurrency(ROICalculator.calculateLifetimeEarnings(earnings))}
            </div>
            <div className="text-sm text-blue-600 mt-1">With Degree</div>
            <div className="text-xs text-blue-500 mt-1">
              Starting: {ROICalculator.formatCurrency(earnings.projectedSalary)}
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-lg font-semibold text-green-600">
            Additional Lifetime Earnings: {ROICalculator.formatCurrency(result.expectedEarnings)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Over {earnings.careerLength} years with {earnings.salaryGrowthRate}% annual growth
          </div>
        </div>
      </div>

      {/* Institution & Program Info */}
      {institution && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Selected Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Institution</h4>
              <p className="text-gray-900">{institution.name}</p>
              <p className="text-sm text-gray-600">{institution.city}, {institution.state}</p>
              <p className="text-sm text-gray-600">{institution.control}</p>
            </div>
            
            {program && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Program</h4>
                <p className="text-gray-900">{program.cip_title}</p>
                <p className="text-sm text-gray-600">CIP Code: {program.cipcode}</p>
                <p className="text-sm text-gray-600">{program.completions} recent graduates</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assessment & Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Assessment</h3>
        
        <div className="space-y-3">
          {isPositiveROI ? (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-green-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-green-700">
                <p className="font-semibold">Positive Investment</p>
                <p className="text-sm">This education investment is projected to generate positive returns.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-red-700">
                <p className="font-semibold">Negative Investment</p>
                <p className="text-sm">Consider reviewing costs, expected earnings, or exploring alternatives.</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-blue-700">
            <p className="font-semibold">
              Payback Period: {result.paybackPeriod === Infinity ? 'Never' : `${result.paybackPeriod.toFixed(1)} years`}
            </p>
            <p className="text-sm">
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