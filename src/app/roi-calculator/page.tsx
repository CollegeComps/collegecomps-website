import ROICalculatorApp from '@/components/ROICalculatorApp';

export default function ROICalculatorPage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ROI Calculator
          </h1>
          <p className="text-gray-600 text-lg">
            Calculate the return on investment for different college programs and institutions using real financial data.
          </p>
        </div>
        
        <ROICalculatorApp />
      </div>
    </div>
  );
}