'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  total_institutions: number;
  avg_in_state_tuition: number;
  avg_out_state_tuition: number;
  avg_room_board: number;
}

interface ControlTypeData {
  control_public_private: number;
  count: number;
  avg_tuition: number;
  avg_room_board: number;
}

interface StateData {
  state: string;
  num_institutions: number;
  avg_tuition: number;
  avg_room_board: number;
}

interface Distribution {
  cost_range?: string;
  price_range?: string;
  count: number;
}

interface TotalCostLeader {
  name: string;
  state: string;
  control_public_private: number;
  tuition_in_state: number;
  room_board_on_campus: number;
  total_cost: number;
}

interface AffordablePublic {
  name: string;
  state: string;
  tuition_in_state: number;
  fees: number;
  room_board_on_campus: number;
  net_price: number;
}

const getControlLabel = (control: number): string => {
  switch (control) {
    case 1: return 'Public';
    case 2: return 'Private Non-profit';
    case 3: return 'Private For-profit';
    default: return 'Unknown';
  }
};

const getControlColor = (control: number): string => {
  switch (control) {
    case 1: return 'bg-blue-500';
    case 2: return 'bg-green-500';
    case 3: return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [byControlType, setByControlType] = useState<ControlTypeData[]>([]);
  const [topStates, setTopStates] = useState<StateData[]>([]);
  const [costDist, setCostDist] = useState<Distribution[]>([]);
  const [roomBoardDist, setRoomBoardDist] = useState<Distribution[]>([]);
  const [totalCostLeaders, setTotalCostLeaders] = useState<TotalCostLeader[]>([]);
  const [affordablePublic, setAffordablePublic] = useState<AffordablePublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.overallStats);
        setByControlType(data.byControlType);
        setTopStates(data.topStates);
        setCostDist(data.costDistribution);
        setRoomBoardDist(data.roomBoardDistribution);
        setTotalCostLeaders(data.totalCostLeaders);
        setAffordablePublic(data.affordablePublic);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalControlInstitutions = byControlType.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Data Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Comprehensive insights and analytics from college data nationwide.
          </p>
        </div>

        {/* Key Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Total Institutions</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total_institutions?.toLocaleString() || 'N/A'}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Avg In-State Tuition (Annual)</div>
              <div className="text-3xl font-bold text-blue-600">${stats.avg_in_state_tuition?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 'N/A'}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Avg Out-State Tuition (Annual)</div>
              <div className="text-3xl font-bold text-purple-600">${stats.avg_out_state_tuition?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 'N/A'}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-1">Avg Room & Board (Annual)</div>
              <div className="text-3xl font-bold text-green-600">${stats.avg_room_board?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 'N/A'}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Institution Types */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Institutions by Type</h2>
            <div className="space-y-4">
              {byControlType.map((item) => {
                const percentage = totalControlInstitutions > 0 ? (item.count / totalControlInstitutions) * 100 : 0;
                return (
                  <div key={item.control_public_private}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900">{getControlLabel(item.control_public_private)}</span>
                      <span className="text-sm text-gray-600">{item.count.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`${getControlColor(item.control_public_private)} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>Avg Tuition (Annual): ${item.avg_tuition?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 'N/A'}</span>
                      <span>Avg Room & Board (Annual): ${item.avg_room_board?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 'N/A'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cost Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tuition Cost Distribution (Annual)</h2>
            <div className="space-y-3">
              {costDist.map((item) => {
                const maxCount = Math.max(...costDist.map(d => d.count));
                const percentage = (item.count / maxCount) * 100;
                return (
                  <div key={item.cost_range}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.cost_range}</span>
                      <span className="text-sm text-gray-600">{item.count.toLocaleString()} schools</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top States */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top States by Institution Count</h2>
            <div className="space-y-2">
              {topStates.slice(0, 10).map((state, index) => {
                const maxCount = topStates[0]?.num_institutions || 1;
                const percentage = (state.num_institutions / maxCount) * 100;
                return (
                  <div key={state.state} className="flex items-center">
                    <div className="w-12 text-sm text-gray-500 font-semibold">#{index + 1}</div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-900">{state.state}</span>
                        <span className="text-sm text-gray-600">{state.num_institutions} institutions</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Room & Board Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Room & Board Distribution (Annual)</h2>
            <div className="space-y-3">
              {roomBoardDist.map((item) => {
                const maxCount = Math.max(...roomBoardDist.map(d => d.count));
                const percentage = (item.count / maxCount) * 100;
                return (
                  <div key={item.price_range}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.price_range}</span>
                      <span className="text-sm text-gray-600">{item.count.toLocaleString()} institutions</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Total Cost Leaders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Total Cost Leaders</h2>
          <p className="text-sm text-gray-600 mb-4">Institutions with highest combined annual tuition + room & board costs</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Institution</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">State</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Tuition (Annual)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Room & Board (Annual)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Cost (Annual)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {totalCostLeaders.slice(0, 15).map((school, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index < 3 ? 'bg-red-400 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{school.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{school.state}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {getControlLabel(school.control_public_private)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">${school.tuition_in_state?.toLocaleString() || 'N/A'}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">${school.room_board_on_campus?.toLocaleString() || 'N/A'}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-red-600">${school.total_cost?.toLocaleString() || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Most Affordable Public Institutions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Most Affordable Public Institutions</h2>
          <p className="text-sm text-gray-600 mb-4">Public colleges with the lowest annual in-state tuition (under $20K)</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Institution</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">State</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">In-State Tuition (Annual)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Fees (Annual)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Room & Board (Annual)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {affordablePublic.slice(0, 15).map((school, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index < 3 ? 'bg-green-400 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{school.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{school.state}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-green-600">${school.tuition_in_state.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">${school.fees?.toLocaleString() || 'N/A'}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">${school.room_board_on_campus?.toLocaleString() || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Dashboard Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="flex items-start">
              <span className="text-orange-600 mr-2">📊</span>
              <span>All costs shown are <strong>annual (yearly)</strong> figures for comparison</span>
            </div>
            <div className="flex items-start">
              <span className="text-orange-600 mr-2">💰</span>
              <span>Room & board costs typically range from <strong>$8K-$15K annually</strong></span>
            </div>
            <div className="flex items-start">
              <span className="text-orange-600 mr-2">🏛️</span>
              <span><strong>Public institutions</strong> offer the most affordable in-state tuition</span>
            </div>
            <div className="flex items-start">
              <span className="text-orange-600 mr-2">🎓</span>
              <span>Total annual cost (tuition + room & board) varies from <strong>$5K to $130K+</strong></span>
            </div>
            <div className="flex items-start">
              <span className="text-orange-600 mr-2">📍</span>
              <span>California, New York, and Texas lead in <strong>total institution count</strong></span>
            </div>
            <div className="flex items-start">
              <span className="text-orange-600 mr-2">💡</span>
              <span>Consider both <strong>tuition AND room & board</strong> for total cost planning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}