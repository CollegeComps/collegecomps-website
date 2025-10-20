'use client';

import { useState, useEffect } from 'react';

interface InstitutionsByDegreeProps {
  cipcode: string;
  degreeName: string;
  onSelectInstitution: (institution: any) => void;
}

// US States for filtering
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

export default function InstitutionsByDegree({ cipcode, degreeName, onSelectInstitution }: InstitutionsByDegreeProps) {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [controlFilter, setControlFilter] = useState<'all' | 'public' | 'private'>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/programs/institutions?cipcode=${encodeURIComponent(cipcode)}`);
      if (response.ok) {
        const data = await response.json();
        setInstitutions(data.institutions || []);
      }
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
    // Reset filters when cipcode changes
    setControlFilter('all');
    setStateFilter('all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cipcode]);

  // Apply filters with useMemo to ensure re-computation on filter changes
  const filteredInstitutions = institutions.filter(inst => {
    // Filter by control type
    if (controlFilter !== 'all') {
      if (controlFilter === 'public' && inst.control !== 'Public') return false;
      if (controlFilter === 'private' && !inst.control?.includes('Private')) return false;
    }
    
    // Filter by state
    if (stateFilter !== 'all' && inst.state !== stateFilter) return false;
    
    return true;
  });

  console.log('Filter state:', { controlFilter, stateFilter, totalInst: institutions.length, filteredCount: filteredInstitutions.length });

  // Get unique states from institutions
  const availableStates = [...new Set(institutions.map(i => i.state))].filter(Boolean).sort();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading institutions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Institutions Offering {degreeName}
        </h3>
        <p className="text-sm text-gray-600">
          Found {institutions.length} institution{institutions.length !== 1 ? 's' : ''} offering this program
          {filteredInstitutions.length !== institutions.length && (
            <span className="text-blue-600 font-medium">
              {' '}• Showing {filteredInstitutions.length} after filters
            </span>
          )}
        </p>
      </div>

      {/* Filters Section */}
      <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
        {/* State Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by State
          </label>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600"
          >
            <option value="all">All States ({institutions.length} institutions)</option>
            {availableStates.map(state => (
              <option key={state} value={state}>
                {state} ({institutions.filter(i => i.state === state).length} institutions)
              </option>
            ))}
          </select>
        </div>

        {/* Control Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Institution Type
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setControlFilter('all')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                controlFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setControlFilter('public')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                controlFilter === 'public'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Public
            </button>
            <button
              onClick={() => setControlFilter('private')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                controlFilter === 'private'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Private
            </button>
          </div>
        </div>
      </div>

      {/* Institutions List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredInstitutions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No institutions found with the selected filters</p>
            <button
              onClick={() => {
                setControlFilter('all');
                setStateFilter('all');
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          filteredInstitutions.map((institution) => (
            <div
              key={institution.unitid}
              className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer group"
              onClick={() => onSelectInstitution(institution)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {institution.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {institution.city}, {institution.state}
                  </p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      institution.control === 'Public' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {institution.control}
                    </span>
                    {institution.total_completions && (
                      <span className="text-xs text-gray-500">
                        {institution.total_completions} annual graduates
                      </span>
                    )}
                  </div>
                  {institution.credential_name && (
                    <p className="text-xs text-gray-500 mt-1">
                      Credential: {institution.credential_name}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectInstitution(institution);
                  }}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                >
                  Calculate ROI
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredInstitutions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            💡 <strong>Next Step:</strong> Click "Calculate ROI" on any institution to see detailed financial analysis for this program
          </p>
        </div>
      )}
    </div>
  );
}
