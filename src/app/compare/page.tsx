'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import SocialShare from '@/components/SocialShare';

interface College {
  id: number;
  name: string;
  state: string;
  city: string;
  control: string;
  tuition_in_state: number | null;
  tuition_out_state: number | null;
  avg_net_price: number | null;
  admission_rate: number | null;
  sat_avg: number | null;
  act_median: number | null;
  median_earnings_6yr: number | null;
  median_earnings_10yr: number | null;
}

export default function ComparePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { trackEvent } = useAnalytics();
  const [selectedColleges, setSelectedColleges] = useState<College[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);

  const searchColleges = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/colleges/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.colleges || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchColleges(searchQuery);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const addCollege = (college: College) => {
    if (selectedColleges.length >= 4) {
      alert('You can compare up to 4 colleges at a time');
      return;
    }
    if (!selectedColleges.find(c => c.id === college.id)) {
      setSelectedColleges([...selectedColleges, college]);
      setSearchQuery('');
      setSearchResults([]);
      
      // Track college addition
      trackEvent('comparison_add_college', {
        college_name: college.name,
        college_id: college.id,
        total_selected: selectedColleges.length + 1
      });
    }
  };

  const removeCollege = (collegeId: number) => {
    setSelectedColleges(selectedColleges.filter(c => c.id !== collegeId));
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number | null) => {
    if (!value) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Compare Colleges</h1>
          <p className="text-lg text-gray-600">
            Compare up to 4 colleges side-by-side to make the best decision
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Add College to Comparison
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by college name..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
            {loading && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              {searchResults.map((college) => (
                <button
                  key={college.id}
                  onClick={() => addCollege(college)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="font-semibold text-gray-900">{college.name}</div>
                  <div className="text-sm text-gray-600">
                    {college.city}, {college.state} • {college.control}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Colleges Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {selectedColleges.length} of 4 colleges selected
          </p>
          {selectedColleges.length > 0 && (
            <button
              onClick={() => setSelectedColleges([])}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Comparison Table */}
        {selectedColleges.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Colleges Selected</h3>
            <p className="text-gray-600 mb-6">
              Start by searching and adding colleges to compare their costs, admissions, and outcomes
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <th className="px-6 py-4 text-left text-sm font-semibold">Metric</th>
                    {selectedColleges.map((college) => (
                      <th key={college.id} className="px-6 py-4 text-left min-w-[250px]">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-base">{college.name}</div>
                            <div className="text-xs text-blue-100 mt-1">
                              {college.city}, {college.state}
                            </div>
                          </div>
                          <button
                            onClick={() => removeCollege(college.id)}
                            className="text-white/80 hover:text-white transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Institution Type */}
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">Institution Type</td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="px-6 py-3 text-sm text-gray-700">
                        {college.control}
                      </td>
                    ))}
                  </tr>

                  {/* Tuition (In-State) */}
                  <tr className="border-b border-gray-200">
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">Tuition (In-State)</td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="px-6 py-3 text-sm text-gray-700">
                        {formatCurrency(college.tuition_in_state)}
                      </td>
                    ))}
                  </tr>

                  {/* Tuition (Out-of-State) */}
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">Tuition (Out-of-State)</td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="px-6 py-3 text-sm text-gray-700">
                        {formatCurrency(college.tuition_out_state)}
                      </td>
                    ))}
                  </tr>

                  {/* Average Net Price */}
                  <tr className="border-b border-gray-200">
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">Average Net Price</td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="px-6 py-3 text-sm text-gray-700">
                        {formatCurrency(college.avg_net_price)}
                      </td>
                    ))}
                  </tr>

                  {/* Admission Rate */}
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">Admission Rate</td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="px-6 py-3 text-sm text-gray-700">
                        {formatPercent(college.admission_rate)}
                      </td>
                    ))}
                  </tr>

                  {/* SAT Average */}
                  <tr className="border-b border-gray-200">
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">Average SAT</td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="px-6 py-3 text-sm text-gray-700">
                        {college.sat_avg || 'N/A'}
                      </td>
                    ))}
                  </tr>

                  {/* ACT Median */}
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">Median ACT</td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="px-6 py-3 text-sm text-gray-700">
                        {college.act_median || 'N/A'}
                      </td>
                    ))}
                  </tr>

                  {/* Median Earnings (6 years) */}
                  <tr className="border-b border-gray-200">
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">Earnings (6 years after)</td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="px-6 py-3 text-sm text-gray-700 font-semibold">
                        {formatCurrency(college.median_earnings_6yr)}
                      </td>
                    ))}
                  </tr>

                  {/* Median Earnings (10 years) */}
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">Earnings (10 years after)</td>
                    {selectedColleges.map((college) => (
                      <td key={college.id} className="px-6 py-3 text-sm text-gray-700 font-semibold">
                        {formatCurrency(college.median_earnings_10yr)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Save Comparison */}
        {selectedColleges.length > 1 && session && (
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <SocialShare 
              title={`Compare ${selectedColleges.map(c => c.name).join(' vs ')} - CollegeComps`}
              description={`Side-by-side comparison of ${selectedColleges.length} colleges with tuition, admissions, and outcomes data.`}
              hashtags={['CollegeComparison', 'CollegeSearch']}
            />
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/saved-comparisons', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: `${selectedColleges.map(c => c.name).join(' vs ')}`,
                      colleges: selectedColleges.map(c => c.id),
                    }),
                  });

                  if (response.ok) {
                    alert('Comparison saved successfully!');
                  } else {
                    const data = await response.json();
                    alert(data.error || 'Failed to save comparison');
                  }
                } catch (error) {
                  alert('Failed to save comparison');
                }
              }}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              💾 Save This Comparison
            </button>
          </div>
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
}
