/**
 * Financial Aid Calculator - Federal Methodology EFC
 * Based on FAFSA Federal Methodology formula (2024-2025)
 * Provides accurate Expected Family Contribution calculations
 */

export interface FinancialProfile {
  // Student Information
  studentIncome: number;
  studentAssets?: number;
  isStudentDependent?: boolean; // Default true for traditional students
  
  // Parent Information (for dependent students)
  parentIncome: number;
  parentAssets: number;
  numberOfParents?: 1 | 2; // Default 2
  numberOfDependents?: number; // Including student (default 2)
  numberOfInCollege?: number; // Number in college simultaneously (default 1)
  
  // Additional factors
  parentAge?: number; // Age of older parent (affects asset protection)
  stateOfResidence?: string; // Affects state tax allowance
}

export interface EFCBreakdown {
  totalEFC: number;
  parentContribution: number;
  studentContribution: number;
  breakdown: {
    parentAvailableIncome: number;
    parentAssetContribution: number;
    studentAvailableIncome: number;
    studentAssetContribution: number;
    adjustedAvailableIncome: number;
  };
}

export interface AffordabilityResult {
  estimatedEFC: number;
  affordabilityTier: 'very-affordable' | 'affordable' | 'stretch' | 'reach';
  maxAffordableCost: number;
  estimatedNetPrice: number; // Cost minus typical aid
  gapAmount: number; // Amount over EFC if reach school
}

/**
 * Calculate Federal Tax Allowance based on income and family size
 * Uses 2024-2025 tax tables
 */
function calculateFederalTaxAllowance(income: number, numberOfParents: number): number {
  const isSingleParent = numberOfParents === 1;
  
  if (income <= 15000) {
    return isSingleParent ? income * 0.01 : income * 0.04;
  } else if (income <= 35000) {
    return isSingleParent ? 150 + (income - 15000) * 0.08 : 600 + (income - 15000) * 0.10;
  } else {
    return isSingleParent ? 1750 + (income - 35000) * 0.22 : 2600 + (income - 35000) * 0.25;
  }
}

/**
 * Calculate State Tax Allowance
 * Simplified - uses average of 5% for most states
 */
function calculateStateTaxAllowance(income: number, state?: string): number {
  // High tax states get higher allowance
  const highTaxStates = ['CA', 'NY', 'NJ', 'CT', 'MA', 'OR', 'MN', 'VT'];
  const lowTaxStates = ['TX', 'FL', 'WY', 'SD', 'WA', 'TN', 'NV', 'AK'];
  
  if (state && highTaxStates.includes(state.toUpperCase())) {
    return income * 0.07; // 7% for high-tax states
  } else if (state && lowTaxStates.includes(state.toUpperCase())) {
    return income * 0.02; // 2% for low/no-tax states
  }
  return income * 0.05; // 5% average
}

/**
 * Calculate Social Security Tax
 */
function calculateSocialSecurityTax(income: number): number {
  const ssWageBase = 160200; // 2024 SS wage base
  const taxableIncome = Math.min(income, ssWageBase);
  return taxableIncome * 0.0765; // 7.65% (6.2% SS + 1.45% Medicare)
}

/**
 * Income Protection Allowance based on family size
 * 2024-2025 tables
 */
function getIncomeProtectionAllowance(
  numberOfParents: number,
  numberOfDependents: number,
  numberOfInCollege: number
): number {
  // Base IPA for 2-parent, 2-dependent household
  const baseIPA = 30500;
  
  // Adjustments
  const parentAdjustment = numberOfParents === 1 ? -6000 : 0;
  const dependentAdjustment = (numberOfDependents - 2) * 7200;
  const collegeAdjustment = (numberOfInCollege - 1) * 4500;
  
  return Math.max(0, baseIPA + parentAdjustment + dependentAdjustment - collegeAdjustment);
}

/**
 * Asset Protection Allowance based on age of older parent
 * 2024-2025 tables
 */
function getAssetProtectionAllowance(parentAge: number, numberOfParents: number): number {
  // Simplified - actual table is more granular
  if (parentAge < 45) return numberOfParents === 2 ? 0 : 0;
  if (parentAge < 50) return numberOfParents === 2 ? 10000 : 5000;
  if (parentAge < 55) return numberOfParents === 2 ? 20000 : 10000;
  if (parentAge < 60) return numberOfParents === 2 ? 35000 : 17500;
  if (parentAge < 65) return numberOfParents === 2 ? 50000 : 25000;
  return numberOfParents === 2 ? 65000 : 32500;
}

/**
 * Calculate Parent Contribution using Federal Methodology
 */
function calculateParentContribution(profile: FinancialProfile): {
  contribution: number;
  availableIncome: number;
  assetContribution: number;
} {
  const {
    parentIncome,
    parentAssets,
    numberOfParents = 2,
    numberOfDependents = 2,
    numberOfInCollege = 1,
    parentAge = 50,
    stateOfResidence
  } = profile;

  // Step 1: Calculate Total Income
  const totalIncome = parentIncome;

  // Step 2: Calculate Allowances Against Income
  const federalTax = calculateFederalTaxAllowance(totalIncome, numberOfParents);
  const stateTax = calculateStateTaxAllowance(totalIncome, stateOfResidence);
  const socialSecurityTax = calculateSocialSecurityTax(totalIncome);
  const incomeProtection = getIncomeProtectionAllowance(
    numberOfParents,
    numberOfDependents,
    numberOfInCollege
  );
  const employmentAllowance = Math.min(totalIncome * 0.35, 4000); // 35% up to $4,000

  const totalAllowances = federalTax + stateTax + socialSecurityTax + 
                          incomeProtection + employmentAllowance;

  // Step 3: Calculate Available Income (AAI)
  const availableIncome = Math.max(0, totalIncome - totalAllowances);

  // Step 4: Calculate Contribution from Available Income (Progressive)
  let incomeContribution = 0;
  if (availableIncome <= 3409) {
    incomeContribution = availableIncome * 0.22;
  } else if (availableIncome <= 6802) {
    incomeContribution = 750 + (availableIncome - 3409) * 0.25;
  } else if (availableIncome <= 10212) {
    incomeContribution = 1598 + (availableIncome - 6802) * 0.29;
  } else if (availableIncome <= 13620) {
    incomeContribution = 2587 + (availableIncome - 10212) * 0.34;
  } else if (availableIncome <= 17029) {
    incomeContribution = 3745 + (availableIncome - 13620) * 0.40;
  } else {
    incomeContribution = 5109 + (availableIncome - 17029) * 0.47;
  }

  // Step 5: Calculate Asset Contribution
  const assetProtection = getAssetProtectionAllowance(parentAge, numberOfParents);
  const discretionaryNetWorth = Math.max(0, parentAssets - assetProtection);
  const assetContribution = discretionaryNetWorth * 0.12; // 12% asset conversion rate

  // Step 6: Calculate Adjusted Available Income
  const adjustedAvailableIncome = incomeContribution + assetContribution;

  // Step 7: Divide by number in college
  const parentContribution = adjustedAvailableIncome / numberOfInCollege;

  return {
    contribution: Math.round(parentContribution),
    availableIncome: Math.round(availableIncome),
    assetContribution: Math.round(assetContribution)
  };
}

/**
 * Calculate Student Contribution using Federal Methodology
 */
function calculateStudentContribution(profile: FinancialProfile): {
  contribution: number;
  availableIncome: number;
  assetContribution: number;
} {
  const { studentIncome, studentAssets = 0 } = profile;

  // Student Income Protection Allowance (2024-2025)
  const incomeProtection = 7600;

  // Calculate available income (50% assessment rate after protection)
  const availableIncome = Math.max(0, studentIncome - incomeProtection);
  const incomeContribution = availableIncome * 0.50;

  // Student assets (20% assessment rate, no protection allowance)
  const assetContribution = studentAssets * 0.20;

  return {
    contribution: Math.round(incomeContribution + assetContribution),
    availableIncome: Math.round(availableIncome),
    assetContribution: Math.round(assetContribution)
  };
}

/**
 * Calculate comprehensive EFC with detailed breakdown
 * Based on Federal Methodology (FM) formula
 */
export function calculateEFC(profile: FinancialProfile): EFCBreakdown {
  const isDependent = profile.isStudentDependent !== false; // Default to dependent

  let parentContribution = 0;
  let parentAvailableIncome = 0;
  let parentAssetContribution = 0;

  if (isDependent) {
    const parentCalc = calculateParentContribution(profile);
    parentContribution = parentCalc.contribution;
    parentAvailableIncome = parentCalc.availableIncome;
    parentAssetContribution = parentCalc.assetContribution;
  }

  const studentCalc = calculateStudentContribution(profile);
  const studentContribution = studentCalc.contribution;

  const totalEFC = Math.max(0, parentContribution + studentContribution);

  return {
    totalEFC: Math.round(totalEFC),
    parentContribution: Math.round(parentContribution),
    studentContribution: Math.round(studentContribution),
    breakdown: {
      parentAvailableIncome,
      parentAssetContribution,
      studentAvailableIncome: studentCalc.availableIncome,
      studentAssetContribution: studentCalc.assetContribution,
      adjustedAvailableIncome: parentAvailableIncome + parentAssetContribution
    }
  };
}

/**
 * Determine affordability tier based on EFC vs institution cost
 * Considers typical financial aid packages
 * 
 * @param efc - Expected Family Contribution
 * @param institutionCost - Annual total cost of attendance (tuition + room & board)
 * @param institutionType - Type of institution (affects typical aid)
 * @returns Comprehensive affordability assessment
 */
export function assessAffordability(
  efc: number,
  institutionCost: number,
  institutionType?: 'public' | 'private-nonprofit' | 'private-forprofit'
): AffordabilityResult {
  // Estimate typical grant aid based on EFC and institution type
  // Private non-profits typically offer more institutional aid
  let estimatedGrantAid = 0;
  
  if (efc === 0) {
    // Maximum Pell Grant + typical institutional aid
    estimatedGrantAid = institutionType === 'private-nonprofit' ? 
      institutionCost * 0.50 : // Private nonprofits average 50% for low EFC
      institutionCost * 0.35;  // Public schools average 35%
  } else if (efc < 10000) {
    // Partial Pell + some institutional aid
    const pellEligible = Math.max(0, 7395 - (efc * 0.10)); // Sliding Pell scale
    estimatedGrantAid = pellEligible + (institutionCost * 0.15);
  } else if (efc < 30000) {
    // Merit/need-based institutional aid only
    estimatedGrantAid = institutionType === 'private-nonprofit' ?
      institutionCost * 0.25 :
      institutionCost * 0.10;
  } else {
    // Higher EFC - minimal need-based aid, possible merit aid
    estimatedGrantAid = institutionCost * 0.05;
  }

  // Calculate estimated net price (what family actually pays)
  const estimatedNetPrice = Math.max(0, institutionCost - estimatedGrantAid);
  
  // Calculate affordability metrics
  const maxAffordableCost = efc * 1.5; // Allow some stretch (150% of EFC)
  const gapAmount = Math.max(0, estimatedNetPrice - efc);
  const ratio = estimatedNetPrice / (efc || 1); // Prevent division by zero

  let affordabilityTier: AffordabilityResult['affordabilityTier'];
  
  if (estimatedNetPrice <= efc * 0.8) {
    affordabilityTier = 'very-affordable'; // Net price ≤ 80% of EFC
  } else if (estimatedNetPrice <= efc * 1.2) {
    affordabilityTier = 'affordable'; // Net price ≤ 120% of EFC
  } else if (estimatedNetPrice <= efc * 1.5) {
    affordabilityTier = 'stretch'; // Net price ≤ 150% of EFC
  } else {
    affordabilityTier = 'reach'; // Net price > 150% of EFC
  }

  return {
    estimatedEFC: efc,
    affordabilityTier,
    maxAffordableCost,
    estimatedNetPrice: Math.round(estimatedNetPrice),
    gapAmount: Math.round(gapAmount)
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get affordability badge color and label
 */
export function getAffordabilityBadge(tier: AffordabilityResult['affordabilityTier']): {
  color: string;
  label: string;
  bgColor: string;
  description: string;
} {
  switch (tier) {
    case 'very-affordable':
      return {
        color: 'text-green-800',
        label: 'Very Affordable',
        bgColor: 'bg-green-100',
        description: 'Well within your budget with room to spare'
      };
    case 'affordable':
      return {
        color: 'text-blue-800',
        label: 'Affordable',
        bgColor: 'bg-blue-100',
        description: 'Manageable cost aligned with your financial capacity'
      };
    case 'stretch':
      return {
        color: 'text-yellow-800',
        label: 'Stretch',
        bgColor: 'bg-yellow-100',
        description: 'Requires loans or additional aid to bridge gap'
      };
    case 'reach':
      return {
        color: 'text-red-800',
        label: 'Financial Reach',
        bgColor: 'bg-red-100',
        description: 'Significant financial gap - explore additional aid options'
      };
  }
}

/**
 * Get institution type from control code
 */
export function getInstitutionType(controlCode?: number): 'public' | 'private-nonprofit' | 'private-forprofit' {
  if (controlCode === 1) return 'public';
  if (controlCode === 2) return 'private-nonprofit';
  return 'private-forprofit';
}

/**
 * Calculate monthly payment for student loans using standard 10-year repayment
 */
export function calculateMonthlyLoanPayment(loanAmount: number, interestRate: number = 0.055): number {
  const monthlyRate = interestRate / 12;
  const numberOfPayments = 120; // 10 years
  
  if (monthlyRate === 0) return loanAmount / numberOfPayments;
  
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  return Math.round(monthlyPayment);
}

/**
 * Estimate total 4-year debt burden
 */
export function estimateDebtBurden(
  efc: number,
  annualNetPrice: number,
  workStudyIncome: number = 3000 // Typical work-study earnings
): {
  totalDebt: number;
  monthlyPayment: number;
  debtToIncomeRatio: number; // Percentage of expected starting salary
  isManageable: boolean;
} {
  const annualGap = Math.max(0, annualNetPrice - efc - workStudyIncome);
  const totalDebt = annualGap * 4;
  const monthlyPayment = calculateMonthlyLoanPayment(totalDebt);
  
  // Rule of thumb: total debt should not exceed first year salary
  // Monthly payment should not exceed 10% of monthly income
  const estimatedStartingSalary = 45000; // National average for bachelor's degree
  const debtToIncomeRatio = (totalDebt / estimatedStartingSalary) * 100;
  const isManageable = debtToIncomeRatio <= 100 && monthlyPayment <= (estimatedStartingSalary / 12) * 0.10;
  
  return {
    totalDebt: Math.round(totalDebt),
    monthlyPayment,
    debtToIncomeRatio: Math.round(debtToIncomeRatio),
    isManageable
  };
}
