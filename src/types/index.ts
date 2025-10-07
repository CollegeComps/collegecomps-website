// Types for ROI Calculator
export interface Institution {
  id: number;
  unitid: number;
  name: string;
  city: string;
  state: string;
  control: 'Public' | 'Private nonprofit' | 'Private for-profit';
  ownership: number;
  website?: string;
  tuition_in_state?: number;
  tuition_out_state?: number;
  earnings_6_years?: number;
  earnings_10_years?: number;
  completion_rate?: number;
  retention_rate?: number;
  median_debt?: number;
}

export interface Program {
  id: number;
  unitid: number;
  cipcode: string;
  cip_title: string;
  completions: number;
  credential_level: number;
  distance_education: boolean;
}

export interface ROICalculation {
  totalCost: number;
  expectedEarnings: number;
  netROI: number;
  roiPercentage: number;
  paybackPeriod: number;
  breakEvenPoint: number;
}

export interface CostInputs {
  tuition: number;
  fees: number;
  roomBoard: number;
  books: number;
  otherExpenses: number;
  programLength: number; // years
  residency: 'in-state' | 'out-of-state' | 'n/a';
}

export interface EarningsInputs {
  baselineSalary: number; // salary without degree
  projectedSalary: number; // salary with degree
  careerLength: number; // years
  salaryGrowthRate: number; // annual percentage
}

export interface FinancialAid {
  grants: number;
  scholarships: number;
  workStudy: number;
  loans: number;
  interestRate: number;
}