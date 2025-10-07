'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SalaryData {
  major: string;
  institution_name: string;
  degree_level: string;
  years_since_graduation: number;
  avg_salary: number;
  avg_total_comp: number | null;
  sample_size: number;
  min_salary: number;
  max_salary: number;
  median_salary: number | null;
  p25_salary: number | null;
  p75_salary: number | null;
}

export default function SalaryInsightsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [salaryData, setSalaryData] = useState<SalaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('');
  const [selectedYears, setSelectedYears] = useState('');

  // Filter options
  const [majors, setMajors] = useState<string[]>([]);
  const [institutions, setInstitutions] = useState<string[]>([]);

  useEffect(() => {
    fetchSalaryData();
  }, [selectedMajor, selectedInstitution, selectedDegree, selectedYears]);

  const fetchSalaryData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedMajor) params.append('major', selectedMajor);
      if (selectedInstitution) params.append('institution', selectedInstitution);
      if (selectedDegree) params.append('degreeLevel', selectedDegree);
      if (selectedYears) params.append('yearsRange', selectedYears);

      const response = await fetch(`/api/salary-data?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch salary data');

      const result = await response.json();
      setSalaryData(result.data || []);

      // Extract unique majors and institutions for filters
      if (result.data && result.data.length > 0) {
        const uniqueMajors = Array.from(new Set(result.data.map((d: SalaryData) => d.major))).sort();
        const uniqueInstitutions = Array.from(new Set(result.data.map((d: SalaryData) => d.institution_name))).sort();
        setMajors(uniqueMajors as string[]);
        setInstitutions(uniqueInstitutions as string[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedMajor('');
    setSelectedInstitution('');
    setSelectedDegree('');
    setSelectedYears('');
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isPremium = session?.user?.subscriptionTier === 'premium';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            💰 Real-World Salary Insights
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover actual post-graduation salaries from alumni. Make informed decisions based on real data.
          </p>

          {/* Call to Action */}
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/submit-salary"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              📊 Contribute Your Data
            </Link>
            {!isPremium && (
              <Link
                href="/pricing"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-all"
              >
                ✨ Upgrade for Full Insights
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 mb-1">Total Data Points</div>
            <div className="text-3xl font-bold text-gray-900">
              {salaryData.reduce((sum, d) => sum + d.sample_size, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-1">Unique Majors</div>
            <div className="text-3xl font-bold text-gray-900">{majors.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="text-sm text-gray-600 mb-1">Institutions</div>
            <div className="text-3xl font-bold text-gray-900">{institutions.length}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">🔍 Filter Data</h2>
            {(selectedMajor || selectedInstitution || selectedDegree || selectedYears) && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Major Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Major</label>
              <select
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="" className="text-gray-600">All Majors</option>
                {majors.map((major) => (
                  <option key={major} value={major}>
                    {major}
                  </option>
                ))}
              </select>
            </div>

            {/* Institution Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Institution</label>
              <select
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="" className="text-gray-600">All Schools</option>
                {institutions.map((institution) => (
                  <option key={institution} value={institution}>
                    {institution}
                  </option>
                ))}
              </select>
            </div>

            {/* Degree Level Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Degree Level</label>
              <select
                value={selectedDegree}
                onChange={(e) => setSelectedDegree(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="" className="text-gray-600">All Degrees</option>
                <option value="bachelors">Bachelor's</option>
                <option value="masters">Master's</option>
                <option value="doctorate">Doctorate</option>
                <option value="professional">Professional</option>
                <option value="associates">Associate's</option>
                <option value="certificate">Certificate</option>
              </select>
            </div>

            {/* Years Since Graduation Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Years Post-Grad</label>
              <select
                value={selectedYears}
                onChange={(e) => setSelectedYears(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="" className="text-gray-600">All Ranges</option>
                <option value="0-2">0-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="6-10">6-10 years</option>
                <option value="11-15">11-15 years</option>
                <option value="16-20">16-20 years</option>
                <option value="20+">20+ years</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading salary data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-800">❌ {error}</p>
          </div>
        ) : salaryData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-6">
              We need at least 3 submissions to show salary data for this combination.
            </p>
            <Link
              href="/submit-salary"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
            >
              Be the First to Contribute
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Premium Upsell Banner */}
            {!isPremium && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">✨</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Unlock Full Salary Insights
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Upgrade to Premium to see detailed percentiles (25th, 50th, 75th), salary progression charts, and advanced filters.
                    </p>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all shadow-md"
                    >
                      Upgrade to Premium →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Salary Cards */}
            {salaryData.map((data, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{data.major}</h3>
                    <p className="text-gray-600">{data.institution_name}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                        {data.degree_level.charAt(0).toUpperCase() + data.degree_level.slice(1)}
                      </span>
                      <span>📅 {data.years_since_graduation} years post-grad</span>
                      <span>👥 {data.sample_size} data points</span>
                    </div>
                  </div>
                </div>

                {/* Salary Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {/* Average Salary */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <div className="text-xs text-blue-600 font-medium mb-1">Average Salary</div>
                    <div className="text-2xl font-bold text-blue-900">{formatCurrency(data.avg_salary)}</div>
                  </div>

                  {/* Min Salary */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
                    <div className="text-xs text-gray-600 font-medium mb-1">Minimum</div>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(data.min_salary)}</div>
                  </div>

                  {/* Max Salary */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <div className="text-xs text-green-600 font-medium mb-1">Maximum</div>
                    <div className="text-2xl font-bold text-green-900">{formatCurrency(data.max_salary)}</div>
                  </div>

                  {/* Total Compensation */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <div className="text-xs text-purple-600 font-medium mb-1">Avg Total Comp</div>
                    <div className="text-2xl font-bold text-purple-900">
                      {formatCurrency(data.avg_total_comp || data.avg_salary)}
                    </div>
                  </div>
                </div>

                {/* Premium Percentiles */}
                {isPremium && data.p25_salary && data.median_salary && data.p75_salary && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full">
                        ✨ PREMIUM
                      </span>
                      <span className="text-sm text-gray-600">Detailed Salary Distribution</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">25th Percentile</div>
                        <div className="text-lg font-bold text-gray-900">{formatCurrency(data.p25_salary)}</div>
                      </div>
                      <div className="text-center bg-blue-50 rounded-lg p-3">
                        <div className="text-xs text-blue-600 mb-1">50th Percentile (Median)</div>
                        <div className="text-lg font-bold text-blue-900">{formatCurrency(data.median_salary)}</div>
                      </div>
                      <div className="text-center bg-green-50 rounded-lg p-3">
                        <div className="text-xs text-green-600 mb-1">75th Percentile</div>
                        <div className="text-lg font-bold text-green-900">{formatCurrency(data.p75_salary)}</div>
                      </div>
                    </div>

                    {/* Visual Range Bar */}
                    <div className="mt-4">
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-blue-300 via-blue-500 to-green-500"
                          style={{
                            marginLeft: `${((data.p25_salary - data.min_salary) / (data.max_salary - data.min_salary)) * 100}%`,
                            width: `${((data.p75_salary - data.p25_salary) / (data.max_salary - data.min_salary)) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>{formatCurrency(data.min_salary)}</span>
                        <span>{formatCurrency(data.max_salary)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Locked Premium Content */}
                {!isPremium && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-gray-50 rounded-lg p-6 text-center relative overflow-hidden">
                      <div className="absolute inset-0 backdrop-blur-sm bg-gray-100/50 flex items-center justify-center">
                        <div>
                          <div className="text-4xl mb-2">🔒</div>
                          <p className="text-gray-700 font-medium">Premium Feature Locked</p>
                          <Link
                            href="/pricing"
                            className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all"
                          >
                            Unlock Full Details
                          </Link>
                        </div>
                      </div>
                      <div className="opacity-30 blur-sm">
                        <div className="text-sm text-gray-600 mb-2">Salary Distribution</div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>25th: $XX,XXX</div>
                          <div>Median: $XX,XXX</div>
                          <div>75th: $XX,XXX</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Help Build the Most Comprehensive Salary Database</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Your anonymous salary data helps thousands of students make better college decisions. Share your story.
          </p>
          <Link
            href="/submit-salary"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all shadow-lg text-lg"
          >
            📊 Contribute Your Salary Data
          </Link>
          <p className="text-sm text-blue-200 mt-4">100% anonymous • Takes 2 minutes • Helps future students</p>
        </div>
      </div>
    </div>
  );
}
