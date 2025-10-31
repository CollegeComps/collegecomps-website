'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  calculateEFC,
  formatCurrency,
  type FinancialProfile,
  type EFCBreakdown
} from '@/lib/financial-calculator';

export default function EFCCalculatorPage() {
  const [formData, setFormData] = useState<FinancialProfile>({
    studentIncome: 0,
    studentAssets: 0,
    isStudentDependent: true,
    parentIncome: 0,
    parentAssets: 0,
    numberOfParents: 2,
    numberOfDependents: 2,
    numberOfInCollege: 1,
    parentAge: 50,
    stateOfResidence: '',
  });

  const [result, setResult] = useState<EFCBreakdown | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const handleCalculate = () => {
    const efcResult = calculateEFC(formData);
    setResult(efcResult);
    setShowBreakdown(true);
  };

  const handleReset = () => {
    setFormData({
      studentIncome: 0,
      studentAssets: 0,
      isStudentDependent: true,
      parentIncome: 0,
      parentAssets: 0,
      numberOfParents: 2,
      numberOfDependents: 2,
      numberOfInCollege: 1,
      parentAge: 50,
      stateOfResidence: '',
    });
    setResult(null);
    setShowBreakdown(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧮 Expected Family Contribution (EFC) Calculator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Estimate your Expected Family Contribution using the Federal Methodology formula.
            This helps you understand how much financial aid you might qualify for.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Financial Information</h2>

              {/* Student Status */}
              <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isStudentDependent}
                    onChange={(e) => setFormData({ ...formData, isStudentDependent: e.target.checked })}
                    className="w-5 h-5 text-orange-500 rounded"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    I am a dependent student (under 24, supported by parents)
                  </span>
                </label>
              </div>

              {/* Student Information */}
              <div className="space-y-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">📚 Student Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student's Annual Income
                  </label>
                  <input
                    type="number"
                    value={formData.studentIncome || ''}
                    onChange={(e) => setFormData({ ...formData, studentIncome: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                  <p className="mt-1 text-sm text-gray-500">Include wages, tips, and taxable scholarships</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student's Assets (Savings, Investments)
                  </label>
                  <input
                    type="number"
                    value={formData.studentAssets || ''}
                    onChange={(e) => setFormData({ ...formData, studentAssets: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                  <p className="mt-1 text-sm text-gray-500">Do not include retirement accounts</p>
                </div>
              </div>

              {/* Parent Information (only if dependent) */}
              {formData.isStudentDependent && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">👨‍👩‍👧‍👦 Parent Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Parents
                      </label>
                      <select
                        value={formData.numberOfParents}
                        onChange={(e) => setFormData({ ...formData, numberOfParents: parseInt(e.target.value) as 1 | 2 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="1">Single Parent (1)</option>
                        <option value="2">Two Parents (2)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age of Older Parent
                      </label>
                      <input
                        type="number"
                        value={formData.parentAge || ''}
                        onChange={(e) => setFormData({ ...formData, parentAge: parseInt(e.target.value) || 50 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent's Combined Annual Income
                    </label>
                    <input
                      type="number"
                      value={formData.parentIncome || ''}
                      onChange={(e) => setFormData({ ...formData, parentIncome: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <p className="mt-1 text-sm text-gray-500">Include all taxable income (W-2, 1099, etc.)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent's Assets (Savings, Investments, Real Estate)
                    </label>
                    <input
                      type="number"
                      value={formData.parentAssets || ''}
                      onChange={(e) => setFormData({ ...formData, parentAssets: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <p className="mt-1 text-sm text-gray-500">Exclude primary home and retirement accounts</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Family Size (Total Dependents)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.numberOfDependents || ''}
                        onChange={(e) => setFormData({ ...formData, numberOfDependents: parseInt(e.target.value) || 2 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="2"
                      />
                      <p className="mt-1 text-sm text-gray-500">Including student</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number in College
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.numberOfInCollege || ''}
                        onChange={(e) => setFormData({ ...formData, numberOfInCollege: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="1"
                      />
                      <p className="mt-1 text-sm text-gray-500">Simultaneously enrolled</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State of Residence (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.stateOfResidence || ''}
                      onChange={(e) => setFormData({ ...formData, stateOfResidence: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="CA, NY, TX, etc."
                      maxLength={2}
                    />
                    <p className="mt-1 text-sm text-gray-500">For more accurate tax allowance calculation</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleCalculate}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                >
                  Calculate My EFC
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {result ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Your EFC Results</h2>
                  
                  {/* Main EFC */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 mb-6 text-white">
                    <div className="text-sm font-medium mb-1">Your Expected Family Contribution</div>
                    <div className="text-4xl font-bold">{formatCurrency(result.totalEFC)}</div>
                    <div className="text-sm mt-2 opacity-90">per year</div>
                  </div>

                  {/* Breakdown Toggle */}
                  <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full mb-4 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all flex items-center justify-between"
                  >
                    <span>View Detailed Breakdown</span>
                    <span>{showBreakdown ? '▼' : '▶'}</span>
                  </button>

                  {showBreakdown && (
                    <div className="space-y-4 mb-6">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-2">Parent Contribution</div>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(result.parentContribution)}</div>
                        <div className="mt-2 text-xs text-gray-600 space-y-1">
                          <div>• Available Income: {formatCurrency(result.breakdown.parentAvailableIncome)}</div>
                          <div>• Asset Contribution: {formatCurrency(result.breakdown.parentAssetContribution)}</div>
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-2">Student Contribution</div>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(result.studentContribution)}</div>
                        <div className="mt-2 text-xs text-gray-600 space-y-1">
                          <div>• Available Income: {formatCurrency(result.breakdown.studentAvailableIncome)}</div>
                          <div>• Asset Contribution: {formatCurrency(result.breakdown.studentAssetContribution)}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* What This Means */}
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-gray-900 mb-2">What This Means</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      This is the amount federal aid formulas expect your family to contribute annually toward college costs.
                      The difference between college costs and your EFC determines your financial need.
                    </p>
                  </div>

                  {/* Next Steps */}
                  <div className="mt-6 space-y-3">
                    <Link
                      href="/colleges"
                      className="block w-full px-4 py-3 bg-orange-500 text-white text-center font-semibold rounded-lg hover:bg-orange-600 transition-all"
                    >
                      Find Affordable Colleges
                    </Link>
                    <Link
                      href="/scholarships"
                      className="block w-full px-4 py-3 bg-white text-orange-500 text-center font-semibold rounded-lg border-2 border-orange-500 hover:bg-orange-500/10 transition-all"
                    >
                      Search Scholarships
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-md p-8 text-center">
                  <div className="text-6xl mb-4">🧮</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Calculate</h3>
                  <p className="text-gray-600 text-sm">
                    Fill in your financial information and click "Calculate My EFC" to see your results
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Educational Content */}
        <div className="mt-12 bg-gray-900 border border-gray-800 rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Understanding Your EFC</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">What is EFC?</h3>
              <p className="text-sm text-gray-700">
                Your Expected Family Contribution (EFC) is a measure of your family's financial strength and is calculated according to a formula established by law.
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">How It's Used</h3>
              <p className="text-sm text-gray-700">
                Colleges subtract your EFC from their Cost of Attendance to determine your financial need. This determines your eligibility for need-based aid.
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Important Notes</h3>
              <p className="text-sm text-gray-700">
                This is an estimate using Federal Methodology. Some colleges use their own formulas and may calculate a different family contribution.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">🔒 Privacy Notice</h3>
            <p className="text-sm text-gray-700">
              All calculations are performed in your browser. We do not store or transmit your financial information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
