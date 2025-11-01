'use client';

import { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ZAxis } from 'recharts';

interface InstitutionDataPoint {
  name: string;
  cost: number;
  roi: number;
  control: string;
  state: string;
  unitid: number;
}

interface FilterState {
  state: string;
  controlType: string;
  minROI: number;
  maxCost: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<InstitutionDataPoint[]>([]);
  const [filteredData, setFilteredData] = useState<InstitutionDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxCostInData, setMaxCostInData] = useState(100000);
  const [minROIInData, setMinROIInData] = useState(0);
  const [maxROIInData, setMaxROIInData] = useState(3000000);
  const [filters, setFilters] = useState<FilterState>({
    state: 'all',
    controlType: 'all',
    minROI: 0,
    maxCost: 100000
  });
  const [states, setStates] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, data]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all institutions with ROI and cost data (no limit)
      const response = await fetch('/api/institutions?sortBy=roi_high&limit=10000');
      const result = await response.json();
      
      const dataPoints: InstitutionDataPoint[] = result.institutions
        .filter((inst: any) => 
          inst.institution_avg_roi != null &&  // Allow negative and zero values
          (inst.tuition_in_state || inst.tuition_out_state)
        )
        .map((inst: any) => ({
          name: inst.name,
          cost: (inst.tuition_in_state || inst.tuition_out_state || 0) + (inst.fees || 0) + (inst.room_board_on_campus || 0),
          roi: inst.institution_avg_roi,
          control: inst.control_of_institution === 1 ? 'Public' : inst.control_of_institution === 2 ? 'Private Nonprofit' : 'Private For-Profit',
          state: inst.state,
          unitid: inst.unitid
        }));

      setData(dataPoints);
      
      // Calculate max cost and min/max ROI from data
      const maxCost = Math.max(...dataPoints.map(d => d.cost));
      const minROI = Math.min(...dataPoints.map(d => d.roi));
      const maxROI = Math.max(...dataPoints.map(d => d.roi));
      
      setMaxCostInData(maxCost);
      setMinROIInData(minROI);
      setMaxROIInData(maxROI);
      
      // Update filter to use actual data ranges
      setFilters(prev => ({ 
        ...prev, 
        maxCost: maxCost,
        minROI: minROI  // Start at actual minimum ROI in dataset
      }));
      
      // Extract unique states
      const uniqueStates = [...new Set(dataPoints.map(d => d.state))].sort();
      setStates(uniqueStates);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...data];

    if (filters.state !== 'all') {
      filtered = filtered.filter(d => d.state === filters.state);
    }

    if (filters.controlType !== 'all') {
      filtered = filtered.filter(d => d.control === filters.controlType);
    }

    filtered = filtered.filter(d => 
      d.roi >= filters.minROI && d.cost <= filters.maxCost
    );

    setFilteredData(filtered);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 p-4 border border-gray-800 rounded-lg shadow-[0_0_12px_rgba(249,115,22,0.08)]">
          <p className="font-semibold text-white font-bold">{data.name}</p>
          <p className="text-sm text-gray-300">{data.state} • {data.control}</p>
          <p className="text-sm mt-2 text-white font-bold">
            <span className="font-semibold">Annual Cost:</span> ${data.cost.toLocaleString()}
          </p>
          <p className="text-sm text-white font-bold">
            <span className="font-semibold">30-Year ROI:</span> ${data.roi.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const getColorByControl = (control: string) => {
    switch (control) {
      case 'Public':
        return '#3B82F6'; // blue
      case 'Private Nonprofit':
        return '#10B981'; // green
      case 'Private For-Profit':
        return '#EF4444'; // red
      default:
        return '#6B7280'; // gray
    }
  };

  // Prepare data for scatter plot
  const publicData = filteredData.filter(d => d.control === 'Public');
  const privateNonprofitData = filteredData.filter(d => d.control === 'Private Nonprofit');
  const privateForProfitData = filteredData.filter(d => d.control === 'Private For-Profit');

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white font-bold">College ROI Analytics</h1>
          <p className="mt-2 text-gray-300">
            Visualize the relationship between college costs and return on investment across thousands of institutions
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-[0_0_8px_rgba(249,115,22,0.06)] p-6 mb-6">
          <h2 className="text-lg font-semibold text-white font-bold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* State Filter */}
            <div>
              <label className="block text-sm font-medium text-white font-bold mb-2">
                State
              </label>
              <select
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-white font-bold focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* Control Type Filter */}
            <div>
              <label className="block text-sm font-medium text-white font-bold mb-2">
                Institution Type
              </label>
              <select
                value={filters.controlType}
                onChange={(e) => setFilters({ ...filters, controlType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-white font-bold focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="Public">Public</option>
                <option value="Private Nonprofit">Private Nonprofit</option>
                <option value="Private For-Profit">Private For-Profit</option>
              </select>
            </div>

            {/* Min ROI Filter */}
            <div>
              <label className="block text-sm font-medium text-white font-bold mb-2">
                Minimum ROI: ${(filters.minROI / 1000).toFixed(0)}k
              </label>
              <input
                type="range"
                min={minROIInData}
                max={maxROIInData}
                step="50000"
                value={filters.minROI}
                onChange={(e) => setFilters({ ...filters, minROI: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Max Cost Filter */}
            <div>
              <label className="block text-sm font-medium text-white font-bold mb-2">
                Max Cost: ${(filters.maxCost / 1000).toFixed(0)}k
              </label>
              <input
                type="range"
                min="0"
                max={maxCostInData}
                step="5000"
                value={filters.maxCost}
                onChange={(e) => setFilters({ ...filters, maxCost: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-300">
            Showing <span className="font-semibold text-white font-bold">{filteredData.length}</span> of <span className="font-semibold text-white font-bold">{data.length}</span> institutions
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-[0_0_8px_rgba(249,115,22,0.06)] p-6">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-gray-300 font-medium">Loading chart data...</div>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-white font-bold mb-6">
                30-Year ROI vs Annual Cost
              </h2>
              <ResponsiveContainer width="100%" height={500}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="cost" 
                    name="Annual Cost"
                    label={{ value: 'Total Annual Cost ($)', position: 'bottom', offset: 40 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="roi" 
                    name="ROI"
                    label={{ value: '30-Year ROI ($)', angle: -90, position: 'insideLeft', offset: 10 }}
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                    domain={['auto', 'auto']}
                  />
                  <ZAxis range={[50, 50]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    wrapperStyle={{ paddingBottom: '20px' }}
                  />
                  <Scatter 
                    name="Public" 
                    data={publicData} 
                    fill="#3B82F6"
                    opacity={0.6}
                  />
                  <Scatter 
                    name="Private Nonprofit" 
                    data={privateNonprofitData} 
                    fill="#10B981"
                    opacity={0.6}
                  />
                  <Scatter 
                    name="Private For-Profit" 
                    data={privateForProfitData} 
                    fill="#EF4444"
                    opacity={0.6}
                  />
                </ScatterChart>
              </ResponsiveContainer>

              {/* Insights */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white font-bold mb-1">Public Institutions</h3>
                  <p className="text-2xl font-bold text-orange-400">{publicData.length}</p>
                  <p className="text-xs text-orange-500 mt-1">
                    Avg ROI: ${publicData.length > 0 ? ((publicData.reduce((sum, d) => sum + d.roi, 0) / publicData.length) / 1000000).toFixed(2) : 0}M
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-green-900 mb-1">Private Nonprofit</h3>
                  <p className="text-2xl font-bold text-green-700">{privateNonprofitData.length}</p>
                  <p className="text-xs text-green-600 mt-1">
                    Avg ROI: ${privateNonprofitData.length > 0 ? ((privateNonprofitData.reduce((sum, d) => sum + d.roi, 0) / privateNonprofitData.length) / 1000000).toFixed(2) : 0}M
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-red-900 mb-1">Private For-Profit</h3>
                  <p className="text-2xl font-bold text-red-700">{privateForProfitData.length}</p>
                  <p className="text-xs text-red-600 mt-1">
                    Avg ROI: ${privateForProfitData.length > 0 ? ((privateForProfitData.reduce((sum, d) => sum + d.roi, 0) / privateForProfitData.length) / 1000000).toFixed(2) : 0}M
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
