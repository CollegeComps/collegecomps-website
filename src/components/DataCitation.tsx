'use client';

interface DataSource {
  name: string;
  description: string;
  year?: string;
  url?: string;
  lastUpdated?: string;
}

interface DataCitationProps {
  sources: DataSource[];
  assumptions?: string[];
}

export default function DataCitation({ sources, assumptions }: DataCitationProps) {
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <details className="group">
        <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 flex items-center gap-2">
          <svg
            className="w-4 h-4 transition-transform group-open:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium">Data Sources & Methodology</span>
        </summary>
        
        <div className="mt-3 ml-6 space-y-3 text-xs text-gray-600">
          {/* Data Sources */}
          {sources.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 mb-2">Data Sources:</p>
              <ul className="space-y-1.5 list-disc list-inside">
                {sources.map((source, idx) => (
                  <li key={idx}>
                    <strong>{source.name}</strong>
                    {source.year && <span> ({source.year})</span>}
                    {': '}
                    {source.description}
                    {source.url && (
                      <>
                        {' - '}
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          View Source
                        </a>
                      </>
                    )}
                    {source.lastUpdated && (
                      <span className="text-gray-500"> (Updated: {source.lastUpdated})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Assumptions */}
          {assumptions && assumptions.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 mb-2">Assumptions & Notes:</p>
              <ul className="space-y-1 list-disc list-inside">
                {assumptions.map((assumption, idx) => (
                  <li key={idx}>{assumption}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-gray-500 italic text-xs">
              <strong>Disclaimer:</strong> All figures are estimates based on historical data and statistical averages. 
              Individual outcomes may vary significantly. This calculator is for informational purposes only.
            </p>
          </div>
        </div>
      </details>
    </div>
  );
}
