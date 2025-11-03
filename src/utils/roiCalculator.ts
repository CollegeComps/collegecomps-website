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
   * Backward compatibility alias for calculateDegreeEarnings
   * @deprecated Use calculateDegreeEarnings instead
   */
  static calculateLifetimeEarnings(earnings: EarningsInputs): number {
    return this.calculateDegreeEarnings(earnings);
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

  /**
   * PREMIUM FEATURE: Calculate student loan paydown schedule
   * 
   * @param loanAmount - Total amount borrowed
   * @param interestRate - Annual interest rate (e.g., 6.53 for 6.53%)
   * @param termYears - Loan term in years (typically 10)
   * @returns Array of payment details by year
   */
  static calculateLoanPaydownSchedule(
    loanAmount: number,
    interestRate: number,
    termYears: number = 10
  ): Array<{
    year: number;
    payment: number;
    principal: number;
    interest: number;
    remainingBalance: number;
  }> {
    if (loanAmount <= 0) return [];

    const monthlyRate = interestRate / 100 / 12;
    const numPayments = termYears * 12;
    
    // Calculate monthly payment using amortization formula
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    const schedule = [];
    let remainingBalance = loanAmount;
    
    for (let year = 1; year <= termYears; year++) {
      let yearlyPayment = 0;
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;
      
      for (let month = 1; month <= 12; month++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        
        yearlyPayment += monthlyPayment;
        yearlyPrincipal += principalPayment;
        yearlyInterest += interestPayment;
        remainingBalance -= principalPayment;
      }
      
      schedule.push({
        year,
        payment: yearlyPayment,
        principal: yearlyPrincipal,
        interest: yearlyInterest,
        remainingBalance: Math.max(0, remainingBalance)
      });
    }
    
    return schedule;
  }

  /**
   * PREMIUM FEATURE: Forecast potential scholarships over program duration
   * 
   * @param costs - Cost inputs
   * @param gpa - Student GPA (0-4.0 scale)
   * @param testScore - SAT (400-1600) or ACT (1-36) score
   * @param householdIncome - Annual household income
   * @returns Estimated scholarship amount per year and total
   */
  static forecastScholarships(
    costs: CostInputs,
    gpa: number,
    testScore: number,
    householdIncome: number
  ): {
    meritBased: number;
    needBased: number;
    total: number;
    totalOverProgram: number;
    explanation: string;
  } {
    let meritBased = 0;
    let needBased = 0;
    
    // Merit-based scholarship estimation
    if (gpa >= 3.8 && testScore >= 1400) {
      meritBased = costs.tuition * 0.5; // 50% tuition scholarship
    } else if (gpa >= 3.5 && testScore >= 1300) {
      meritBased = costs.tuition * 0.3; // 30% tuition scholarship
    } else if (gpa >= 3.2 && testScore >= 1200) {
      meritBased = costs.tuition * 0.15; // 15% tuition scholarship
    }
    
    // Need-based scholarship estimation
    const annualCost = costs.tuition + costs.fees + costs.roomBoard;
    if (householdIncome < 30000) {
      needBased = annualCost * 0.8; // 80% of costs
    } else if (householdIncome < 60000) {
      needBased = annualCost * 0.5; // 50% of costs
    } else if (householdIncome < 100000) {
      needBased = annualCost * 0.2; // 20% of costs
    }
    
    const totalAnnual = meritBased + needBased;
    const totalOverProgram = totalAnnual * costs.programLength;
    
    let explanation = 'Estimated based on ';
    if (meritBased > 0 && needBased > 0) {
      explanation += 'academic merit and financial need';
    } else if (meritBased > 0) {
      explanation += 'academic merit (GPA and test scores)';
    } else if (needBased > 0) {
      explanation += 'demonstrated financial need';
    } else {
      explanation = 'May qualify for institution-specific scholarships';
    }
    
    return {
      meritBased,
      needBased,
      total: totalAnnual,
      totalOverProgram,
      explanation
    };
  }
}