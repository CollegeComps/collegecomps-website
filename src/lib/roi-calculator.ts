/**
 * ROI Calculation Library
 * ======================
 * Comprehensive ROI calculations with configurable cost components
 * 
 * ROI Formula:
 * ROI = (Future Earnings - Costs) over specified time period
 * 
 * Cost Components (configurable):
 * - Tuition & Fees (required)
 * - Room & Board (optional - user can include/exclude)
 * - Books & Supplies (optional)
 * - Other expenses (optional)
 * 
 * Earnings Model:
 * - Uses College Scorecard 10-year median earnings
 * - Compares against baseline (high school graduate earnings OR national median)
 * - Projects over 30-40 year career
 */

export interface ROICalculationOptions {
  // Cost inputs
  annualTuition: number;
  annualFees: number;
  annualRoomBoard?: number; // Optional
  annualBooksSupplies?: number; // Optional  
  yearsOfStudy: number; // Usually 4, but could be 2 for associates
  
  // Earnings inputs
  medianEarnings10Yr: number; // From College Scorecard
  baselineEarnings?: number; // Comparison baseline (default: high school grad earnings)
  
  // Calculation parameters
  includeRoomBoard: boolean; // User choice
  includeBooksSupplies: boolean; // User choice
  careerYears: number; // Default 30 years
  discountRate?: number; // For NPV calculations (default 3%)
}

export interface ROIResult {
  // Cost breakdown
  totalTuitionFees: number;
  totalRoomBoard: number;
  totalBooksSupplies: number;
  totalCostWithAllExpenses: number;
  totalCostTuitionOnly: number; // Excluding room & board
  
  // Earnings projections
  estimatedAnnualEarnings: number;
  baselineAnnualEarnings: number;
  annualEarningsPremium: number;
  
  // ROI calculations
  lifetimeEarningsPremium: number; // Over career years
  netROI: number; // Lifetime premium - total cost
  netROITuitionOnly: number; // Premium - tuition only (no room/board)
  
  // Percentages and metrics
  roiPercentage: number; // (Net ROI / Total Cost) * 100
  roiPercentageTuitionOnly: number;
  paybackYears: number; // Years to recover investment
  paybackYearsTuitionOnly: number;
  
  // Annual returns
  averageAnnualReturn: number; // ROI / career years
  averageAnnualReturnPercentage: number;
}

/**
 * Calculate comprehensive ROI with all options
 */
export function calculateROI(options: ROICalculationOptions): ROIResult {
  // Set defaults
  const {
    annualTuition,
    annualFees,
    annualRoomBoard = 0,
    annualBooksSupplies = 0,
    yearsOfStudy,
    medianEarnings10Yr,
    baselineEarnings = 40000, // Approximate high school graduate earnings
    includeRoomBoard,
    includeBooksSupplies,
    careerYears = 30,
  } = options;
  
  // Calculate total costs
  const annualTuitionAndFees = annualTuition + annualFees;
  const totalTuitionFees = annualTuitionAndFees * yearsOfStudy;
  const totalRoomBoard = annualRoomBoard * yearsOfStudy;
  const totalBooksSupplies = annualBooksSupplies * yearsOfStudy;
  
  // Total cost calculation based on user preferences
  let totalCost = totalTuitionFees;
  if (includeRoomBoard) totalCost += totalRoomBoard;
  if (includeBooksSupplies) totalCost += totalBooksSupplies;
  
  const totalCostWithAllExpenses = totalTuitionFees + totalRoomBoard + totalBooksSupplies;
  const totalCostTuitionOnly = totalTuitionFees;
  
  // Earnings calculations
  const estimatedAnnualEarnings = medianEarnings10Yr;
  const annualEarningsPremium = estimatedAnnualEarnings - baselineEarnings;
  
  // Lifetime earnings premium
  const lifetimeEarningsPremium = annualEarningsPremium * careerYears;
  
  // Net ROI calculations
  const netROI = lifetimeEarningsPremium - totalCost;
  const netROIWithAllCosts = lifetimeEarningsPremium - totalCostWithAllExpenses;
  const netROITuitionOnly = lifetimeEarningsPremium - totalCostTuitionOnly;
  
  // Percentage returns
  const roiPercentage = totalCost > 0 ? (netROI / totalCost) * 100 : 0;
  const roiPercentageTuitionOnly = totalCostTuitionOnly > 0 
    ? (netROITuitionOnly / totalCostTuitionOnly) * 100 
    : 0;
  
  // Payback period
  const paybackYears = annualEarningsPremium > 0 
    ? totalCost / annualEarningsPremium 
    : Infinity;
  const paybackYearsTuitionOnly = annualEarningsPremium > 0
    ? totalCostTuitionOnly / annualEarningsPremium
    : Infinity;
  
  // Annual returns
  const averageAnnualReturn = netROI / careerYears;
  const averageAnnualReturnPercentage = roiPercentage / careerYears;
  
  return {
    // Costs
    totalTuitionFees,
    totalRoomBoard,
    totalBooksSupplies,
    totalCostWithAllExpenses,
    totalCostTuitionOnly,
    
    // Earnings
    estimatedAnnualEarnings,
    baselineAnnualEarnings: baselineEarnings,
    annualEarningsPremium,
    
    // ROI
    lifetimeEarningsPremium,
    netROI,
    netROITuitionOnly,
    
    // Percentages
    roiPercentage,
    roiPercentageTuitionOnly,
    paybackYears,
    paybackYearsTuitionOnly,
    
    // Annual
    averageAnnualReturn,
    averageAnnualReturnPercentage,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (compact && Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format years for display
 */
export function formatYears(value: number): string {
  if (value === Infinity) return 'Never';
  if (value < 1) return 'Less than 1 year';
  if (value === 1) return '1 year';
  return `${value.toFixed(1)} years`;
}

/**
 * Example usage and test
 */
export function exampleROICalculation() {
  const options: ROICalculationOptions = {
    annualTuition: 35000,
    annualFees: 2000,
    annualRoomBoard: 12000,
    annualBooksSupplies: 1200,
    yearsOfStudy: 4,
    medianEarnings10Yr: 75000,
    baselineEarnings: 40000,
    includeRoomBoard: false, // User choice: exclude room & board
    includeBooksSupplies: false,
    careerYears: 30,
  };
  
  const result = calculateROI(options);
  
  console.log('='.repeat(60));
  console.log('ROI Calculation Example');
  console.log('='.repeat(60));
  console.log('\nCost Breakdown:');
  console.log(`  Tuition & Fees (4 years): ${formatCurrency(result.totalTuitionFees)}`);
  console.log(`  Room & Board (4 years): ${formatCurrency(result.totalRoomBoard)}`);
  console.log(`  Total Cost (selected components): ${formatCurrency(result.totalCostTuitionOnly)}`);
  console.log('\nEarnings:');
  console.log(`  Estimated Annual Earnings: ${formatCurrency(result.estimatedAnnualEarnings)}`);
  console.log(`  Baseline (High School): ${formatCurrency(result.baselineAnnualEarnings)}`);
  console.log(`  Annual Premium: ${formatCurrency(result.annualEarningsPremium)}`);
  console.log('\nROI (Tuition Only):');
  console.log(`  Net ROI (30 years): ${formatCurrency(result.netROITuitionOnly)}`);
  console.log(`  ROI Percentage: ${formatPercentage(result.roiPercentageTuitionOnly)}`);
  console.log(`  Payback Period: ${formatYears(result.paybackYearsTuitionOnly)}`);
  console.log('='.repeat(60));
  
  return result;
}
