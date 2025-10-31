'use client';

import { useState, useEffect } from 'react';
import FinancialWidget from '@/components/FinancialWidget';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header - Clean and minimal */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">👋 Welcome back</div>
              <h1 className="text-3xl font-bold text-gray-900">Your Overview</h1>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: '2-digit', day: '2-digit', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Financial Metrics - Clean Widget Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Balance Style Widget */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">Total Institutions</span>
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.total_institutions?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-xs text-gray-500">Nationwide coverage</div>
            </div>

            {/* In-State Tuition */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-sm text-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-emerald-100">Avg In-State</span>
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">
                ${stats.avg_in_state_tuition?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 'N/A'}
              </div>
              <div className="flex items-center text-xs text-emerald-100">
                <span className="px-2 py-0.5 bg-white/20 rounded-full mr-2">↓ 12%</span>
                Annual tuition
              </div>
            </div>

            {/* Out-State Tuition */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">Avg Out-State</span>
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ${stats.avg_out_state_tuition?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 'N/A'}
              </div>
              <div className="text-xs text-gray-500">Annual tuition</div>
            </div>

            {/* Housing */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">Avg Housing</span>
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ${stats.avg_room_board?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 'N/A'}
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <span className="text-emerald-600 mr-2">↑ 20%</span>
                Room & board
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid - Clean widget layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue Categories / Institution Types - Donut Chart Style */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Institution Distribution</h2>
              <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              {byControlType.map((item) => {
                const percentage = totalControlInstitutions > 0 ? (item.count / totalControlInstitutions) * 100 : 0;
                const getBgColor = (control: number) => {
                  switch (control) {
                    case 1: return 'bg-blue-500';
                    case 2: return 'bg-emerald-500';
                    case 3: return 'bg-purple-500';
                    default: return 'bg-gray-500';
                  }
                };
                return (
                  <div key={item.control_public_private} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center flex-1">
                      <div className={`w-2 h-2 rounded-full ${getBgColor(item.control_public_private)} mr-3`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{getControlLabel(item.control_public_private)}</span>
                          <span className="text-sm font-semibold text-gray-900">{item.count.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`${getBgColor(item.control_public_private)} h-2 rounded-full transition-all duration-700`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Your Income / Top Performing - Compact Widget */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-sm text-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium text-indigo-100">Top Performers</h3>
              <button className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <div className="text-3xl font-bold mb-1">{totalCostLeaders.length > 0 ? totalCostLeaders[0].name : 'N/A'}</div>
              <div className="text-sm text-indigo-100">Highest Total Cost</div>
            </div>
            {totalCostLeaders.slice(0, 3).map((school, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-t border-white/10">
                <span className="text-sm text-indigo-100">{school.state}</span>
                <span className="text-sm font-semibold">${(school.total_cost / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Performance / Cost Analysis Chart Widget */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Cost Analysis</h2>
              <p className="text-sm text-gray-500 mt-1">Tuition distribution across institutions</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Month</button>
              <button className="px-3 py-1.5 text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">Year</button>
            </div>
          </div>
          <div className="space-y-3">
            {costDist.slice(0, 6).map((item) => {
              const maxCount = Math.max(...costDist.map(d => d.count));
              const percentage = (item.count / maxCount) * 100;
              return (
                <div key={item.cost_range} className="flex items-center">
                  <div className="w-32 text-sm text-gray-600">{item.cost_range}</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm font-medium text-gray-900">{item.count.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
