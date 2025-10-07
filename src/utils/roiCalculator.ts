import { ROICalculation, CostInputs, EarningsInputs, FinancialAid } from '@/types';

export class ROICalculator {
  /**
   * Calculate the total cost of education
   */
  static calculateTotalCost(costs: CostInputs, financialAid?: FinancialAid): number {
    const annualCost = costs.tuition + costs.fees + costs.roomBoard + costs.books + costs.otherExpenses;
    const totalCost = annualCost * costs.programLength;
    
    if (financialAid) {
      const totalAid = (financialAid.grants + financialAid.scholarships + financialAid.workStudy) * costs.programLength;
      return Math.max(0, totalCost - totalAid);
    }
    
    return totalCost;
  }

  /**
   * Calculate projected lifetime earnings with degree
   */
  static calculateLifetimeEarnings(earnings: EarningsInputs): number {
    let totalEarnings = 0;
    let currentSalary = earnings.projectedSalary;
    
    for (let year = 1; year <= earnings.careerLength; year++) {
      totalEarnings += currentSalary;
      currentSalary *= (1 + earnings.salaryGrowthRate / 100);
    }
    
    return totalEarnings;
  }

  /**
   * Calculate baseline earnings without degree
   */
  static calculateBaselineEarnings(earnings: EarningsInputs): number {
    let totalEarnings = 0;
    let currentSalary = earnings.baselineSalary;
    
    for (let year = 1; year <= earnings.careerLength; year++) {
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
   * Calculate comprehensive ROI
   */
  static calculateROI(costs: CostInputs, earnings: EarningsInputs, financialAid?: FinancialAid): ROICalculation {
    const totalCost = this.calculateTotalCost(costs, financialAid);
    const lifetimeEarningsWithDegree = this.calculateLifetimeEarnings(earnings);
    const baselineEarnings = this.calculateBaselineEarnings(earnings);
    const expectedEarnings = lifetimeEarningsWithDegree - baselineEarnings;
    
    const netROI = expectedEarnings - totalCost;
    const roiPercentage = totalCost > 0 ? (netROI / totalCost) * 100 : 0;
    
    const annualSalaryIncrease = earnings.projectedSalary - earnings.baselineSalary;
    const paybackPeriod = this.calculatePaybackPeriod(totalCost, annualSalaryIncrease);
    
    const breakEvenPoint = totalCost; // Point where cumulative extra earnings equal total cost

    return {
      totalCost,
      expectedEarnings,
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