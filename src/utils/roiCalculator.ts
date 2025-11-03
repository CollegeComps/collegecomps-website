import { ROICalculation, CostInputs, EarningsInputs, FinancialAid } from '@/types';

export class ROICalculator {
  /**
   * Calculate Total Cost of Attendance (COA)
   * COA = Tuition + Fees + Room & Board + Books & Supplies + Transportation + Personal Expenses
   */
  static calculateCostOfAttendance(costs: CostInputs): number {
    const annualCOA = costs.tuition + costs.fees + costs.roomBoard + costs.books + costs.otherExpenses;
    return annualCOA * costs.programLength;
  }

  /**
   * Calculate Total Cost of Degree
   * Total Cost of Degree = COA - (Grants + Scholarships)
   * Note: Work-study and loans are NOT subtracted as they are earned income or debt
   */
  static calculateTotalCost(costs: CostInputs, financialAid?: FinancialAid): number {
    const totalCOA = this.calculateCostOfAttendance(costs);
    
    if (financialAid) {
      // Only subtract grants and scholarships (free money)
      // Work-study is earned, loans must be repaid
      const totalGiftAid = (financialAid.grants + financialAid.scholarships) * costs.programLength;
      return Math.max(0, totalCOA - totalGiftAid);
    }
    
    return totalCOA;
  }

  /**
   * Calculate Total Degree-Based Earnings
   * Assumes 40-year career with first 4 years as college investment period
   * Earnings begin in year 5 (after graduation)
   */
  static calculateDegreeEarnings(earnings: EarningsInputs, programLength: number = 4): number {
    let totalEarnings = 0;
    let currentSalary = earnings.projectedSalary;
    
    // Career starts after program completion
    // Default to 40 years of earning, but respect user's career length setting
    const careerYears = 40; // Fixed at 40 years per spec
    
    for (let year = 1; year <= careerYears; year++) {
      totalEarnings += currentSalary;
      currentSalary *= (1 + earnings.salaryGrowthRate / 100);
    }
    
    return totalEarnings;
  }

  /**
   * Calculate baseline earnings without degree over same 40-year period
   */
  static calculateBaselineEarnings(earnings: EarningsInputs): number {
    let totalEarnings = 0;
    let currentSalary = earnings.baselineSalary;
    
    // 40-year career (same as degree path, but starts immediately)
    const careerYears = 40;
    
    for (let year = 1; year <= careerYears; year++) {
      totalEarnings += currentSalary;
      currentSalary *= (1 + earnings.salaryGrowthRate / 100);
    }
    
    return totalEarnings;
  }

  /**
   * Calculate payback period in years
   */
  static calculatePaybackPeriod(totalCost: number, annualSalaryIncrease: number): number {
    if (annualSalaryIncrease <= 0) return Infinity;
    return totalCost / annualSalaryIncrease;
  }

  /**
   * Calculate comprehensive ROI using new formula
   * 
   * ROI Formula (ENG-283):
   * College ROI = (Total Degree-Based Earnings - Total Cost of Degree) / Total Cost of Degree × 100%
   * 
   * Where:
   * - Total Degree-Based Earnings = 40-year career starting after graduation
   * - Total Cost of Degree = COA - (Grants + Scholarships)
   * - COA = Tuition + Fees + Room & Board + Books + Supplies + Transportation + Personal
   */
  static calculateROI(costs: CostInputs, earnings: EarningsInputs, financialAid?: FinancialAid): ROICalculation {
    // Calculate Total Cost of Degree (net of grants/scholarships only)
    const totalCostOfDegree = this.calculateTotalCost(costs, financialAid);
    
    // Validate earnings data - if projected salary is suspiciously low, use baseline as fallback
    const MIN_REASONABLE_SALARY = 20000; // $20K minimum threshold
    const projectedSalary = earnings.projectedSalary >= MIN_REASONABLE_SALARY 
      ? earnings.projectedSalary 
      : earnings.baselineSalary;
    
    // Use the validated salary for calculations
    const validatedEarnings = { ...earnings, projectedSalary };
    
    // Calculate Total Degree-Based Earnings (40-year career post-graduation)
    const degreeEarnings = this.calculateDegreeEarnings(validatedEarnings, costs.programLength);
    const baselineEarnings = this.calculateBaselineEarnings(validatedEarnings);
    
    // Total earnings benefit from degree
    const totalDegreeBasedEarnings = degreeEarnings - baselineEarnings;
    
    // Net ROI = Total Degree-Based Earnings - Total Cost of Degree
    const netROI = totalDegreeBasedEarnings - totalCostOfDegree;
    
    // ROI Percentage = (Net ROI / Total Cost of Degree) × 100%
    const roiPercentage = totalCostOfDegree > 0 
      ? (netROI / totalCostOfDegree) * 100 
      : 0;
    
    // Calculate payback period
    const annualSalaryIncrease = validatedEarnings.projectedSalary - validatedEarnings.baselineSalary;
    const paybackPeriod = this.calculatePaybackPeriod(totalCostOfDegree, annualSalaryIncrease);
    
    const breakEvenPoint = totalCostOfDegree; // Point where cumulative extra earnings equal total cost

    return {
      totalCost: totalCostOfDegree,
      expectedEarnings: totalDegreeBasedEarnings,
      netROI,
      roiPercentage,
      paybackPeriod,
      breakEvenPoint
    };
  }

  /**
   * Calculate net present value (NPV) of investment
   */
  static calculateNPV(costs: CostInputs, earnings: EarningsInputs, discountRate: number = 3): number {
    const totalCost = this.calculateTotalCost(costs);
    let npv = -totalCost; // Initial investment (negative)
    
    const annualBenefit = earnings.projectedSalary - earnings.baselineSalary;
    
    for (let year = 1; year <= earnings.careerLength; year++) {
      const presentValue = annualBenefit / Math.pow(1 + discountRate / 100, year);
      npv += presentValue;
    }
    
    return npv;
  }

  /**
   * Format currency values
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format percentage values
   */
  static formatPercentage(percentage: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(percentage / 100);
  }
}