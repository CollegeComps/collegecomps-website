import { 
  AcademicCapIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  DocumentTextIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Methodology | CollegeComps',
  description: 'Learn about our data sources, calculations, and methodology for college ROI analysis',
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-bold mb-4">
            Our Methodology
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transparent, data-driven analysis to help you make informed college decisions
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_8px_rgba(249,115,22,0.06)] border p-6">
            <div className="w-12 h-12 bg-orange-500/20 border border-orange-500 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheckIcon className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-white font-bold mb-2">Trusted Data</h3>
            <p className="text-sm text-gray-300">
              We use official government data from IPEDS and College Scorecard
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_8px_rgba(249,115,22,0.06)] border p-6">
            <div className="w-12 h-12 bg-orange-500/20 border border-orange-500 rounded-lg flex items-center justify-center mb-4">
              <ClockIcon className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-white font-bold mb-2">Regular Updates</h3>
            <p className="text-sm text-gray-300">
              Data is updated annually when new federal data is released
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_8px_rgba(249,115,22,0.06)] border p-6">
            <div className="w-12 h-12 bg-orange-500/20 border border-orange-500 rounded-lg flex items-center justify-center mb-4">
              <ChartBarIcon className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-white font-bold mb-2">Clear Calculations</h3>
            <p className="text-sm text-gray-300">
              All formulas are transparent and based on standard financial analysis
            </p>
          </div>
        </div>

        {/* Data Sources Section */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_8px_rgba(249,115,22,0.06)] border p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <GlobeAltIcon className="w-8 h-8 text-orange-500" />
            <h2 className="text-2xl font-bold text-white font-bold">Data Sources</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white font-bold mb-2">
                1. Integrated Postsecondary Education Data System (IPEDS)
              </h3>
              <p className="text-gray-300 mb-2">
                <strong>Source:</strong> U.S. Department of Education, National Center for Education Statistics
              </p>
              <p className="text-gray-300 mb-2">
                IPEDS is the primary source for comprehensive data about U.S. colleges and universities. We collect:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                <li>Institution information (name, location, control, type)</li>
                <li>Enrollment data (undergraduate, graduate, demographics)</li>
                <li>Admissions data (acceptance rates, SAT/ACT scores)</li>
                <li>Tuition and fees</li>
                <li>Program offerings and completion data</li>
                <li>Student characteristics and demographics</li>
              </ul>
              <p className="text-sm text-gray-400 mt-2">
                Coverage: 6,163 institutions • Updated: Annually
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white font-bold mb-2">
                2. College Scorecard
              </h3>
              <p className="text-gray-300 mb-2">
                <strong>Source:</strong> U.S. Department of Education
              </p>
              <p className="text-gray-300 mb-2">
                College Scorecard provides earnings and debt data linked to federal financial aid records:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                <li>Median earnings 6 years after entry</li>
                <li>Median earnings 10 years after entry</li>
                <li>Student loan debt amounts</li>
                <li>Completion rates</li>
                <li>Net price after financial aid</li>
              </ul>
              <p className="text-sm text-gray-400 mt-2">
                Coverage: 3,209 institutions with ROI data (52.1%) • Updated: Annually
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white font-bold mb-2">
                3. Program-Level Data
              </h3>
              <p className="text-gray-300 mb-2">
                <strong>Source:</strong> IPEDS Completions Survey & Field of Study Earnings
              </p>
              <p className="text-gray-300 mb-2">
                Detailed program outcomes by CIP code:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                <li>Program completions by degree level</li>
                <li>Field-specific earnings data</li>
                <li>Program growth trends</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ROI Calculation Section */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_8px_rgba(249,115,22,0.06)] border p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <DocumentTextIcon className="w-8 h-8 text-orange-500" />
            <h2 className="text-2xl font-bold text-white font-bold">ROI Calculations</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white font-bold mb-3">Institution-Level ROI</h3>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-3">
                <p className="font-mono text-sm text-white font-bold">
                  ROI = (Median Earnings × 30 Years) - Total Cost
                </p>
              </div>
              <p className="text-gray-300 mb-2">
                <strong>Components:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                <li><strong>Median Earnings:</strong> 10-year post-entry median earnings from College Scorecard</li>
                <li><strong>40-Year Time Horizon:</strong> Standard ROI time horizon including 4 years of education plus 36 years of career</li>
                <li><strong>Total Cost:</strong> Average annual cost (tuition + fees + room & board) × 4 years</li>
              </ul>
              <p className="text-sm text-gray-300 mt-2">
                <strong>Note:</strong> This is a simplified calculation. Actual ROI varies based on major, career path, 
                financial aid, time to degree, and individual circumstances.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white font-bold mb-3">Program-Level ROI</h3>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-3">
                <p className="font-mono text-sm text-white font-bold">
                  ROI = (Program Earnings × 30 Years) - Program Cost
                </p>
              </div>
              <p className="text-gray-300">
                When program-specific earnings data is available, we calculate ROI for individual degree programs.
                This provides more granular insights into specific majors and career paths.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white font-bold mb-3">Cost Components</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li><strong>Tuition:</strong> In-state or out-of-state rates from IPEDS</li>
                <li><strong>Fees:</strong> Required institutional fees</li>
                <li><strong>Room & Board:</strong> On-campus housing and meal plan costs</li>
                <li><strong>Net Price:</strong> Average after grants and scholarships (when available)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Quality Section */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_8px_rgba(249,115,22,0.06)] border p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <AcademicCapIcon className="w-8 h-8 text-orange-500" />
            <h2 className="text-2xl font-bold text-white font-bold">Data Quality & Coverage</h2>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border-l-4 border-orange-500 pl-4">
                <p className="text-sm font-medium text-gray-400 mb-1">Total Institutions</p>
                <p className="text-2xl font-bold text-white font-bold">6,163</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm font-medium text-gray-400 mb-1">With ROI Data</p>
                <p className="text-2xl font-bold text-white font-bold">3,209 (52.1%)</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm font-medium text-gray-400 mb-1">With Enrollment Data</p>
                <p className="text-2xl font-bold text-white font-bold">5,645 (91.6%)</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <p className="text-sm font-medium text-gray-400 mb-1">With Location Data</p>
                <p className="text-2xl font-bold text-white font-bold">6,163 (100%)</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <p className="text-sm font-semibold text-yellow-900 mb-1">Data Limitations</p>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• ROI data is only available for institutions with federal financial aid</li>
                <li>• Some private institutions don't report earnings data</li>
                <li>• Earnings represent median values; individual results vary</li>
                <li>• Data reflects recent graduates; outcomes may change over time</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Update Schedule */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_8px_rgba(249,115,22,0.06)] border p-8">
          <h2 className="text-2xl font-bold text-white font-bold mb-4">Update Schedule</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-white font-bold">IPEDS Data</p>
                <p className="text-sm text-gray-300">Updated annually, typically in December</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-white font-bold">College Scorecard Data</p>
                <p className="text-sm text-gray-300">Updated annually, typically in September</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-white font-bold">ROI Calculations</p>
                <p className="text-sm text-gray-300">Recalculated immediately when new data is available</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <div className="mt-12 text-center bg-orange-500/10 border border-orange-500 rounded-lg p-6">
          <p className="text-gray-300 mb-2">
            Questions about our methodology or data sources?
          </p>
          <a 
            href="/support" 
            className="text-orange-500 hover:text-orange-400 font-semibold"
          >
            Contact our support team →
          </a>
        </div>
      </div>
    </div>
  );
}
