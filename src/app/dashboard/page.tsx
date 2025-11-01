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
    case 1: return 'bg-orange-500/100';
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
            <p className="mt-4 text-gray-300">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalControlInstitutions = byControlType.reduce((sum, item) => sum + item.count, 0);
  
  // Derive most expensive and most affordable from totalCostLeaders
  const mostExpensive = totalCostLeaders.slice(0, 10).map(school => ({
    institution_name: school.name,
    state: school.state,
    tuition: school.tuition_in_state
  }));
  
  const mostAffordable = totalCostLeaders
    .sort((a, b) => a.total_cost - b.total_cost)
    .slice(0, 10)
    .map(school => ({
      institution_name: school.name,
      state: school.state,
      tuition: school.tuition_in_state
    }));

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header - black/orange theme */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1 flex items-center">
                <span className="mr-2">👋</span>
                <span>Welcome back</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Your Overview</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 transition-colors">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
              <div className="text-sm text-gray-400 bg-gray-900 px-4 py-2 rounded-lg border border-gray-800">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Total Balance Widget - Large feature card */}
          {stats && (
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-2xl p-6 shadow-[0_0_12px_rgba(249,115,22,0.08)] border border-gray-800 h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-400">Total Institutions</span>
                  <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-4xl font-bold tracking-tight text-white mb-2">
                    {stats.total_institutions?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full text-xs font-medium mr-2">
                      ↓ 12%
                    </span>
                    <span className="text-gray-400">Nationwide coverage</span>
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-gray-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Avg In-State</span>
                    <span className="font-semibold text-white">${stats.avg_in_state_tuition?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Avg Out-State</span>
                    <span className="font-semibold text-white">${stats.avg_out_state_tuition?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Avg Housing</span>
                    <span className="font-semibold text-white">${stats.avg_room_board?.toLocaleString(undefined, {maximumFractionDigits: 0}) || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Categories / Institution Distribution - with donut chart style */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-2xl p-6 shadow-[0_0_12px_rgba(249,115,22,0.08)] border border-gray-800 h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Institution Distribution</h3>
                  <p className="text-sm text-gray-400 mt-1">By control type</p>
                </div>
                <button className="text-gray-400 hover:text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {byControlType.map((item) => {
                  const percentage = totalControlInstitutions > 0 ? (item.count / totalControlInstitutions) * 100 : 0;
                  const getColor = (control: number) => {
                    switch (control) {
                      case 1: return { dot: 'bg-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-400' };
                      case 2: return { dot: 'bg-orange-600', bg: 'bg-orange-600/10', text: 'text-orange-500' };
                      case 3: return { dot: 'bg-orange-400', bg: 'bg-orange-400/10', text: 'text-orange-300' };
                      default: return { dot: 'bg-gray-500', bg: 'bg-gray-800', text: 'text-gray-400' };
                    }
                  };
                  const colors = getColor(item.control_public_private);
                  return (
                    <div key={item.control_public_private} className={`${colors.bg} rounded-xl p-4`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-3 h-3 ${colors.dot} rounded-full`}></div>
                        <span className={`text-xs font-medium ${colors.text}`}>{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="text-sm font-medium text-gray-400 mb-1">{getControlLabel(item.control_public_private)}</div>
                      <div className="text-2xl font-bold text-white">{item.count.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Second Row - Cost metrics and more data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Cost Distribution */}
          <div className="bg-gray-900 rounded-2xl shadow-[0_0_12px_rgba(249,115,22,0.08)] border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Tuition Cost Distribution</h3>
                <p className="text-sm text-gray-400 mt-1">Annual tuition ranges</p>
              </div>
            </div>
            <div className="space-y-2">
              {costDist.map((item) => {
                const maxCount = Math.max(...costDist.map(d => d.count));
                const percentage = (item.count / maxCount) * 100;
                return (
                  <div key={item.cost_range}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-300">{item.cost_range}</span>
                      <span className="text-sm text-gray-400">{item.count.toLocaleString()} schools</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Third Row - Top States and Room & Board */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top States */}
          <div className="bg-gray-900 rounded-2xl shadow-[0_0_12px_rgba(249,115,22,0.08)] border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Top States</h3>
                <p className="text-sm text-gray-400 mt-1">By institution count</p>
              </div>
            </div>
            <div className="space-y-3">
              {topStates.slice(0, 10).map((state, index) => {
                const maxCount = topStates[0]?.num_institutions || 1;
                const percentage = (state.num_institutions / maxCount) * 100;
                return (
                  <div key={state.state} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      index < 3 ? 'bg-orange-500/10 text-orange-500' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-semibold text-white">{state.state}</span>
                        <span className="text-sm text-gray-400">{state.num_institutions}</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full"
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
          <div className="bg-gray-900 rounded-2xl shadow-[0_0_12px_rgba(249,115,22,0.08)] border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Room & Board Distribution</h3>
                <p className="text-sm text-gray-400 mt-1">Annual housing costs</p>
              </div>
            </div>
            <div className="space-y-2">
              {roomBoardDist.map((item) => {
                const maxCount = Math.max(...roomBoardDist.map(d => d.count));
                const percentage = (item.count / maxCount) * 100;
                return (
                  <div key={item.price_range}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-300">{item.price_range}</span>
                      <span className="text-sm text-gray-400">{item.count.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fourth Row - Cost Leaders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Most Expensive */}
          <div className="bg-gray-900 rounded-2xl shadow-[0_0_12px_rgba(249,115,22,0.08)] border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Highest Tuition</h3>
                <p className="text-sm text-gray-400 mt-1">Top 10 most expensive</p>
              </div>
              <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              {mostExpensive.map((school, index) => (
                <div key={school.institution_name} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="w-6 h-6 bg-orange-500/10 text-orange-500 rounded flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{school.institution_name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{school.state}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-orange-500">${school.tuition?.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                    <div className="text-xs text-gray-400">per year</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Affordable */}
          <div className="bg-gray-900 rounded-2xl shadow-[0_0_12px_rgba(249,115,22,0.08)] border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Lowest Tuition</h3>
                <p className="text-sm text-gray-400 mt-1">Top 10 most affordable</p>
              </div>
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              {mostAffordable.map((school, index) => (
                <div key={school.institution_name} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="w-6 h-6 bg-green-500/10 text-green-400 rounded flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{school.institution_name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{school.state}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-green-400">${school.tuition?.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                    <div className="text-xs text-gray-400">per year</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Total Cost Leaders Table - Full width */}
        <div className="bg-gray-900 rounded-2xl shadow-[0_0_12px_rgba(249,115,22,0.08)] border border-gray-800 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Total Cost Leaders</h3>
              <p className="text-sm text-gray-400 mt-1">Highest combined annual tuition + room & board costs</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-orange-500 bg-orange-500/10 rounded-lg hover:bg-orange-500/20 transition-colors">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Institution</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">State</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Tuition</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Room & Board</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {totalCostLeaders.slice(0, 15).map((school, index) => (
                  <tr key={index} className="hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                        index < 3 ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-white">{school.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-400">{school.state}</td>
                    <td className="px-4 py-4">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-500 font-medium">
                        {getControlLabel(school.control_public_private)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-white">${school.tuition_in_state?.toLocaleString() || 'N/A'}</td>
                    <td className="px-4 py-3 text-right text-sm text-white">${school.room_board_on_campus?.toLocaleString() || 'N/A'}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-orange-500">${school.total_cost?.toLocaleString() || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Most Affordable Public Institutions */}
        <div className="bg-gray-900 rounded-lg shadow-[0_0_12px_rgba(249,115,22,0.08)] border border-gray-800 p-6 mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Most Affordable Public Institutions</h2>
          <p className="text-sm text-gray-400 mb-4">Public colleges with the lowest annual in-state tuition (under $20K)</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Institution</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">State</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">In-State Tuition (Annual)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Fees (Annual)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Room & Board (Annual)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {affordablePublic.slice(0, 15).map((school, index) => (
                  <tr key={index} className="hover:bg-gray-800/80 transition-all duration-200">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index < 3 ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-white">{school.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{school.state}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-green-400">${school.tuition_in_state.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-sm text-white">${school.fees?.toLocaleString() || 'N/A'}</td>
                    <td className="px-4 py-3 text-right text-sm text-white">${school.room_board_on_campus?.toLocaleString() || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-lg border border-orange-500/20 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Dashboard Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-300">
            <div className="flex items-start">
              <span className="text-orange-500 mr-2">📊</span>
              <span>All costs shown are <strong className="text-white">annual (yearly)</strong> figures for comparison</span>
            </div>
            <div className="flex items-start">
              <span className="text-orange-500 mr-2">💰</span>
              <span>Room & board costs typically range from <strong className="text-white">$8K-$15K annually</strong></span>
            </div>
            <div className="flex items-start">
              <span className="text-orange-500 mr-2">🏫</span>
              <span><strong className="text-white">Public institutions</strong> offer the most affordable in-state tuition</span>
            </div>
            <div className="flex items-start">
              <span className="text-orange-500 mr-2">🎓</span>
              <span>Total annual cost (tuition + room & board) varies from <strong className="text-white">$5K to $130K+</strong></span>
            </div>
            <div className="flex items-start">
              <span className="text-orange-500 mr-2">📍</span>
              <span>California, New York, and Texas lead in <strong className="text-white">total institution count</strong></span>
            </div>
            <div className="flex items-start">
              <span className="text-orange-500 mr-2">💡</span>
              <span>Consider both <strong className="text-white">tuition AND room & board</strong> for total cost planning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}