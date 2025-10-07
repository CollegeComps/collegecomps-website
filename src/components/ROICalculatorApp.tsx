'use client';

import { useState } from 'react';
import InstitutionSelector from './InstitutionSelector';
import ProgramSelector from './ProgramSelector';
import CostAnalyzer from './CostAnalyzer';
import ROIResults from './ROIResults';
import { Institution as DatabaseInstitution, AcademicProgram } from '@/lib/database';
import { Institution, Program, CostInputs, EarningsInputs, FinancialAid, ROICalculation } from '@/types';
import { ROICalculator } from '@/utils/roiCalculator';
import { EnhancedEarningsCalculator } from '@/utils/enhancedEarningsCalculator';

// Adapter function to convert database Institution to types Institution
const adaptInstitution = (dbInst: DatabaseInstitution): Institution => ({
  id: dbInst.id,
  unitid: dbInst.unitid,
  name: dbInst.name,
  city: dbInst.city || '',
  state: dbInst.state || '',
  control: dbInst.control_public_private === 1 ? 'Public' : 
           dbInst.control_public_private === 2 ? 'Private nonprofit' : 'Private for-profit',
  ownership: dbInst.ownership || 0,
  website: dbInst.website
});

// Adapter function to convert AcademicProgram to Program
const adaptProgram = (acadProg: AcademicProgram): Program => ({
  id: acadProg.id || 0,
  unitid: acadProg.unitid,
  cipcode: acadProg.cipcode || '',
  cip_title: acadProg.cip_title || 'Unknown Program',
  completions: acadProg.total_completions || acadProg.completions || 0,
  credential_level: acadProg.credential_level || 0,
  distance_education: false // Default value
});

export default function ROICalculatorApp() {
  const [selectedInstitution, setSelectedInstitution] = useState<DatabaseInstitution | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<AcademicProgram | null>(null);
  const [adaptedInstitution, setAdaptedInstitution] = useState<Institution | null>(null);
  const [adaptedProgram, setAdaptedProgram] = useState<Program | null>(null);
  const [costs, setCosts] = useState<CostInputs>({
    tuition: 0,
    fees: 0,
    roomBoard: 0,
    books: 1200,
    otherExpenses: 2000,
    programLength: 4,
    residency: 'in-state'
  });
  const [earnings, setEarnings] = useState<EarningsInputs>({
    baselineSalary: 35000,
    projectedSalary: 50000,
    careerLength: 30,
    salaryGrowthRate: 3
  });
  const [financialAid, setFinancialAid] = useState<FinancialAid>({
    grants: 0,
    scholarships: 0,
    workStudy: 0,
    loans: 0,
    interestRate: 5.5
  });
  const [roiResult, setRoiResult] = useState<ROICalculation | null>(null);

  const calculateROI = () => {
    const result = ROICalculator.calculateROI(costs, earnings, financialAid);
    setRoiResult(result);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Progress Indicator */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">Step 1</span>
          <span className="text-sm font-medium text-gray-600">Step 2</span>
          <span className="text-sm font-medium text-gray-600">Step 3</span>
          <span className="text-sm font-medium text-gray-600">Results</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: selectedInstitution ? (selectedProgram ? (roiResult ? '100%' : '75%') : '50%') : '25%' 
            }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Inputs */}
        <div className="space-y-6">
          {/* Institution Selection */}
          <InstitutionSelector
            selectedInstitution={selectedInstitution}
            onSelect={async (institution) => {
              setSelectedInstitution(institution);
              setSelectedProgram(null); // Reset program when institution changes
              // Update adapted institution
              if (institution) {
                const adapted = adaptInstitution(institution);
                setAdaptedInstitution(adapted);
                
                // Fetch and apply financial data
                try {
                  const [finResponse, earningsResponse] = await Promise.all([
                    fetch(`/api/financial-data?unitid=${institution.unitid}`),
                    fetch(`/api/earnings-data?unitid=${institution.unitid}`)
                  ]);
                  
                  if (finResponse.ok) {
                    const finData = await finResponse.json();
                    if (finData.financialData) {
                      const fin = finData.financialData;
                      setCosts(prev => ({
                        ...prev,
                        tuition: fin.tuition_in_state || fin.tuition_out_state || prev.tuition,
                        fees: fin.fees || prev.fees,
                        roomBoard: fin.room_board_on_campus || fin.room_board_off_campus || prev.roomBoard,
                        books: fin.books_supplies || prev.books,
                        otherExpenses: fin.other_expenses || prev.otherExpenses
                      }));
                    }
                  }
                  
                  if (earningsResponse.ok) {
                    const earningsData = await earningsResponse.json();
                    if (earningsData.earningsData) {
                      const earn = earningsData.earningsData;
                      setEarnings(prev => ({
                        ...prev,
                        projectedSalary: earn.earnings_6_years_after_entry || prev.projectedSalary
                      }));
                    }
                  }
                } catch (error) {
                  console.error('Error fetching financial/earnings data:', error);
                }
              } else {
                setAdaptedInstitution(null);
              }
            }}
          />

          {/* Program Selection */}
          {selectedInstitution && (
            <ProgramSelector
              institutionId={selectedInstitution.unitid}
              selectedProgram={selectedProgram}
              institutionInfo={{
                name: selectedInstitution.name,
                state: selectedInstitution.state,
                control_public_private: selectedInstitution.control_public_private
              }}
              onSelect={(program) => {
                setSelectedProgram(program);
                // Update adapted program  
                if (program) {
                  const adapted = adaptProgram(program);
                  setAdaptedProgram(adapted);
                  
                  // Use enhanced earnings calculation
                  if (selectedInstitution) {
                    const adaptedInst = adaptInstitution(selectedInstitution);
                    const enhancedEarnings = EnhancedEarningsCalculator.calculateEnhancedEarnings(
                      adaptedInst,
                      program
                    );
                    
                    setEarnings(prev => ({
                      ...prev,
                      projectedSalary: enhancedEarnings.startingSalary,
                      salaryGrowthRate: enhancedEarnings.growthRate
                    }));
                  }
                } else {
                  setAdaptedProgram(null);
                }
              }}
            />
          )}

          {/* Cost Analysis */}
          {adaptedInstitution && (
            <CostAnalyzer
              institution={adaptedInstitution}
              costs={costs}
              earnings={earnings}
              financialAid={financialAid}
              onCostsChange={setCosts}
              onEarningsChange={setEarnings}
              onFinancialAidChange={setFinancialAid}
            />
          )}

          {/* Calculate Button */}
          {selectedInstitution && (
            <button
              onClick={calculateROI}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              Calculate ROI
            </button>
          )}
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {roiResult && adaptedInstitution && (
            <>
              <ROIResults
                result={roiResult}
                institution={adaptedInstitution}
                program={adaptedProgram}
                costs={costs}
                earnings={earnings}
              />

              {/* Program Analysis Section */}
              {selectedProgram && (
                <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Program Analysis</h3>
                  
                  <div className="space-y-4">
                    {/* Program Details */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Program Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Program Name:</span>
                          <span className="font-semibold text-blue-900 text-right max-w-md">
                            {selectedProgram.cip_title || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">CIP Code:</span>
                          <span className="font-semibold text-blue-900">{selectedProgram.cipcode || 'N/A'}</span>
                        </div>
                        {selectedProgram.credential_name && (
                          <div className="flex justify-between">
                            <span className="text-blue-700">Credential:</span>
                            <span className="font-semibold text-blue-900">{selectedProgram.credential_name}</span>
                          </div>
                        )}
                        {(selectedProgram.total_completions || selectedProgram.completions) && (
                          <div className="flex justify-between">
                            <span className="text-blue-700">Annual Graduates:</span>
                            <span className="font-semibold text-blue-900">
                              {(selectedProgram.total_completions || selectedProgram.completions)?.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Institution-wide Outcomes (for this program's context) */}
                    {earnings && earnings.projectedSalary > 0 && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">
                          Expected Earnings Outlook
                        </h4>
                        <p className="text-xs text-green-700 mb-3">
                          Based on institution-wide graduate outcomes
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-700">Projected Annual Salary:</span>
                            <span className="font-bold text-green-900 text-lg">
                              ${earnings.projectedSalary.toLocaleString()}/year
                            </span>
                          </div>
                          {earnings.baselineSalary > 0 && (
                            <div className="flex justify-between">
                              <span className="text-green-700">Baseline Salary (No Degree):</span>
                              <span className="font-semibold text-green-700">
                                ${earnings.baselineSalary.toLocaleString()}/year
                              </span>
                            </div>
                          )}
                          {earnings.projectedSalary > earnings.baselineSalary && (
                            <div className="flex justify-between border-t border-green-200 pt-2 mt-2">
                              <span className="text-green-700">Salary Increase:</span>
                              <span className="font-bold text-green-900">
                                +${(earnings.projectedSalary - earnings.baselineSalary).toLocaleString()}/year
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Program Size & Popularity */}
                    {selectedProgram.total_completions && selectedProgram.total_completions > 0 && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Program Popularity</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-purple-700">Program Size:</span>
                            <span className="font-bold text-purple-900">
                              {selectedProgram.total_completions < 50 ? 'Small' : 
                               selectedProgram.total_completions < 200 ? 'Medium' : 'Large'}
                            </span>
                          </div>
                          <div className="text-xs text-purple-700">
                            {selectedProgram.total_completions} graduates per year
                            {selectedProgram.total_completions < 50 && ' - More personalized attention'}
                            {selectedProgram.total_completions >= 50 && selectedProgram.total_completions < 200 && ' - Good balance of resources and attention'}
                            {selectedProgram.total_completions >= 200 && ' - Extensive alumni network'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Program ROI Insights */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">ROI Insights</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {earnings && earnings.projectedSalary > 0 && costs.tuition > 0 && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="text-sm text-gray-700">Earnings to Annual Cost Ratio:</span>
                            <span className={`font-bold ${
                              (earnings.projectedSalary / costs.tuition) >= 2 
                                ? 'text-green-600' 
                                : (earnings.projectedSalary / costs.tuition) >= 1
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}>
                              {(earnings.projectedSalary / costs.tuition).toFixed(2)}x
                            </span>
                          </div>
                        )}
                        {roiResult && roiResult.paybackPeriod > 0 && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="text-sm text-gray-700">Payback Period:</span>
                            <span className={`font-bold ${
                              roiResult.paybackPeriod <= 10 
                                ? 'text-green-600' 
                                : roiResult.paybackPeriod <= 15
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}>
                              {roiResult.paybackPeriod.toFixed(1)} years
                            </span>
                          </div>
                        )}
                        {roiResult && roiResult.roiPercentage !== null && roiResult.roiPercentage !== undefined && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="text-sm text-gray-700">ROI Percentage:</span>
                            <span className={`font-bold ${
                              roiResult.roiPercentage > 100 
                                ? 'text-green-600' 
                                : roiResult.roiPercentage > 0
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}>
                              {roiResult.roiPercentage > 0 ? '+' : ''}{roiResult.roiPercentage.toFixed(0)}%
                            </span>
                          </div>
                        )}
                        {roiResult && roiResult.netROI && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="text-sm text-gray-700">Net Financial Gain:</span>
                            <span className={`font-bold ${
                              roiResult.netROI > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ${roiResult.netROI.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Insights */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">💡 Key Considerations</h4>
                      <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>These earnings reflect institution-wide outcomes and may vary by specific program</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Consider local job market demand for this field when evaluating ROI</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Network effects and alumni connections can significantly impact career outcomes</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Placeholder when no results */}
          {!roiResult && (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ROI Results</h3>
              <p className="text-gray-600 mb-4">
                Select an institution and configure your costs to see detailed ROI calculations.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How ROI is Calculated</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">Total Cost</h4>
            <p className="text-blue-700">Tuition + Fees + Room & Board + Books + Other Expenses - Financial Aid</p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">Expected Earnings</h4>
            <p className="text-blue-700">Lifetime earnings with degree minus baseline earnings without degree</p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">ROI Percentage</h4>
            <p className="text-blue-700">(Expected Earnings - Total Cost) / Total Cost × 100</p>
          </div>
        </div>
      </div>
    </div>
  );
}