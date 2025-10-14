'use client';

import { useState, useEffect } from 'react';

interface InstitutionsByDegreeProps {
  cipcode: string;
  degreeName: string;
  onSelectInstitution: (institution: any) => void;
}

export default function InstitutionsByDegree({ cipcode, degreeName, onSelectInstitution }: InstitutionsByDegreeProps) {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    fetchInstitutions();
  }, [cipcode]);

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

  const filteredInstitutions = institutions.filter(inst => {
    if (filter === 'all') return true;
    if (filter === 'public') return inst.control === 'Public';
    if (filter === 'private') return inst.control?.includes('Private');
    return true;
  });

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
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Institutions Offering {degreeName}
        </h3>
        <p className="text-sm text-gray-600">
          Found {institutions.length} institution{institutions.length !== 1 ? 's' : ''} offering this program
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({institutions.length})
        </button>
        <button
          onClick={() => setFilter('public')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'public'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Public ({institutions.filter(i => i.control === 'Public').length})
        </button>
        <button
          onClick={() => setFilter('private')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'private'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Private ({institutions.filter(i => i.control?.includes('Private')).length})
        </button>
      </div>

      {/* Institutions List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredInstitutions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No institutions found with the selected filter
          </div>
        ) : (
          filteredInstitutions.map((institution) => (
            <div
              key={institution.unitid}
              className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
              onClick={() => onSelectInstitution(institution)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">{institution.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {institution.city}, {institution.state}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
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
                  className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Select
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredInstitutions.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            💡 Tip: Click on any institution to calculate ROI for this program
          </p>
        </div>
      )}
    </div>
  );
}
