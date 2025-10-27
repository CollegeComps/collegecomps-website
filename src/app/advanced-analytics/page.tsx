'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  MapPinIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

interface SalaryData {
  institution: string;
  major: string;
  p25: number;
  median: number;
  p75: number;
  count: number;
}

export default function AdvancedAnalyticsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [salaryData, setSalaryData] = useState<SalaryData[]>([]);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [selectedView, setSelectedView] = useState<'percentiles' | 'trajectory' | 'peer' | 'geographic'>('percentiles');

  const isPremium = session?.user?.subscriptionTier === 'premium';

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/advanced-analytics');
      return;
    }

    if (!isPremium) {
      // Show premium gate but don't redirect
      setLoading(false);
      return;
    }

    fetchData();
  }, [session, isPremium]);

  const fetchData = async () => {
    try {
      // Fetch user preferences
      const prefsResponse = await fetch('/api/user/onboarding');
      if (prefsResponse.ok) {
        const prefsData = await prefsResponse.json();
        setUserPreferences(prefsData.preferences);
      }

      // Fetch salary analytics data
      const salaryResponse = await fetch('/api/salary-analytics');
      if (salaryResponse.ok) {
        const data = await salaryResponse.json();
        setSalaryData(data.analytics || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full mb-6">
              <LockClosedIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Premium Feature
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Advanced Salary Analytics is available for Premium subscribers
            </p>
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-4">Unlock powerful insights:</h3>
              <ul className="text-left space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <ChartBarIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Percentile Analysis:</strong> See P25/P50/P75 salary ranges for your field</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Career Trajectory:</strong> Project your 10-20 year earning potential</span>
                </li>
                <li className="flex items-start gap-3">
                  <UserGroupIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Peer Comparison:</strong> See how you compare to others in your cohort</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Geographic Heatmaps:</strong> Visualize salary variations by location</span>
                </li>
              </ul>
            </div>
            <Link
              href="/pricing"
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold px-8 py-4 rounded-lg text-lg hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Advanced Salary Analytics</h1>
          <p className="text-lg text-gray-600">
            Deep insights into earning potential and career trajectories
          </p>
        </div>

        {/* View Selector */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6 inline-flex gap-2">
          <button
            onClick={() => setSelectedView('percentiles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
              selectedView === 'percentiles'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChartBarIcon className="w-5 h-5" />
            Percentiles
          </button>
          <button
            onClick={() => setSelectedView('trajectory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
              selectedView === 'trajectory'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ArrowTrendingUpIcon className="w-5 h-5" />
            Career Trajectory
          </button>
          <button
            onClick={() => setSelectedView('peer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
              selectedView === 'peer'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <UserGroupIcon className="w-5 h-5" />
            Peer Comparison
          </button>
          <button
            onClick={() => setSelectedView('geographic')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
              selectedView === 'geographic'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MapPinIcon className="w-5 h-5" />
            Geographic
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {selectedView === 'percentiles' && (
            <PercentilesView data={salaryData} preferences={userPreferences} />
          )}
          {selectedView === 'trajectory' && (
            <TrajectoryView preferences={userPreferences} />
          )}
          {selectedView === 'peer' && (
            <PeerComparisonView data={salaryData} preferences={userPreferences} />
          )}
          {selectedView === 'geographic' && (
            <GeographicView data={salaryData} />
          )}
        </div>
      </div>
    </div>
  );
}

function PercentilesView({ data, preferences }: { data: SalaryData[]; preferences: any }) {
  // Filter data based on user's major if available
  const filteredData = preferences?.intended_major
    ? data.filter((d) => d.major.toLowerCase().includes(preferences.intended_major.toLowerCase()))
    : data.slice(0, 10);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Salary Percentile Breakdown</h2>
      {preferences?.intended_major && (
        <p className="text-gray-600 mb-4">
          Showing data for: <strong>{preferences.intended_major}</strong>
        </p>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Institution</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Major</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">25th %ile</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Median</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">75th %ile</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Range</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{item.institution}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm">{item.major}</td>
                  <td className="text-right py-3 px-4 text-gray-900">
                    ${item.p25?.toLocaleString() || 'N/A'}
                  </td>
                  <td className="text-right py-3 px-4 font-semibold text-blue-600">
                    ${item.median?.toLocaleString() || 'N/A'}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-900">
                    ${item.p75?.toLocaleString() || 'N/A'}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-600 text-sm">
                    ${((item.p75 || 0) - (item.p25 || 0)).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No salary data available for your selected major
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredData.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-blue-600 font-medium mb-1">Average 25th Percentile</p>
            <p className="text-2xl font-bold text-gray-900">
              ${Math.round(filteredData.reduce((sum, d) => sum + (d.p25 || 0), 0) / filteredData.length).toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-xs text-green-600 font-medium mb-1">Average Median</p>
            <p className="text-2xl font-bold text-gray-900">
              ${Math.round(filteredData.reduce((sum, d) => sum + (d.median || 0), 0) / filteredData.length).toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-xs text-purple-600 font-medium mb-1">Average 75th Percentile</p>
            <p className="text-2xl font-bold text-gray-900">
              ${Math.round(filteredData.reduce((sum, d) => sum + (d.p75 || 0), 0) / filteredData.length).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function TrajectoryView({ preferences }: { preferences: any }) {
  // Projected growth rates based on industry averages
  const currentYear = new Date().getFullYear();
  const startingSalary = 60000; // Default, would come from data
  const annualGrowthRate = 0.05; // 5% annual growth

  const projections = Array.from({ length: 21 }, (_, i) => ({
    year: currentYear + i,
    salary: Math.round(startingSalary * Math.pow(1 + annualGrowthRate, i)),
  }));

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Career Trajectory Projection</h2>
      {preferences?.intended_major && (
        <p className="text-gray-600 mb-6">
          Projected earnings for: <strong>{preferences.intended_major}</strong>
        </p>
      )}

      <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Starting Salary</p>
            <p className="text-xl font-bold text-gray-900">
              ${startingSalary.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">10-Year Projection</p>
            <p className="text-xl font-bold text-blue-600">
              ${projections[10].salary.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">20-Year Projection</p>
            <p className="text-xl font-bold text-purple-600">
              ${projections[20].salary.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Total Growth</p>
            <p className="text-xl font-bold text-green-600">
              {Math.round(((projections[20].salary - startingSalary) / startingSalary) * 100)}%
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Years Experience</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Projected Salary</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Cumulative Growth</th>
            </tr>
          </thead>
          <tbody>
            {[0, 5, 10, 15, 20].map((year) => {
              const projection = projections[year];
              const growth = ((projection.salary - startingSalary) / startingSalary) * 100;
              return (
                <tr key={year} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900 font-medium">{year} years</td>
                  <td className="text-right py-3 px-4 text-xl font-bold text-blue-600">
                    ${projection.salary.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 text-green-600 font-semibold">
                    +{Math.round(growth)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        * Projections based on 5% annual growth rate. Actual results may vary based on performance, industry, and economic conditions.
      </p>
    </div>
  );
}

function PeerComparisonView({ data, preferences }: { data: SalaryData[]; preferences: any }) {
  // Simulated peer data
  const userSalary = 65000; // Would come from user submissions
  const allSalaries = data.flatMap((d) => [d.p25, d.median, d.p75]).filter((s) => s > 0);
  const sortedSalaries = allSalaries.sort((a, b) => a - b);
  const percentile = Math.round((sortedSalaries.filter((s) => s < userSalary).length / sortedSalaries.length) * 100);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Peer Comparison</h2>

      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-8 text-white mb-6">
        <div className="text-center">
          <p className="text-blue-100 mb-2">Your Percentile Ranking</p>
          <p className="text-6xl font-bold mb-2">{percentile}th</p>
          <p className="text-blue-100">
            You earn more than {percentile}% of graduates in your field
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">How You Compare</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Your Salary</span>
              <span className="font-bold text-blue-600">${userSalary.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Peer Median</span>
              <span className="font-semibold text-gray-900">
                ${Math.round(sortedSalaries[Math.floor(sortedSalaries.length / 2)]).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Difference</span>
              <span className="font-semibold text-green-600">
                +${(userSalary - Math.round(sortedSalaries[Math.floor(sortedSalaries.length / 2)])).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">Next Milestone</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Current Percentile</span>
              <span className="font-bold text-blue-600">{percentile}th</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Target (75th percentile)</span>
              <span className="font-semibold text-gray-900">
                ${Math.round(sortedSalaries[Math.floor(sortedSalaries.length * 0.75)]).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Gap to Close</span>
              <span className="font-semibold text-purple-600">
                ${(Math.round(sortedSalaries[Math.floor(sortedSalaries.length * 0.75)]) - userSalary).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GeographicView({ data }: { data: SalaryData[] }) {
  // Simulated geographic data
  const regions = [
    { name: 'San Francisco Bay Area', avgSalary: 95000, count: 245 },
    { name: 'New York Metro', avgSalary: 88000, count: 312 },
    { name: 'Seattle', avgSalary: 85000, count: 178 },
    { name: 'Boston', avgSalary: 82000, count: 156 },
    { name: 'Austin', avgSalary: 78000, count: 134 },
    { name: 'Chicago', avgSalary: 75000, count: 189 },
    { name: 'Denver', avgSalary: 72000, count: 98 },
    { name: 'Atlanta', avgSalary: 70000, count: 121 },
  ];

  const maxSalary = Math.max(...regions.map((r) => r.avgSalary));

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Geographic Salary Distribution</h2>
      <p className="text-gray-600 mb-6">
        Average salaries by metro area for your field
      </p>

      <div className="space-y-4">
        {regions.map((region) => {
          const percentage = (region.avgSalary / maxSalary) * 100;
          return (
            <div key={region.name}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">{region.name}</span>
                  <span className="text-xs text-gray-500">({region.count} grads)</span>
                </div>
                <span className="font-bold text-blue-600">
                  ${region.avgSalary.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="font-bold text-gray-900 mb-3">Key Insights</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• Highest salaries in tech hubs (SF, Seattle, NYC)</li>
          <li>• Cost of living should be factored into comparisons</li>
          <li>• Remote work opportunities expanding geographic options</li>
          <li>• Consider regional industry concentrations for your major</li>
        </ul>
      </div>
    </div>
  );
}
