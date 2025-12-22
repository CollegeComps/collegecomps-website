'use client';

import { useState, useEffect } from 'react';
import { AcademicProgram } from '@/lib/database';

interface ProgramSelectorProps {
  institutionId: number;
  selectedProgram: AcademicProgram | null;
  onSelect: (program: AcademicProgram | null) => void;
  degreeLevel?: '' | 'bachelors' | 'masters';
  institutionInfo?: {
    name: string;
    state?: string;
    control_public_private?: number;
  };
}

export default function ProgramSelector({ institutionId, selectedProgram, onSelect, degreeLevel, institutionInfo }: ProgramSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [availablePrograms, setAvailablePrograms] = useState<AcademicProgram[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<AcademicProgram[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch programs when institutionId changes
  useEffect(() => {
    if (institutionId) {
      fetchPrograms();
    } else {
      setAvailablePrograms([]);
      setFilteredPrograms([]);
    }
  }, [institutionId]);

  // Filter programs when searchTerm changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = availablePrograms.filter(program =>
        program.cip_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.cipcode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPrograms(filtered);
    } else {
      setFilteredPrograms(availablePrograms);
    }
  }, [searchTerm, availablePrograms]);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ unitid: String(institutionId) });
      if (degreeLevel) params.set('degreeLevel', degreeLevel);
      const response = await fetch(`/api/programs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAvailablePrograms(data.programs || []);
        setFilteredPrograms(data.programs || []);
      } else {
        console.error('Failed to fetch programs');
        setAvailablePrograms([]);
        setFilteredPrograms([]);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      setAvailablePrograms([]);
      setFilteredPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (program: AcademicProgram) => {
    onSelect(program);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    setIsOpen(true);
    // Clear selection if user is typing something different
    if (selectedProgram && value !== (selectedProgram.cip_title || 'Unknown Program')) {
      onSelect(null);
    }
  };

  const handleInputFocus = () => {
    // If there's a selected program, clear the field to allow editing
    if (selectedProgram) {
      setSearchTerm('');
      onSelect(null);
    }
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Don't close dropdown immediately to allow clicks on options
    setTimeout(() => setIsOpen(false), 200);
  };

  const getDegreeLevel = (level?: number) => {
    switch (level) {
      case 1: return 'Award of less than 1 academic year';
      case 2: return 'Award of at least 1 but less than 2 academic years';
      case 3: return 'Associate\'s degree';
      case 4: return 'Award of at least 2 but less than 4 academic years';
      case 5: return 'Bachelor\'s degree';
      case 6: return 'Postbaccalaureate certificate';
      case 7: return 'Master\'s degree';
      case 8: return 'Post-master\'s certificate';
      case 17: return 'Doctoral degree - research/scholarship';
      case 18: return 'Doctoral degree - professional practice';
      case 19: return 'Doctoral degree - other';
      case 20: return 'Graduate/professional certificate';
      case 21: return 'Graduate/professional certificate';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Step 2: Select Program</h2>
      {/* Optional: could add a degree-level badge or hint here based on degreeLevel */}
      
      <div className="relative">
        <input
          type="text"
          placeholder={selectedProgram ? "Click to change program..." : "Search programs..."}
          value={selectedProgram && searchTerm === '' ? selectedProgram.cip_title || 'Unknown Program' : searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="w-full p-3 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-400"
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {isOpen && !loading && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            ></div>
            <div className="absolute z-20 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {filteredPrograms.map((program, index) => (
                <button
                  key={`${program.cipcode}-${index}`}
                  onClick={() => handleSelect(program)}
                  className="w-full p-4 text-left hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{program.cip_title || 'Unknown Program'}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        {program.cipcode && (
                          <span className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-300">
                            CIP: {program.cipcode}
                          </span>
                        )}
                        {program.credential_name && (
                          <span className="px-2 py-1 text-xs rounded bg-orange-500/20 text-orange-400">
                            {program.credential_name}
                          </span>
                        )}
                        {program.total_completions && (
                          <span className="text-sm text-gray-400">
                            {program.total_completions} data points
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {filteredPrograms.length === 0 && !loading && (
                <div className="p-4 text-center text-gray-400">
                  No programs found for this institution
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {selectedProgram && (
        <div className="mt-4 p-4 bg-green-900/20 rounded-lg border border-green-800">
          <h3 className="font-semibold text-green-400 mb-2">Selected Program</h3>
          <div className="text-sm text-green-300 space-y-1">
            <div><strong>Program:</strong> {selectedProgram.cip_title || 'Unknown Program'}</div>
            {selectedProgram.cipcode && (
              <div><strong>CIP Code:</strong> {selectedProgram.cipcode}</div>
            )}
            {selectedProgram.credential_name && (
              <div><strong>Degree Level:</strong> {selectedProgram.credential_name}</div>
            )}
          </div>
        </div>
      )}

      {!loading && availablePrograms.length === 0 && institutionId && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            No program data available for this institution. You can still proceed with general cost analysis.
          </p>
        </div>
      )}
    </div>
  );
}