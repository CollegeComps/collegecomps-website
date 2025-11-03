'use client';

import { Institution, CostInputs, EarningsInputs, FinancialAid } from '@/types';
import DataCitation from './DataCitation';

interface CostAnalyzerProps {
  institution: Institution;
  costs: CostInputs;
  earnings: EarningsInputs;
  financialAid: FinancialAid;
  onCostsChange: (costs: CostInputs) => void;
  onEarningsChange: (earnings: EarningsInputs) => void;
  onFinancialAidChange: (financialAid: FinancialAid) => void;
}

export default function CostAnalyzer({ 
  institution, 
  costs, 
  earnings, 
  financialAid, 
  onCostsChange, 
  onEarningsChange, 
  onFinancialAidChange 
}: CostAnalyzerProps) {
  
  const updateCosts = (field: keyof CostInputs, value: number | string) => {
    onCostsChange({ ...costs, [field]: value });
  };

  const updateEarnings = (field: keyof EarningsInputs, value: number) => {
    onEarningsChange({ ...earnings, [field]: value });
  };

  const updateFinancialAid = (field: keyof FinancialAid, value: number) => {
    onFinancialAidChange({ ...financialAid, [field]: value });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const annualCost = costs.tuition + costs.fees + costs.roomBoard + costs.books + costs.otherExpenses;
  const totalCost = annualCost * costs.programLength;
  const totalAid = (financialAid.grants + financialAid.scholarships + financialAid.workStudy) * costs.programLength;
  const netCost = Math.max(0, totalCost - totalAid);

  return (
    <div className="space-y-6">
      {/* Methodology & Assumptions Panel */}
      <div className="bg-gradient-to-br from-orange-500/10 to-gray-900 border border-orange-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ROI Calculation Methodology
        </h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-orange-400 mb-2">ROI Formula:</p>
            <div className="bg-gray-800/50 p-3 rounded border border-gray-700 font-mono text-xs text-gray-300">
              ROI = (Total Degree-Based Earnings - Total Cost of Degree) / Total Cost of Degree × 100%
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-orange-400 mb-2">Total Degree-Based Earnings:</p>
              <ul className="space-y-1 text-gray-300">
                <li>• 40-year career projection</li>
                <li>• Earnings begin after graduation (Year 5)</li>
                <li>• Compared to baseline (no-degree earnings)</li>
                <li>• Salary growth: {earnings.salaryGrowthRate}% annually</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-orange-400 mb-2">Total Cost of Degree:</p>
              <ul className="space-y-1 text-gray-300">
                <li>• Tuition + Fees + Room & Board</li>
                <li>• Books & Supplies + Other Expenses</li>
                <li>• Minus: Grants & Scholarships</li>
                <li>• (Loans not subtracted - must be repaid)</li>
              </ul>
            </div>
          </div>
          <div>
            <p className="font-medium text-orange-400 mb-2">Data Sources:</p>
            <ul className="space-y-1 text-gray-300 grid grid-cols-2 gap-x-4">
              <li>• Tuition/Fees: IPEDS (official)*</li>
              <li>• Room & Board: IPEDS (official)*</li>
              <li>• Books: College Board avg estimate†</li>
              <li>• Other Expenses: User estimate†</li>
              <li>• Earnings: College Scorecard*</li>
              <li>• Baseline: BLS/User input†</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          *Official database • †Estimated values (can be customized)
        </p>
      </div>

      {/* Cost Configuration */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Education Costs</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              Tuition (Annual)
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">IPEDS</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={costs.tuition}
                onChange={(e) => updateCosts('tuition', Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-500"
                placeholder="0"
              />
            </div>
            {institution.control === 'Public' && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => updateCosts('residency', 'in-state')}
                  className={`px-3 py-1 text-xs rounded ${
                    costs.residency === 'in-state' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  In-State
                </button>
                <button
                  onClick={() => updateCosts('residency', 'out-of-state')}
                  className={`px-3 py-1 text-xs rounded ${
                    costs.residency === 'out-of-state' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  Out-of-State
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              Fees (Annual)
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">IPEDS</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={costs.fees}
                onChange={(e) => updateCosts('fees', Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              Room & Board (Annual)
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">IPEDS</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={costs.roomBoard}
                onChange={(e) => updateCosts('roomBoard', Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              Books & Supplies (Annual)
              <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30">Estimated</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={costs.books}
                onChange={(e) => updateCosts('books', Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-500"
                placeholder="1200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              Other Expenses (Annual)
              <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30">Estimated</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={costs.otherExpenses}
                onChange={(e) => updateCosts('otherExpenses', Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-500"
                placeholder="2000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Program Length (Years)
            </label>
            <select
              value={costs.programLength}
              onChange={(e) => updateCosts('programLength', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white"
            >
              <option value={0.5}>6 months</option>
              <option value={1}>1 year</option>
              <option value={2}>2 years</option>
              <option value={3}>3 years</option>
              <option value={4}>4 years</option>
              <option value={5}>5 years</option>
              <option value={6}>6 years</option>
            </select>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="font-semibold text-white mb-3">Cost Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Annual Cost:</span>
              <span className="font-semibold text-white">{formatCurrency(annualCost)}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Total Program Cost:</span>
              <span className="font-semibold text-white">{formatCurrency(totalCost)}</span>
            </div>
            <div className="flex justify-between text-green-400">
              <span>Total Financial Aid:</span>
              <span className="font-semibold text-green-300">-{formatCurrency(totalAid)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-700 pt-2 text-lg font-bold text-white">
              <span>Net Cost:</span>
              <span>{formatCurrency(netCost)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Aid */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Financial Aid (Annual)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Grants & Need-Based Aid
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={financialAid.grants}
                onChange={(e) => updateFinancialAid('grants', Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Merit Scholarships
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={financialAid.scholarships}
                onChange={(e) => updateFinancialAid('scholarships', Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Work-Study
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={financialAid.workStudy}
                onChange={(e) => updateFinancialAid('workStudy', Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Student Loans
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={financialAid.loans}
                onChange={(e) => updateFinancialAid('loans', Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Loan Assumptions */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Student Loan Assumptions
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Assumed Borrowing Amount:</span>
              <span className="font-semibold text-white">{formatCurrency(Math.max(0, netCost))}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Federal Student Loan Interest Rate:</span>
              <span className="font-semibold text-white">6.53%</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Estimated Monthly Payment (10-year):</span>
              <span className="font-semibold text-white">
                {formatCurrency((Math.max(0, netCost) * 0.01132))}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-3 flex items-start gap-1">
              <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Based on 2024-25 federal Direct Unsubsidized Loan rates for undergraduates. Actual rates and payment amounts may vary based on loan type, creditworthiness, and repayment plan selected.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Earnings Projections */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Earnings Projections</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Starting Salary (Without Degree)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={earnings.baselineSalary}
                onChange={(e) => updateEarnings('baselineSalary', Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-500"
                placeholder="35000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expected Starting Salary (With Degree)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={earnings.projectedSalary}
                onChange={(e) => updateEarnings('projectedSalary', Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-500"
                placeholder="50000"
              />
            </div>
            {institution.earnings_6_years && (
              <p className="text-xs text-gray-400 mt-1">
                Median for {institution.name}: {formatCurrency(institution.earnings_6_years)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Career Length (Years)
            </label>
            <select
              value={earnings.careerLength}
              onChange={(e) => updateEarnings('careerLength', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white"
            >
              <option value={20}>20 years</option>
              <option value={25}>25 years</option>
              <option value={30}>30 years</option>
              <option value={35}>35 years</option>
              <option value={40}>40 years</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Annual Salary Growth Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={earnings.salaryGrowthRate}
                onChange={(e) => updateEarnings('salaryGrowthRate', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white"
                placeholder="3.0"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
            </div>
          </div>
        </div>

        {/* Earnings Preview */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">Projected Benefit</h3>
          <div className="text-sm text-blue-900">
            <div className="flex justify-between">
              <span>Annual salary difference:</span>
              <span className="font-semibold">
                {formatCurrency(earnings.projectedSalary - earnings.baselineSalary)}
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Total additional lifetime earnings:</span>
              <span className="font-semibold">
                {formatCurrency(
                  ((earnings.projectedSalary - earnings.baselineSalary) * earnings.careerLength) *
                  (1 + earnings.salaryGrowthRate / 100)
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Data Sources & Citations */}
        <DataCitation
          sources={[
            {
              name: 'IPEDS',
              description: 'Institutional tuition and fee data',
              year: '2023-2024',
              url: 'https://nces.ed.gov/ipeds/',
              lastUpdated: 'September 2024'
            },
            {
              name: 'College Scorecard',
              description: 'Graduate earnings data',
              year: '2022',
              url: 'https://collegescorecard.ed.gov/'
            },
            {
              name: 'Bureau of Labor Statistics',
              description: 'Salary growth rates and baseline earnings',
              url: 'https://www.bls.gov/'
            },
            {
              name: 'User Submissions',
              description: 'Crowdsourced salary data from verified alumni',
              year: '2024-2025'
            }
          ]}
          assumptions={[
            'Tuition inflation: 4.5% annually (NCES historical average)',
            'Salary growth: 3% annually (BLS historical average)',
            'Full-time enrollment assumed',
            'Room & board costs are for on-campus housing',
            'Baseline salary represents no-degree earnings in same field',
            'Financial aid amounts remain constant throughout program',
            'Calculations exclude additional income from summer work or co-ops'
          ]}
        />
      </div>
    </div>
  );
}