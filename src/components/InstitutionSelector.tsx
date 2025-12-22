'use client';

import { useState, useEffect } from 'react';
import { Institution } from '@/lib/database';

interface InstitutionSelectorProps {
  selectedInstitution: Institution | null;
  onSelect: (institution: Institution | null) => void;
  degreeLevel?: '' | 'associates' | 'bachelors' | 'masters' | 'doctorate' | 'certificate';
}

export default function InstitutionSelector({ selectedInstitution, onSelect, degreeLevel }: InstitutionSelectorProps) {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch institutions from API
  useEffect(() => {
    if (searchTerm.length >= 2) {
      fetchInstitutions(searchTerm);
    } else {
      setInstitutions([]);
      setShowDropdown(false);
    }
  }, [searchTerm, degreeLevel]);

  const fetchInstitutions = async (search: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, limit: '10' });
      if (degreeLevel) params.set('degreeLevel', degreeLevel);
      const response = await fetch(`/api/institutions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setInstitutions(data.institutions || []);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error('Error fetching institutions:', error);
      setInstitutions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInstitution = (institution: Institution) => {
    onSelect(institution);
    setSearchTerm(institution.name);
    setShowDropdown(false);
  };

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    // Clear selection if user is typing something different
    if (selectedInstitution && value !== selectedInstitution.name) {
      onSelect(null);
    }
  };

  const handleInputFocus = () => {
    // If there's a selected institution, clear the field to allow editing
    if (selectedInstitution) {
      setSearchTerm('');
      onSelect(null);
    }
    if (institutions.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    // Don't close dropdown immediately to allow clicks on options
    setTimeout(() => setShowDropdown(false), 200);
  };

  const getControlTypeLabel = (control?: number) => {
    switch (control) {
      case 1: return 'Public';
      case 2: return 'Private Non-profit';
      case 3: return 'Private For-profit';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Step 1: Select Institution
      </h3>
      
      <div className="relative">
        <label htmlFor="institution-search" className="block text-sm font-medium text-gray-300 mb-2">
          Search for a college or university
        </label>
        
        <div className="relative">
          <input
            id="institution-search"
            type="text"
            className="w-full px-4 py-3 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg text-white placeholder-gray-400"
            placeholder={selectedInstitution ? "Click to change institution..." : "Type to search for institutions..."}
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {showDropdown && institutions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {institutions.map((institution) => (
              <div
                key={institution.unitid}
                className="p-4 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                onClick={() => handleSelectInstitution(institution)}
              >
                <div className="font-medium text-white mb-1">
                  {institution.name}
                </div>
                <div className="text-sm text-gray-300">
                  {institution.city}, {institution.state}
                  {institution.control_public_private && (
                    <span className="ml-2 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">
                      {getControlTypeLabel(institution.control_public_private)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showDropdown && (
          <div 
            className="fixed inset-0 z-5"
            onClick={() => setShowDropdown(false)}
          />
        )}

        {searchTerm.length > 0 && searchTerm.length < 2 && (
          <p className="text-sm text-gray-400 mt-2">
            Type at least 2 characters to search
          </p>
        )}

        {searchTerm.length >= 2 && !loading && institutions.length === 0 && (
          <p className="text-sm text-gray-400 mt-2">
            No institutions found. Try a different search term.
          </p>
        )}
      </div>

      {selectedInstitution && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">
            Selected Institution
          </h4>
          <div className="text-blue-800">
            <div className="font-medium">{selectedInstitution.name}</div>
            <div className="text-sm">
              {selectedInstitution.city}, {selectedInstitution.state}
              {selectedInstitution.control_public_private && (
                <span className="ml-2">
                  • {getControlTypeLabel(selectedInstitution.control_public_private)}
                </span>
              )}
            </div>
            <div className="text-xs mt-1 text-blue-600">
              Unit ID: {selectedInstitution.unitid}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}