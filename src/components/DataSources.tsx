interface DataSource {
  name: string;
  description: string;
  url: string;
  lastUpdated?: string;
  updateFrequency?: string;
}

const dataSources: DataSource[] = [
  {
    name: "IPEDS (Integrated Postsecondary Education Data System)",
    description: "Official higher education data from the National Center for Education Statistics",
    url: "https://nces.ed.gov/ipeds/",
    lastUpdated: "2024-2025 Academic Year",
    updateFrequency: "Annual"
  },
  {
    name: "College Scorecard",
    description: "U.S. Department of Education college cost and earnings data (6,163 institutions with 91.8% enrollment coverage, 43.6% ROI data)",
    url: "https://collegescorecard.ed.gov/",
    lastUpdated: "October 2025",
    updateFrequency: "Annual"
  },
  {
    name: "User-Submitted Salary Data",
    description: "Real-world salary information from verified alumni (anonymized and aggregated)",
    url: "/submit-salary",
    updateFrequency: "Real-time"
  }
];

export function DataSourcesFooter() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            📊 Our Data Sources
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We use only official government data and verified user submissions to ensure accuracy and reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dataSources.map((source, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start mb-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{source.name}</h4>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center"
                  >
                    Visit Source
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                {source.description}
              </p>

              <div className="flex flex-col gap-2 text-xs text-gray-500">
                {source.lastUpdated && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Updated: {source.lastUpdated}</span>
                  </div>
                )}
                {source.updateFrequency && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Frequency: {source.updateFrequency}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Data Quality Statement */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Data Quality & Privacy
              </h4>
              <p className="text-sm text-blue-800">
                We aggregate data from multiple official sources to provide comprehensive insights. 
                User-submitted salary data is anonymized and only shown when we have sufficient submissions 
                to protect individual privacy. All calculations and projections are clearly labeled.
              </p>
            </div>
          </div>
        </div>

        {/* Last Database Update */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            <a href="/about/methodology" className="text-blue-600 hover:text-blue-700 hover:underline">
              Learn about our methodology
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Compact version for use in specific pages
export function DataSourcesBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-900">
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      <span className="text-gray-900">
        Data from <span className="font-semibold text-blue-700">IPEDS</span> & <span className="font-semibold text-blue-700">College Scorecard</span>
      </span>
      <button
        className="text-blue-600 hover:text-blue-700 hover:underline font-semibold ml-1"
        onClick={() => {
          // Scroll to footer or open modal with full sources
          const footer = document.querySelector('[data-sources-footer]');
          footer?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        Details
      </button>
    </div>
  );
}

// Inline citation for specific data points
export function DataCitation({ source, date }: { source: string; date?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500 italic">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Source: {source}
      {date && ` (${date})`}
    </span>
  );
}
