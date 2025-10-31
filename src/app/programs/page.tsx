export default function ProgramsPage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Program Analysis
          </h1>
          <p className="text-gray-600 text-lg">
            Analyze career outcomes and earnings potential across different academic programs and fields of study.
          </p>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Coming Soon
          </h3>
          <p className="text-gray-600">
            Program analysis features are being developed. This will include detailed career outcome data, 
            earnings projections by field of study, and comparative analysis tools.
          </p>
        </div>
      </div>
    </div>
  );
}