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
      {/* Cost Configuration */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Education Costs</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tuition (Annual)
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fees (Annual)
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Room & Board (Annual)
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Books & Supplies (Annual)
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Other Expenses (Annual)
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