'use client';

import { useState, useEffect } from 'react';
import { Institution } from '@/lib/database';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface SearchFilters {
  search: string;
  state: string;
  city: string;
  zipCode: string;
  control: string;
  maxTuition: string;
  minEarnings: string;
  sortBy: string;
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' }
];

export default function CollegesPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    state: '',
    city: '',
    zipCode: '',
    control: '',
    maxTuition: '',
    minEarnings: '',
    sortBy: 'name'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchInstitutions();
    setPage(1);
  }, [filters]);

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.state) params.append('state', filters.state);
      if (filters.city) params.append('city', filters.city);
      if (filters.zipCode) params.append('zipCode', filters.zipCode);
      if (filters.control !== undefined) params.append('control', filters.control.toString());
      if (filters.maxTuition) params.append('maxTuition', filters.maxTuition.toString());
      if (filters.minEarnings) params.append('minEarnings', filters.minEarnings.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const response = await fetch(`/api/institutions?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch institutions');
      }
      
      const data = await response.json();
      setInstitutions(data.institutions || []);
      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      setInstitutions([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    fetchInstitutions();
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      state: '',
      city: '',
      zipCode: '',
      control: '',
      maxTuition: '',
      minEarnings: '',
      sortBy: 'name'
    });
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
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            College Explorer
          </h1>
          <p className="text-gray-600 text-lg">
            Browse and compare thousands of institutions with detailed information about costs, outcomes, and programs.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search institutions by name, city, or state..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-600 text-lg"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors border-2 border-gray-800"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    State
                  </label>
                  <select
                    className="w-full p-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium bg-white"
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                  >
                    <option value="" className="text-gray-700">All States</option>
                    {US_STATES.map(state => (
                      <option key={state.code} value={state.code}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city name"
                    className="w-full p-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-700"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    placeholder="12345"
                    className="w-full p-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-700"
                    value={filters.zipCode}
                    onChange={(e) => handleFilterChange('zipCode', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Type
                  </label>
                  <select
                    className="w-full p-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium bg-white"
                    value={filters.control}
                    onChange={(e) => handleFilterChange('control', e.target.value)}
                  >
                    <option value="" className="text-gray-700">All Types</option>
                    <option value="1" className="text-gray-900">Public</option>
                    <option value="2" className="text-gray-900">Private Non-profit</option>
                    <option value="3" className="text-gray-900">Private For-profit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Max Tuition
                  </label>
                  <input
                    type="number"
                    placeholder="$50,000"
                    className="w-full p-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-700"
                    value={filters.maxTuition}
                    onChange={(e) => handleFilterChange('maxTuition', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Sort By
                  </label>
                  <select
                    className="w-full p-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium bg-white"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="tuition_low">Tuition (Low to High)</option>
                    <option value="tuition_high">Tuition (High to Low)</option>
                    <option value="earnings_high">Earnings (High to Low)</option>
                    <option value="earnings_low">Earnings (Low to High)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-800 hover:text-gray-900 font-semibold border border-gray-400 hover:border-gray-600 rounded transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))
          ) : institutions.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BuildingOffice2Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No institutions found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or filters
              </p>
            </div>
          ) : (
            institutions.map((institution) => (
              <div 
                key={institution.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = `/colleges/${institution.unitid}`}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {institution.name}
                </h3>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {institution.city}, {institution.state}
                  </span>
                </div>

                  {/* Financial Information - Enhanced visibility */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">Cost Information</h4>
                    {(institution.tuition_in_state || institution.tuition_out_state) ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Tuition:</span>
                          <span className="font-bold text-lg text-gray-900">
                            ${(institution.tuition_in_state || institution.tuition_out_state || 0).toLocaleString()}
                            {institution.tuition_in_state && institution.control_of_institution === 1 && (
                              <span className="text-xs text-gray-600 ml-1">(in-state)</span>
                            )}
                          </span>
                        </div>
                        {institution.tuition_in_state && institution.tuition_out_state && institution.control_of_institution === 1 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Out-of-state:</span>
                            <span className="font-semibold text-gray-900">${institution.tuition_out_state.toLocaleString()}</span>
                          </div>
                        )}
                        {institution.room_board_on_campus && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Room & Board:</span>
                            <span className="font-semibold text-gray-900">${institution.room_board_on_campus.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600 italic">Cost information not available</div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <BuildingOffice2Icon className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{getControlTypeLabel(institution.control_of_institution)}</span>
                    </div>

                    {institution.earnings_6_years_after_entry && (
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="w-4 h-4 mr-2 text-green-500" />
                        <span className="text-gray-900">
                          Avg Earnings: ${institution.earnings_6_years_after_entry.toLocaleString()}/year
                        </span>
                      </div>
                    )}
                  
                  {/* Program count removed temporarily for performance optimization */}

                  {institution.website && (
                    <div className="flex items-center">
                      <AcademicCapIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <a 
                        href={institution.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Unit ID: {institution.unitid}</span>
                    <span className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {!loading && institutions.length > 0 && hasMore && (
          <div className="text-center mt-8">
            <button 
              onClick={loadMore}
              disabled={loadingMore}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? 'Loading...' : 'Load More Results'}
            </button>
          </div>
        )}

        {/* Results Count */}
        {!loading && institutions.length > 0 && (
          <div className="text-center mt-4 text-sm text-gray-500">
            Showing {institutions.length} institutions
            {!hasMore && ' (all results)'}
          </div>
        )}
      </div>
    </div>
  );
}