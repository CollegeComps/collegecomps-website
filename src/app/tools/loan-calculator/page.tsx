'use client';

import { useState, useEffect } from 'react';
import { DataSourcesBadge } from '@/components/DataSources';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  CurrencyDollarIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface LoanCalculation {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  payoffDate: Date;
  amortizationSchedule: AmortizationEntry[];
}

interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

const REPAYMENT_PLANS = [
  { id: 'standard', name: 'Standard (10 years)', years: 10 },
  { id: 'extended', name: 'Extended (25 years)', years: 25 },
  { id: 'graduated', name: 'Graduated (10 years)', years: 10 },
];

export default function LoanCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState<string>('30000');
  const [interestRate, setInterestRate] = useState<string>('6.5');
  const [repaymentPlan, setRepaymentPlan] = useState<string>('standard');
  const [calculation, setCalculation] = useState<LoanCalculation | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    calculateLoan();
  }, [loanAmount, interestRate, repaymentPlan]);

  const calculateLoan = () => {
    const principal = parseFloat(loanAmount) || 0;
    const annualRate = parseFloat(interestRate) || 0;
    const monthlyRate = annualRate / 100 / 12;
    
    const plan = REPAYMENT_PLANS.find(p => p.id === repaymentPlan);
    const months = (plan?.years || 10) * 12;

    if (principal <= 0 || annualRate < 0 || months <= 0) {
      setCalculation(null);
      return;
    }

    // Calculate monthly payment using standard loan formula
    // M = P * [r(1+r)^n] / [(1+r)^n - 1]
    let monthlyPayment: number;
    if (monthlyRate === 0) {
      monthlyPayment = principal / months;
    } else {
      monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                      (Math.pow(1 + monthlyRate, months) - 1);
    }

    // Generate amortization schedule
    let balance = principal;
    const schedule: AmortizationEntry[] = [];
    
    for (let month = 1; month <= months; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;

      // Prevent negative balance due to rounding
      if (balance < 0) balance = 0;

      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance
      });
    }

    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - principal;
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + months);

    setCalculation({
      monthlyPayment,
      totalPayment,
      totalInterest,
      payoffDate,
      amortizationSchedule: schedule
    });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white font-bold">Student Loan Calculator</h1>
            <p className="mt-2 text-gray-300">
              Calculate your monthly payment, total cost, and payoff timeline for student loans
            </p>
            <div className="mt-4">
              <DataSourcesBadge />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-white font-bold mb-6">Loan Details</h2>
              
              <div className="space-y-6">
                {/* Loan Amount */}
                <div>
                  <label className="block text-sm font-bold text-white font-bold mb-2">
                    <CurrencyDollarIcon className="w-5 h-5 inline mr-2" />
                    Loan Amount
                  </label>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="w-full p-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white font-bold font-semibold text-lg"
                    placeholder="30000"
                    min="0"
                    step="1000"
                  />
                  <p className="mt-1 text-sm text-gray-300">
                    Total amount you need to borrow
                  </p>
                </div>

                {/* Interest Rate */}
                <div>
                  <label className="block text-sm font-bold text-white font-bold mb-2">
                    <ChartBarIcon className="w-5 h-5 inline mr-2" />
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full p-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white font-bold font-semibold text-lg"
                    placeholder="6.5"
                    min="0"
                    max="20"
                    step="0.1"
                  />
                  <p className="mt-1 text-sm text-gray-300">
                    Annual interest rate (Federal loans: 5.5-8%)
                  </p>
                </div>

                {/* Repayment Plan */}
                <div>
                  <label className="block text-sm font-bold text-white font-bold mb-2">
                    <CalendarIcon className="w-5 h-5 inline mr-2" />
                    Repayment Plan
                  </label>
                  <select
                    value={repaymentPlan}
                    onChange={(e) => setRepaymentPlan(e.target.value)}
                    className="w-full p-3 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white font-bold bg-gray-900"
                  >
                    {REPAYMENT_PLANS.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-300">
                    Choose your repayment term
                  </p>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-white font-bold mb-6">Payment Summary</h2>
              
              {calculation ? (
                <div className="space-y-6">
                  {/* Monthly Payment */}
                  <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white font-bold">Monthly Payment</p>
                        <p className="text-3xl font-bold text-white font-bold mt-1">
                          ${calculation.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <ClockIcon className="w-12 h-12 text-orange-500" />
                    </div>
                  </div>

                  {/* Total Payment */}
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="text-sm font-medium text-gray-300">Total Amount Paid</p>
                    <p className="text-2xl font-bold text-white font-bold mt-1">
                      ${calculation.totalPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Total Interest */}
                  <div className="border-l-4 border-orange-500 pl-4">
                    <p className="text-sm font-medium text-gray-300">Total Interest</p>
                    <p className="text-2xl font-bold text-white font-bold mt-1">
                      ${calculation.totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                      {((calculation.totalInterest / parseFloat(loanAmount)) * 100).toFixed(1)}% of loan amount
                    </p>
                  </div>

                  {/* Payoff Date */}
                  <div className="border-l-4 border-purple-500 pl-4">
                    <p className="text-sm font-medium text-gray-300">Payoff Date</p>
                    <p className="text-2xl font-bold text-white font-bold mt-1">
                      {calculation.payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Amortization Schedule Button */}
                  <button
                    onClick={() => setShowSchedule(!showSchedule)}
                    className="w-full mt-6 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors shadow-lg"
                  >
                    {showSchedule ? 'Hide' : 'View'} Payment Schedule
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <ChartBarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Enter loan details to see calculations</p>
                </div>
              )}
            </div>
          </div>

          {/* Amortization Schedule */}
          {showSchedule && calculation && (
            <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-white font-bold mb-4">Payment Schedule</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800 border-b-2 border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-white font-bold">Month</th>
                      <th className="px-4 py-3 text-right font-semibold text-white font-bold">Payment</th>
                      <th className="px-4 py-3 text-right font-semibold text-white font-bold">Principal</th>
                      <th className="px-4 py-3 text-right font-semibold text-white font-bold">Interest</th>
                      <th className="px-4 py-3 text-right font-semibold text-white font-bold">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {calculation.amortizationSchedule.filter((_, idx) => idx % 12 === 0 || idx === calculation.amortizationSchedule.length - 1).map((entry) => (
                      <tr key={entry.month} className="hover:bg-gray-800">
                        <td className="px-4 py-3 font-medium text-white font-bold">
                          Year {Math.ceil(entry.month / 12)}
                        </td>
                        <td className="px-4 py-3 text-right text-white font-bold">
                          ${entry.payment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600 font-medium">
                          ${entry.principal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right text-orange-600 font-medium">
                          ${entry.interest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-white font-bold">
                          ${entry.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-gray-300">
                *Showing yearly snapshots. Full monthly schedule calculated in the background.
              </p>
            </div>
          )}

          {/* Educational Content */}
          <div className="mt-8 bg-orange-500/10 border border-orange-500 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white font-bold mb-3">Understanding Student Loans</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white font-bold">
              <div>
                <h4 className="font-semibold mb-2">Federal Loan Rates (2024-25)</h4>
                <ul className="space-y-1">
                  <li>• Undergraduate: 5.50%</li>
                  <li>• Graduate: 7.05%</li>
                  <li>• PLUS loans: 8.05%</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Repayment Tips</h4>
                <ul className="space-y-1">
                  <li>• Make payments while in school</li>
                  <li>• Consider refinancing for lower rates</li>
                  <li>• Pay extra toward principal when possible</li>
                  <li>• Explore income-driven repayment plans</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
