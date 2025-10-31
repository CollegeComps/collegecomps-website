'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import InstitutionSelector from './InstitutionSelector';
import ProgramSelector from './ProgramSelector';
import DegreeSelector from './DegreeSelector';
import InstitutionsByDegree from './InstitutionsByDegree';
import CostAnalyzer from './CostAnalyzer';
import ROIResults from './ROIResults';
import SaveROIScenarioModal from './SaveROIScenarioModal';
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
  const { data: session } = useSession();
  const [searchMode, setSearchMode] = useState<'institution' | 'degree'>('institution');
  const [selectedInstitution, setSelectedInstitution] = useState<DatabaseInstitution | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<AcademicProgram | null>(null);
  const [selectedDegree, setSelectedDegree] = useState<AcademicProgram | null>(null);
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
  const [hasHighSchoolDiploma, setHasHighSchoolDiploma] = useState<boolean>(true);
  const [earnings, setEarnings] = useState<EarningsInputs>({
    baselineSalary: 42000, // With diploma default
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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showAutoSaveModal, setShowAutoSaveModal] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAutoSaveRef = useRef<string>('');

  // Update baseline salary when diploma status changes
  // Note: Without HS diploma, both baseline AND projected salaries are lower
  useEffect(() => {
    setEarnings(prev => {
      const baselineSalary = hasHighSchoolDiploma ? 42000 : 33000;
      // If no diploma, reduce projected salary by same proportion (about 21% lower)
      const projectedAdjustment = hasHighSchoolDiploma ? 1.0 : 0.79;
      const currentProjected = prev.projectedSalary;
      
      return {
        ...prev,
        baselineSalary,
        // Only adjust projected if it's at a default value, don't override user selections
        projectedSalary: currentProjected === 50000 || currentProjected === 39500 
          ? (hasHighSchoolDiploma ? 50000 : 39500)
          : currentProjected
      };
    });
  }, [hasHighSchoolDiploma]);

  // Auto-recalculate ROI when baseline salary changes (if ROI already calculated)
  useEffect(() => {
    if (roiResult && earnings.baselineSalary) {
      calculateROI();
    }
  }, [earnings.baselineSalary]);

  // Auto-save functionality
  useEffect(() => {
    // Only enable auto-save if user is authenticated and has calculated results
    if (!session?.user || !roiResult || !selectedInstitution) {
      return;
    }

    // Mark as having unsaved changes when roiResult changes
    setHasUnsavedChanges(true);

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set a new 30-second auto-save timer
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveCalculation();
    }, 30000); // 30 seconds

    // Cleanup timer on unmount or when dependencies change
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [roiResult, costs, earnings, financialAid, session, selectedInstitution, selectedProgram]);

  // Load saved scenario from URL parameter
  useEffect(() => {
    const loadScenario = async () => {
      // Check URL for loadScenario parameter
      const urlParams = new URLSearchParams(window.location.search);
      const scenarioId = urlParams.get('loadScenario');
      
      if (!scenarioId || !session?.user) {
        return;
      }

      try {
        const response = await fetch(`/api/roi/scenarios?id=${scenarioId}`);
        if (!response.ok) {
          throw new Error('Failed to load scenario');
        }

        const data = await response.json();
        const scenario = data.scenario;

        if (!scenario) {
          throw new Error('Scenario not found');
        }

        // Load institution
        const instResponse = await fetch(`/api/institutions/${scenario.institution_unitid}`);
        if (instResponse.ok) {
          const instData = await instResponse.json();
          setSelectedInstitution(instData.institution);
        }

        // Load program if available
        if (scenario.program_cipcode) {
          const programData: AcademicProgram = {
            id: 0,
            unitid: scenario.institution_unitid,
            cipcode: scenario.program_cipcode,
            cip_title: scenario.program_name,
            completions: 0,
            total_completions: 0
          };
          setSelectedProgram(programData);
        }

        // Restore cost inputs
        setCosts({
          tuition: scenario.tuition || 0,
          fees: scenario.fees || 0,
          roomBoard: scenario.room_board || 0,
          books: scenario.books_supplies || 1200,
          otherExpenses: scenario.other_expenses || 2000,
          programLength: scenario.program_length || 4,
          residency: 'in-state' // Default, can be enhanced
        });

        // Restore earnings inputs
        setEarnings({
          baselineSalary: scenario.baseline_salary || 35000,
          projectedSalary: scenario.projected_salary || 50000,
          careerLength: scenario.career_length || 30,
          salaryGrowthRate: scenario.salary_growth_rate || 3
        });

        // Restore financial aid
        setFinancialAid({
          grants: scenario.grants || 0,
          scholarships: scenario.scholarships || 0,
          workStudy: scenario.work_study || 0,
          loans: scenario.loans || 0,
          interestRate: scenario.loan_interest_rate || 5.5
        });

        // Recalculate ROI with loaded data
        setTimeout(() => {
          calculateROI();
        }, 100);

        // Clean URL after loading
        window.history.replaceState({}, '', '/roi-calculator');

      } catch (error) {
        console.error('Error loading scenario:', error);
        alert('Failed to load scenario. Please try again.');
      }
    };

    loadScenario();
  }, [session?.user]); // Only run when session changes

  // Handle beforeunload event to prompt user
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && roiResult && session?.user) {
        e.preventDefault();
        // Modern browsers require returnValue to be set
        e.returnValue = 'You have unsaved ROI calculations. Do you want to save before leaving?';
        // Show our custom modal instead
        setShowAutoSaveModal(true);
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, roiResult, session]);

  const autoSaveCalculation = async () => {
    if (!session?.user?.id || !roiResult || !selectedInstitution) {
      return;
    }

    // Create a hash of current state to avoid duplicate saves
    const currentStateHash = JSON.stringify({
      institution: selectedInstitution.unitid,
      program: selectedProgram?.cipcode,
      costs,
      earnings,
      financialAid
    });

    // Don't save if nothing has changed since last auto-save
    if (currentStateHash === lastAutoSaveRef.current) {
      return;
    }

    try {
      const autoSaveName = `Auto-save: ${selectedInstitution.name}${
        selectedProgram ? ` - ${selectedProgram.cip_title}` : ''
      } (${new Date().toLocaleString()})`;

      await handleSaveScenario(autoSaveName, true); // Save as draft
      lastAutoSaveRef.current = currentStateHash;
      setHasUnsavedChanges(false);
      
      // Show brief auto-save indicator
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const calculateROI = () => {
    const result = ROICalculator.calculateROI(costs, earnings, financialAid);
    setRoiResult(result);
    setSaveSuccess(false); // Reset save success message when recalculating
    setHasUnsavedChanges(true);
  };

  const handleSaveScenario = async (scenarioName: string, isDraft: boolean) => {
    if (!session?.user?.id || !roiResult || !selectedInstitution) {
      throw new Error('Missing required data to save scenario');
    }

    // Calculate additional values from roiResult and inputs
    const lifetimeEarningsWithDegree = ROICalculator.calculateLifetimeEarnings(earnings);
    const lifetimeEarningsWithoutDegree = ROICalculator.calculateBaselineEarnings(earnings);
    const opportunityCost = earnings.baselineSalary * costs.programLength;

    const scenarioData = {
      user_id: session.user.id,
      scenario_name: scenarioName,
      institution_unitid: selectedInstitution.unitid,
      institution_name: selectedInstitution.name,
      program_cipcode: selectedProgram?.cipcode || null,
      program_name: selectedProgram?.cip_title || null,
      // Costs
      tuition: costs.tuition,
      fees: costs.fees,
      room_board: costs.roomBoard,
      books_supplies: costs.books,
      other_expenses: costs.otherExpenses,
      program_length: costs.programLength,
      // Financial Aid
      grants: financialAid.grants,
      scholarships: financialAid.scholarships,
      work_study: financialAid.workStudy,
      loans: financialAid.loans,
      loan_interest_rate: financialAid.interestRate,
      // Earnings
      baseline_salary: earnings.baselineSalary,
      projected_salary: earnings.projectedSalary,
      career_length: earnings.careerLength,
      salary_growth_rate: earnings.salaryGrowthRate,
      // Results
      total_cost: roiResult.totalCost,
      opportunity_cost: opportunityCost,
      total_investment: roiResult.totalCost + opportunityCost,
      total_earnings_with_degree: lifetimeEarningsWithDegree,
      total_earnings_without_degree: lifetimeEarningsWithoutDegree,
      lifetime_earnings_increase: lifetimeEarningsWithDegree - lifetimeEarningsWithoutDegree,
      net_roi: roiResult.netROI,
      roi_percentage: roiResult.roiPercentage,
      payback_period: roiResult.paybackPeriod === Infinity ? null : roiResult.paybackPeriod,
      is_draft: isDraft
    };

    const response = await fetch('/api/roi/scenarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenarioData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save scenario');
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 5000); // Hide success message after 5 seconds
    setHasUnsavedChanges(false); // Mark as saved
  };

  const handleSelectInstitutionFromDegree = async (institution: any) => {
    // Convert the institution from degree search to DatabaseInstitution format
    const dbInstitution: DatabaseInstitution = {
      id: institution.unitid,
      unitid: institution.unitid,
      name: institution.name,
      city: institution.city,
      state: institution.state,
      control_public_private: institution.control === 'Public' ? 1 : 2,
      ownership: 0,
      website: undefined
    };
    
    setSelectedInstitution(dbInstitution);
    
    // Set the program from the selected degree
    if (selectedDegree) {
      const programData: AcademicProgram = {
        id: 0,
        unitid: institution.unitid,
        cipcode: selectedDegree.cipcode || '',
        cip_title: institution.cip_title || selectedDegree.cip_title || '',
        total_completions: institution.total_completions,
        completions: institution.total_completions,
        credential_level: 0,
        credential_name: institution.credential_name
      };
      setSelectedProgram(programData);
      
      // Adapt and set program
      const adapted = adaptProgram(programData);
      setAdaptedProgram(adapted);
    }
    
    // Update adapted institution
    const adapted = adaptInstitution(dbInstitution);
    setAdaptedInstitution(adapted);
    
    // Fetch financial data and program length info
    try {
      const [finResponse, earningsResponse, programLengthResponse] = await Promise.all([
        fetch(`/api/financial-data?unitid=${institution.unitid}`),
        fetch(`/api/earnings-data?unitid=${institution.unitid}`),
        fetch(`/api/program-length?unitid=${institution.unitid}`)
      ]);
      
      // Determine program length (2-year vs 4-year)
      let programLength = 4; // Default to 4-year
      if (programLengthResponse.ok) {
        const lengthData = await programLengthResponse.json();
        programLength = lengthData.programLength || 4;
      } else {
        // Fallback: check institution name for indicators
        const name = institution.name.toLowerCase();
        if (name.includes('community college') || name.includes('technical college') || name.includes('junior college')) {
          programLength = 2;
        }
      }
      
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
            otherExpenses: fin.other_expenses || prev.otherExpenses,
            programLength: programLength // Set detected program length
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
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Search Mode Toggle */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Choose Your Search Method</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              setSearchMode('institution');
              setSelectedDegree(null);
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              searchMode === 'institution'
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h4 className="font-bold text-white mb-1">Search by Institution</h4>
            <p className="text-sm text-gray-300 font-medium">Find a college first, then explore their programs</p>
          </button>
          
          <button
            onClick={() => {
              setSearchMode('degree');
              setSelectedInstitution(null);
              setSelectedProgram(null);
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              searchMode === 'degree'
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h4 className="font-bold text-white mb-1">Search by Degree</h4>
            <p className="text-sm text-gray-300 font-medium">Choose your field of study, see all institutions offering it</p>
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-gray-300">Step 1</span>
          <span className="text-sm font-bold text-gray-300">Step 2</span>
          <span className="text-sm font-bold text-gray-300">Step 3</span>
          <span className="text-sm font-bold text-gray-300">Results</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: selectedInstitution ? (selectedProgram ? (roiResult ? '100%' : '75%') : '50%') : '25%' 
            }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Inputs */}
        <div className="space-y-6">
          {searchMode === 'institution' ? (
            <>
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
              className="w-full bg-orange-500 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg"
            >
              Calculate ROI
            </button>
          )}

          {/* Save Scenario Button */}
          {roiResult && session?.user && (
            <div className="space-y-2">
              <button
                onClick={() => setShowSaveModal(true)}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Scenario
              </button>
              {saveSuccess && (
                <div className="bg-green-500/10 border border-green-500 rounded-lg p-3 flex items-center text-green-400 font-medium">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Scenario saved successfully!
                </div>
              )}
              {hasUnsavedChanges && !saveSuccess && (
                <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-3 flex items-center text-orange-400 font-medium text-sm">
                  <svg className="w-5 h-5 mr-2 text-orange-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Auto-save in 30 seconds...
                </div>
              )}
            </div>
          )}

          {/* Sign in prompt if not authenticated */}
          {roiResult && !session?.user && (
            <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4 text-center">
              <p className="text-white font-medium mb-2">
                <a href="/auth/signin" className="font-bold hover:underline text-orange-500">Sign in</a> to save and compare ROI scenarios
              </p>
            </div>
          )}
            </>
          ) : (
            <>
              {/* Degree-First Flow */}
              <DegreeSelector
                selectedDegree={selectedDegree}
                onSelect={(degree) => {
                  setSelectedDegree(degree);
                  setSelectedInstitution(null);
                  setSelectedProgram(null);
                }}
              />

              {selectedDegree && (
                <InstitutionsByDegree
                  cipcode={selectedDegree.cipcode || ''}
                  degreeName={selectedDegree.cip_title || ''}
                  onSelectInstitution={handleSelectInstitutionFromDegree}
                />
              )}

              {/* Cost Analysis for degree-first mode */}
              {adaptedInstitution && selectedDegree && (
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

              {/* Calculate Button for degree-first mode */}
              {selectedInstitution && selectedDegree && (
                <button
                  onClick={calculateROI}
                  className="w-full bg-orange-500 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg"
                >
                  Calculate ROI
                </button>
              )}

              {/* Save and sign-in prompts for degree-first mode */}
              {roiResult && session?.user && (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Scenario
                  </button>
                  {saveSuccess && (
                    <div className="bg-green-500/10 border border-green-500 rounded-lg p-3 flex items-center text-green-400 font-medium">
                      <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Scenario saved successfully!
                    </div>
                  )}
                  {hasUnsavedChanges && !saveSuccess && (
                    <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-3 flex items-center text-orange-400 font-medium text-sm">
                      <svg className="w-5 h-5 mr-2 text-orange-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Auto-save in 30 seconds...
                    </div>
                  )}
                </div>
              )}

              {roiResult && !session?.user && (
                <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4 text-center">
                  <p className="text-white font-medium mb-2">
                    <a href="/auth/signin" className="font-bold hover:underline text-orange-500">Sign in</a> to save and compare ROI scenarios
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Baseline Salary Settings */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Baseline Salary Settings</h3>
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-300">
                Education Level for Baseline Comparison
              </label>
              <div className="flex flex-col space-y-2">
                <label className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-colors">
                  <input
                    type="radio"
                    checked={hasHighSchoolDiploma}
                    onChange={() => setHasHighSchoolDiploma(true)}
                    className="mr-3 h-4 w-4 text-orange-500 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-white">With High School Diploma</span>
                    <span className="ml-2 text-green-500 font-bold">$42,000/year</span>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-colors">
                  <input
                    type="radio"
                    checked={!hasHighSchoolDiploma}
                    onChange={() => setHasHighSchoolDiploma(false)}
                    className="mr-3 h-4 w-4 text-orange-500 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-white">Without Diploma</span>
                    <span className="ml-2 text-green-500 font-bold">$33,000/year</span>
                  </div>
                </label>
              </div>
              <p className="text-xs text-gray-400 font-medium mt-2">
                This baseline salary is used to calculate your ROI. Note: Without a diploma, both baseline and projected earnings are typically lower.
              </p>
            </div>
          </div>

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
                <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 mt-6">
                  <h3 className="text-xl font-bold text-white mb-4">Program Analysis</h3>
                  
                  <div className="space-y-4">
                    {/* Program Details */}
                    <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
                      <h4 className="font-bold text-orange-400 mb-2">Program Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300 font-medium">Program Name:</span>
                          <span className="font-bold text-white text-right max-w-md">
                            {selectedProgram.cip_title || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300 font-medium">CIP Code:</span>
                          <span className="font-bold text-white">{selectedProgram.cipcode || 'N/A'}</span>
                        </div>
                        {selectedProgram.credential_name && (
                          <div className="flex justify-between">
                            <span className="text-orange-500">Credential:</span>
                            <span className="font-semibold text-white font-bold">{selectedProgram.credential_name}</span>
                          </div>
                        )}
                        {(selectedProgram.total_completions || selectedProgram.completions) && (
                          <div className="flex justify-between">
                            <span className="text-orange-500">Annual Graduates:</span>
                            <span className="font-semibold text-white font-bold">
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
                    <div className="border-t border-gray-700 pt-4">
                      <h4 className="font-bold text-white mb-3">ROI Insights</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {earnings && earnings.projectedSalary > 0 && costs.tuition > 0 && (
                          <div className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded">
                            <span className="text-sm text-gray-300 font-medium">Earnings to Annual Cost Ratio:</span>
                            <span className={`font-bold ${
                              (earnings.projectedSalary / costs.tuition) >= 2 
                                ? 'text-green-500' 
                                : (earnings.projectedSalary / costs.tuition) >= 1
                                ? 'text-yellow-500'
                                : 'text-red-500'
                            }`}>
                              {(earnings.projectedSalary / costs.tuition).toFixed(2)}x
                            </span>
                          </div>
                        )}
                        {roiResult && roiResult.paybackPeriod > 0 && (
                          <div className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded">
                            <span className="text-sm text-gray-300 font-medium">Payback Period:</span>
                            <span className={`font-bold ${
                              roiResult.paybackPeriod <= 10 
                                ? 'text-green-500' 
                                : roiResult.paybackPeriod <= 15
                                ? 'text-yellow-500'
                                : 'text-red-500'
                            }`}>
                              {roiResult.paybackPeriod.toFixed(1)} years
                            </span>
                          </div>
                        )}
                        {roiResult && roiResult.roiPercentage !== null && roiResult.roiPercentage !== undefined && (
                          <div className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded">
                            <span className="text-sm text-gray-300 font-medium">ROI Percentage:</span>
                            <span className={`font-bold ${
                              roiResult.roiPercentage > 100 
                                ? 'text-green-500' 
                                : roiResult.roiPercentage > 0
                                ? 'text-yellow-500'
                                : 'text-red-500'
                            }`}>
                              {roiResult.roiPercentage > 0 ? '+' : ''}{roiResult.roiPercentage.toFixed(0)}%
                            </span>
                          </div>
                        )}
                        {roiResult && roiResult.netROI && (
                          <div className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded">
                            <span className="text-sm text-gray-300 font-medium">Net Financial Gain:</span>
                            <span className={`font-bold ${
                              roiResult.netROI > 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              ${roiResult.netROI.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Insights */}
                    <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
                      <h4 className="font-semibold text-white font-bold mb-2">Key Considerations</h4>
                      <ul className="space-y-2 text-sm text-orange-400">
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
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-8 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ROI Results</h3>
              <p className="text-gray-300 mb-4">
                Select an institution and configure your costs to see detailed ROI calculations.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Information Panel */}
      <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white font-bold mb-3">How ROI is Calculated</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-orange-400 mb-1">Total Cost</h4>
            <p className="text-orange-500">Tuition + Fees + Room & Board + Books + Other Expenses - Financial Aid</p>
          </div>
          <div>
            <h4 className="font-semibold text-orange-400 mb-1">Expected Earnings</h4>
            <p className="text-orange-500">Lifetime earnings with degree minus baseline earnings without degree</p>
          </div>
          <div>
            <h4 className="font-semibold text-orange-400 mb-1">ROI Percentage</h4>
            <p className="text-orange-500">(Expected Earnings - Total Cost) / Total Cost × 100</p>
          </div>
        </div>
      </div>

      {/* Save ROI Scenario Modal */}
      {roiResult && selectedInstitution && (
        <SaveROIScenarioModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveScenario}
          result={roiResult}
          institution={{
            unitid: selectedInstitution.unitid,
            name: selectedInstitution.name
          }}
          program={selectedProgram ? {
            cipcode: selectedProgram.cipcode || '',
            cip_title: selectedProgram.cip_title || ''
          } : null}
          costs={costs}
          earnings={earnings}
          financialAid={financialAid}
        />
      )}
    </div>
  );
}