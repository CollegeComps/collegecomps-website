'use client';

import { useState, useEffect } from 'react';
import { CurrencyDollarIcon, CalculatorIcon } from '@heroicons/react/24/outline';

interface LoanCalculation {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
}

type RepaymentPlan = 'standard' | 'graduated';

export default function StudentLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState<string>('30000');
  const [interestRate, setInterestRate] = useState<string>('5.5');
  const [loanTerm, setLoanTerm] = useState<string>('10');
  const [repaymentPlan, setRepaymentPlan] = useState<RepaymentPlan>('standard');
  const [calculation, setCalculation] = useState<LoanCalculation | null>(null);

  useEffect(() => {
    calculateLoan();
  }, [loanAmount, interestRate, loanTerm, repaymentPlan]);

  const calculateLoan = () => {
    const principal = parseFloat(loanAmount) || 0;
    const rate = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
    const payments = (parseFloat(loanTerm) || 0) * 12; // Total number of payments

    if (principal <= 0 || rate <= 0 || payments <= 0) {
      setCalculation(null);
      return;
    }

    if (repaymentPlan === 'standard') {
      // Standard fixed monthly payment formula: M = P[r(1+r)^n]/[(1+r)^n-1]
      const monthlyPayment =
        principal * (rate * Math.pow(1 + rate, payments)) /
        (Math.pow(1 + rate, payments) - 1);
      
      const totalPayment = monthlyPayment * payments;
      const totalInterest = totalPayment - principal;

      setCalculation({
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        totalPayment: Math.round(totalPayment * 100) / 100,
      });
    } else {
      // Graduated payment plan (increases every 2 years)
      // Simplified: starts at 50% of standard, increases 7% every 2 years
      const standardPayment =
        principal * (rate * Math.pow(1 + rate, payments)) /
        (Math.pow(1 + rate, payments) - 1);
      
      let totalPaid = 0;
      let remainingBalance = principal;
      const yearlyPayments = 12;
      const yearsTotal = Math.ceil(payments / 12);

      for (let year = 0; year < yearsTotal; year++) {
        const periodMultiplier = 1 + (year * 0.035); // 3.5% increase per year (7% every 2 years)
        const yearPayment = standardPayment * periodMultiplier;
        
        const paymentsThisYear = Math.min(yearlyPayments, payments - (year * yearlyPayments));
        
        for (let month = 0; month < paymentsThisYear; month++) {
          const interestCharge = remainingBalance * rate;
          const principalPayment = yearPayment - interestCharge;
          remainingBalance = Math.max(0, remainingBalance - principalPayment);
          totalPaid += yearPayment;
        }
      }

      const avgMonthlyPayment = totalPaid / payments;
      const totalInterest = totalPaid - principal;

      setCalculation({
        monthlyPayment: Math.round(avgMonthlyPayment * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        totalPayment: Math.round(totalPaid * 100) / 100,
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-orange-500/10 border border-orange-500 p-3 rounded-lg">
          <CalculatorIcon className="h-6 w-6 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Student Loan Calculator</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Loan Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white font-medium"
                placeholder="30000"
                min="0"
                step="1000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Interest Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white font-medium"
                placeholder="5.5"
                min="0"
                max="20"
                step="0.1"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Loan Term (Years)
            </label>
            <input
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white font-medium"
              placeholder="10"
              min="1"
              max="30"
              step="1"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Repayment Plan
            </label>
            <select
              value={repaymentPlan}
              onChange={(e) => setRepaymentPlan(e.target.value as RepaymentPlan)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white font-medium"
            >
              <option value="standard">Standard (Fixed Payment)</option>
              <option value="graduated">Graduated (Increases Over Time)</option>
            </select>
            <p className="text-xs text-gray-400 font-medium mt-1">
              {repaymentPlan === 'standard' 
                ? 'Fixed monthly payment throughout the loan term'
                : 'Payments start lower and increase every 2 years'}
            </p>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {calculation ? (
            <>
              <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CurrencyDollarIcon className="h-5 w-5 text-orange-500" />
                  <h3 className="font-bold text-white">
                    {repaymentPlan === 'standard' ? 'Monthly Payment' : 'Average Monthly Payment'}
                  </h3>
                </div>
                <p className="text-4xl font-extrabold text-orange-500">
                  {formatCurrency(calculation.monthlyPayment)}
                </p>
                {repaymentPlan === 'graduated' && (
                  <p className="text-sm text-gray-300 font-medium mt-2">
                    Starting payment is lower, increases over time
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-sm font-bold text-gray-300 mb-1">Total Interest Paid</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(calculation.totalInterest)}
                  </p>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-sm font-bold text-gray-300 mb-1">Total Amount Paid</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(calculation.totalPayment)}
                  </p>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-sm font-bold text-gray-300 mb-1">Interest Rate Impact</p>
                  <p className="text-sm text-gray-300 font-medium">
                    You'll pay <strong className="text-orange-500">{formatCurrency(calculation.totalInterest)}</strong> in interest,
                    which is <strong className="text-orange-500">{Math.round((calculation.totalInterest / parseFloat(loanAmount)) * 100)}%</strong> of your original loan amount.
                  </p>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
                <p className="text-sm text-gray-300 font-medium">
                  <strong className="text-yellow-400">Tip:</strong> Making extra payments toward the principal can significantly reduce your total interest paid and shorten your loan term.
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <CalculatorIcon className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg font-bold text-white">Enter loan details to see calculations</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
