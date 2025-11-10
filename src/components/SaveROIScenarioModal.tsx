'use client';

import { useState } from 'react';
import { CostInputs, EarningsInputs, FinancialAid, ROICalculation } from '@/types';

interface SaveROIScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scenarioName: string, isDraft: boolean) => Promise<void>;
  result: ROICalculation;
  institution: { unitid: number; name: string };
  program?: { cipcode: string; cip_title: string } | null;
  costs: CostInputs;
  earnings: EarningsInputs;
  financialAid: FinancialAid;
}

export default function SaveROIScenarioModal({
  isOpen,
  onClose,
  onSave,
  result,
  institution,
  program,
  costs,
  earnings,
  financialAid
}: SaveROIScenarioModalProps) {
  const [scenarioName, setScenarioName] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!scenarioName.trim()) {
      setError('Please enter a scenario name');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(scenarioName, isDraft);
      // Reset and close
      setScenarioName('');
      setIsDraft(false);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to save scenario');
      } else {
        setError('Failed to save scenario');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setScenarioName('');
    setIsDraft(false);
    setError(null);
    onClose();
  };

  // Generate a suggested name
  const suggestedName = program 
    ? `${institution.name} - ${program.cip_title}` 
    : `${institution.name} - ${new Date().toLocaleDateString()}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Save ROI Scenario</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
            disabled={saving}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Scenario Name Input */}
          <div>
            <label htmlFor="scenarioName" className="block text-sm font-medium text-gray-300 mb-2">
              Scenario Name *
            </label>
            <input
              id="scenarioName"
              type="text"
              value={scenarioName}
              onChange={(e) => {
                setScenarioName(e.target.value);
                setError(null);
              }}
              placeholder={suggestedName}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={saving}
            />
            <button
              onClick={() => setScenarioName(suggestedName)}
              className="text-sm text-blue-600 hover:text-blue-700 mt-1"
              disabled={saving}
            >
              Use suggested name
            </button>
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>

          {/* Draft Option */}
          <div className="flex items-center">
            <input
              id="isDraft"
              type="checkbox"
              checked={isDraft}
              onChange={(e) => setIsDraft(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={saving}
            />
            <label htmlFor="isDraft" className="ml-2 text-sm text-gray-300">
              Save as draft (won't appear in comparisons)
            </label>
          </div>

          {/* Summary Preview */}
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">Scenario Summary</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-300">Institution</p>
                <p className="font-semibold text-gray-900">{institution.name}</p>
              </div>
              {program && (
                <div>
                  <p className="text-gray-300">Program</p>
                  <p className="font-semibold text-gray-900">{program.cip_title}</p>
                </div>
              )}
              <div>
                <p className="text-gray-300">Total Investment</p>
                <p className="font-semibold text-gray-900">${result.totalCost.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-300">Net ROI</p>
                <p className={`font-semibold ${result.netROI > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${result.netROI.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-300">ROI Percentage</p>
                <p className={`font-semibold ${result.roiPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.roiPercentage > 0 ? '+' : ''}{result.roiPercentage.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-gray-300">Payback Period</p>
                <p className="font-semibold text-gray-900">
                  {result.paybackPeriod === Infinity ? 'Never' : `${result.paybackPeriod.toFixed(1)} years`}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <details className="bg-blue-50 rounded-lg p-4">
            <summary className="font-semibold text-blue-900 cursor-pointer">
              View Full Calculation Details
            </summary>
            <div className="mt-3 space-y-2 text-sm text-blue-800">
              <div className="grid grid-cols-2 gap-2">
                <span>Tuition (per year):</span>
                <span className="font-semibold">${costs.tuition.toLocaleString()}</span>
                
                <span>Program Length:</span>
                <span className="font-semibold">{costs.programLength} years</span>
                
                <span>Room & Board:</span>
                <span className="font-semibold">${costs.roomBoard.toLocaleString()}/year</span>
                
                <span>Financial Aid:</span>
                <span className="font-semibold">
                  ${(financialAid.grants + financialAid.scholarships + financialAid.workStudy).toLocaleString()}
                </span>
                
                <span>Projected Salary:</span>
                <span className="font-semibold">${earnings.projectedSalary.toLocaleString()}/year</span>
                
                <span>Baseline Salary:</span>
                <span className="font-semibold">${earnings.baselineSalary.toLocaleString()}/year</span>
                
                <span>ROI Time Horizon:</span>
                <span className="font-semibold">{earnings.careerLength} years</span>
                
                <span>Salary Growth:</span>
                <span className="font-semibold">{earnings.salaryGrowthRate}% per year</span>
              </div>
            </div>
          </details>

          {/* Info Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex">
            <svg className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Saved scenarios help you:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Compare different programs side-by-side</li>
                <li>Track how your financial plans evolve</li>
                <li>Share specific calculations with advisors or family</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 px-6 py-4 flex justify-end space-x-3 border-t">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-300 hover:bg-gray-100 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !scenarioName.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Scenario'}
          </button>
        </div>
      </div>
    </div>
  );
}
