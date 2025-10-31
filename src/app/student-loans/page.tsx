import StudentLoanCalculator from '@/components/StudentLoanCalculator';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Loan Calculator | CollegeComps',
  description: 'Calculate your monthly student loan payments, total interest, and explore different repayment plans. Free student loan calculator with standard and graduated payment options.',
  keywords: ['student loan calculator', 'loan repayment', 'monthly payment calculator', 'student debt', 'loan interest calculator'],
};

export default function StudentLoanCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-bold mb-4">
            Student Loan Calculator
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Plan your student loan repayment strategy. Calculate monthly payments, total interest, and compare different repayment plans to make informed financial decisions.
          </p>
        </div>

        <StudentLoanCalculator />

        <div className="mt-12 bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-white font-bold mb-6">Understanding Your Student Loans</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white font-bold mb-3">Repayment Plans</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white font-bold mb-1">Standard Repayment</h4>
                  <p className="text-sm text-gray-300">
                    Fixed monthly payments over 10 years. You'll pay the same amount each month, making budgeting easier. This plan typically results in the lowest total interest paid.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-white font-bold mb-1">Graduated Repayment</h4>
                  <p className="text-sm text-gray-300">
                    Payments start lower and increase every 2 years over 10 years. Good if you expect your income to grow. You'll pay more interest overall compared to standard repayment.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white font-bold mb-3">Tips to Save Money</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span><strong>Make extra payments:</strong> Apply extra money directly to the principal to reduce interest and pay off faster.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span><strong>Bi-weekly payments:</strong> Pay half your monthly amount every two weeks to make an extra payment per year.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span><strong>Refinance if rates drop:</strong> Lower interest rates can save thousands over the life of your loan.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span><strong>Auto-pay discount:</strong> Many lenders offer 0.25% rate reduction for automatic payments.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-orange-500/10 border border-orange-500 rounded-lg p-6">
            <h3 className="font-semibold text-white font-bold mb-2">📚 Important Notes</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• This calculator provides estimates. Actual payments may vary based on your lender and loan terms.</li>
              <li>• Federal student loans may have additional repayment options including income-driven plans.</li>
              <li>• Consider talking to a financial advisor for personalized loan repayment strategies.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
