'use client';

import { useState, useEffect } from 'react';
import { AcademicProgram } from '@/lib/database';

interface DegreeSelectorProps {
  selectedDegree: AcademicProgram | null;
  onSelect: (degree: AcademicProgram | null) => void;
}

export default function DegreeSelector({ selectedDegree, onSelect }: DegreeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [degrees, setDegrees] = useState<AcademicProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [skipSearch, setSkipSearch] = useState(false);

  useEffect(() => {
    // Skip search if this is a programmatic update (after selection)
    if (skipSearch) {
      setSkipSearch(false);
      return;
    }
    
    if (searchQuery.length >= 2) {
      searchDegrees();
    } else {
      setDegrees([]);
      setShowDropdown(false);
    }
  }, [searchQuery]);

  const searchDegrees = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/programs/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        const programs = data.programs || [];
        
        // Deduplicate by cipcode (in case API returns duplicates)
        const uniquePrograms = new Map<string, AcademicProgram>();
        programs.forEach((program: AcademicProgram) => {
          if (program.cipcode && !uniquePrograms.has(program.cipcode)) {
            uniquePrograms.set(program.cipcode, program);
          }
        });
        
        setDegrees(Array.from(uniquePrograms.values()));
        setShowDropdown(true);
      }
    } catch (error) {
      console.error('Error searching degrees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDegree = (degree: AcademicProgram) => {
    onSelect(degree);
    setSkipSearch(true); // Prevent search on next searchQuery update
    setSearchQuery(degree.cip_title || '');
    setShowDropdown(false);
  };

  const handleClear = () => {
    onSelect(null);
    setSearchQuery('');
    setDegrees([]);
    setShowDropdown(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        Select Degree Program
      </h3>

      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => degrees.length > 0 && setShowDropdown(true)}
          placeholder="Search by degree name (e.g., Computer Science, Nursing, Business)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-gray-900"
        />
        {selectedDegree && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {loading && (
        <div className="mt-2 text-sm text-gray-600">Searching degrees...</div>
      )}

      {showDropdown && degrees.length > 0 && (
        <div className="mt-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-lg">
          {degrees.map((degree) => (
            <button
              key={degree.cipcode}
              onClick={() => handleSelectDegree(degree)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="font-semibold text-gray-900">{degree.cip_title}</div>
              <div className="text-sm text-gray-600 mt-1">
                CIP Code: {degree.cipcode}
                {degree.total_completions && (
                  <span className="ml-3">
                    • {degree.total_completions.toLocaleString()} annual graduates
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {searchQuery.length >= 2 && !loading && degrees.length === 0 && (
        <div className="mt-2 text-sm text-gray-600">
          No degrees found. Try a different search term.
        </div>
      )}

      {selectedDegree && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900">Selected Degree</h4>
              <p className="text-sm text-blue-800 mt-1">{selectedDegree.cip_title}</p>
              <p className="text-xs text-blue-600 mt-1">CIP Code: {selectedDegree.cipcode}</p>
            </div>
            <button
              onClick={handleClear}
              className="ml-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Change
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">💡 Search Tips</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Enter at least 2 characters to start searching</li>
          <li>• Search by field of study (e.g., "Engineering", "Healthcare")</li>
          <li>• Results show degree programs available across all institutions</li>
          <li>• Select a program to see all institutions offering it</li>
        </ul>
      </div>
    </div>
  );
}
