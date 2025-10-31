import ROICalculatorApp from '@/components/ROICalculatorApp';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function ROICalculatorPage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-bold mb-2">
            ROI Calculator
          </h1>
          <p className="text-gray-300 text-lg">
            Calculate the return on investment for different college programs and institutions using real financial data.
          </p>
        </div>
        
        <ErrorBoundary>
          <ROICalculatorApp />
        </ErrorBoundary>
      </div>
    </div>
  );
}