'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ZAxis } from 'recharts';

interface InstitutionDataPoint {
  name: string;
  cost: number;
  roi: number;
  control: string;
  state: string;
  unitid: number;
}

interface InstitutionDetail {
  unitid: number;
  name: string;
  city: string;
  state: string;
  control: string;
  cost: number;
  avgROI: number;
  topProgram: { title: string; roi: number; cipCode: string } | null;
  bottomProgram: { title: string; roi: number; cipCode: string } | null;
}

interface FilterState {
  states: string[];
  controlTypes: string[];
  minROI: number;
  maxCost: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<InstitutionDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionDetail | null>(null);
  const [institutionLoading, setInstitutionLoading] = useState(false);
  const [maxCostInData, setMaxCostInData] = useState(100000);
  const [minROIInData, setMinROIInData] = useState(0);
  const [maxROIInData, setMaxROIInData] = useState(3000000);
  const [filters, setFilters] = useState<FilterState>({
    states: [],
    controlTypes: [],
    minROI: 0,
    maxCost: 100000
  });
  const [states, setStates] = useState<string[]>([]);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  
  const stateDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Optimize filtering with useMemo to prevent unnecessary recalculations
  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (filters.states.length > 0) {
      filtered = filtered.filter(d => filters.states.includes(d.state));
    }

    if (filters.controlTypes.length > 0) {
      filtered = filtered.filter(d => filters.controlTypes.includes(d.control));
    }

    filtered = filtered.filter(d => 
      d.roi >= filters.minROI && d.cost <= filters.maxCost
    );

    return filtered;
  }, [data, filters]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target as Node)) {
        setStateDropdownOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setTypeDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch ALL institutions with ROI data (ENG-363)
      // Increase limit to 10000 to ensure we get all institutions with ROI
      // ROI data comes from institution_avg_roi column, calculated with 40-year career formula (ENG-298)
      const response = await fetch('/api/institutions?sortBy=roi_high&limit=10000');
      const result = await response.json();
      
      console.log('[Analytics ENG-363] Raw API response:', {
        totalFetched: result.institutions?.length,
        firstFew: result.institutions?.slice(0, 3).map((i: any) => ({
          name: i.name,
          roi: i.institution_avg_roi,
          tuition_in: i.tuition_in_state,
          tuition_out: i.tuition_out_state
        }))
      });
      
      const dataPoints: InstitutionDataPoint[] = result.institutions
        .filter((inst: any) => {
          const hasROI = inst.institution_avg_roi != null;
          const hasCost = inst.tuition_in_state || inst.tuition_out_state;
          if (!hasROI) console.log('[Analytics] Filtered out (no ROI):', inst.name);
          if (!hasCost) console.log('[Analytics] Filtered out (no cost):', inst.name);
          return hasROI && hasCost;
        })
        .map((inst: any) => ({
          name: inst.name,
          cost: (inst.tuition_in_state || inst.tuition_out_state || 0) + (inst.fees || 0) + (inst.room_board_on_campus || 0),
          roi: inst.institution_avg_roi, // 40-year ROI from database (recalculated in ENG-298)
          control: inst.control_of_institution === 1 ? 'Public' : inst.control_of_institution === 2 ? 'Private Nonprofit' : 'Private For-Profit',
          state: inst.state,
          unitid: inst.unitid
        }));
      
      console.log('[Analytics ENG-363] Final data points:', {
        count: dataPoints.length,
        roiRange: dataPoints.length > 0 ? {
          min: Math.min(...dataPoints.map(d => d.roi)),
          max: Math.max(...dataPoints.map(d => d.roi))
        } : null
      });

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
            <span className="font-semibold">40-Year ROI:</span> ${data.roi.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-3 italic">
            Click dot to calculate ROI →
          </p>
        </div>
      );
    }
    return null;
  };

  const handleDotClick = async (data: any, index: number) => {
    // In recharts onClick, the data structure can vary
    let institutionData = data;
    
    if (data?.payload) {
      institutionData = data.payload;
    }
    
    console.log('[Analytics] Dot clicked:', {
      index,
      unitid: institutionData?.unitid,
      name: institutionData?.name,
      cost: institutionData?.cost,
      roi: institutionData?.roi,
      fullData: institutionData
    });
    
    if (!institutionData?.unitid || !institutionData?.name) {
      console.error('[Analytics] Invalid institution data structure:', institutionData);
      return;
    }
    
    // Close any existing popup first
    setSelectedInstitution(null);
    setInstitutionLoading(true);
    
    try {
      // Fetch institution details
      console.log('[Analytics] Fetching institution:', institutionData.unitid);
      const instResponse = await fetch(`/api/institutions/${institutionData.unitid}`);
      if (!instResponse.ok) {
        console.error('[Analytics] Failed to fetch institution:', instResponse.status);
        throw new Error('Failed to fetch institution');
      }
      
      const instData = await instResponse.json();
      const institution = instData.institution;
      console.log('[Analytics] Institution fetched:', institution.name, institution.unitid);
      
      // Fetch programs to get top and bottom ROI
      console.log('[Analytics] Fetching programs for:', institutionData.unitid);
      const programsResponse = await fetch(`/api/institutions/${institutionData.unitid}/programs`);
      if (!programsResponse.ok) {
        console.error('[Analytics] Failed to fetch programs:', programsResponse.status);
        throw new Error('Failed to fetch programs');
      }
      
      const programsData = await programsResponse.json();
      const programsWithROI = programsData.programs?.filter((p: any) => p.program_roi != null) || [];
      console.log('[Analytics] Programs with ROI:', programsWithROI.length, 'out of', programsData.programs?.length || 0);
      
      const sortedPrograms = programsWithROI.sort((a: any, b: any) => (b.program_roi || 0) - (a.program_roi || 0));
      
      const topProgram = sortedPrograms[0] || null;
      const bottomProgram = sortedPrograms[sortedPrograms.length - 1] || null;
      
      console.log('[Analytics] Top program:', topProgram?.cip_title, topProgram?.program_roi);
      console.log('[Analytics] Bottom program:', bottomProgram?.cip_title, bottomProgram?.program_roi);
      
      // Set institution detail for popup
      setSelectedInstitution({
        unitid: institution.unitid,
        name: institution.name,
        city: institution.city || '',
        state: institution.state || '',
        control: institutionData.control,
        cost: institutionData.cost,
        avgROI: institutionData.roi,
        topProgram: topProgram ? {
          title: topProgram.cip_title,
          roi: topProgram.program_roi,
          cipCode: topProgram.cipcode
        } : null,
        bottomProgram: bottomProgram ? {
          title: bottomProgram.cip_title,
          roi: bottomProgram.program_roi,
          cipCode: bottomProgram.cipcode
        } : null
      });
      
      console.log('[Analytics] ✅ Popup data set for:', institution.name);
    } catch (error) {
      console.error('[Analytics] Error fetching institution details:', error);
      setSelectedInstitution(null);
    } finally {
      setInstitutionLoading(false);
    }
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
            Visualize the relationship between college costs and 40-year return on investment across thousands of institutions
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-[0_0_8px_rgba(249,115,22,0.06)] p-6 mb-6">
          <h2 className="text-lg font-semibold text-white font-bold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* State Filter - Multi-select Dropdown */}
            <div className="relative" ref={stateDropdownRef}>
              <label className="block text-sm font-medium text-white font-bold mb-2">
                States {filters.states.length > 0 ? `(${filters.states.length} selected)` : '(All)'}
              </label>
              <div className="relative">
                <button
                  onClick={() => setStateDropdownOpen(!stateDropdownOpen)}
                  className="w-full cursor-pointer border border-gray-700 rounded-lg bg-black px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  <span className="flex items-center justify-between">
                    <span>
                      {filters.states.length === 0 
                        ? 'All States' 
                        : filters.states.length === 1 
                        ? filters.states[0]
                        : `${filters.states.length} states selected`}
                    </span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {stateDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full border border-gray-700 rounded-lg bg-gray-900 shadow-lg max-h-64 overflow-y-auto">
                    <div className="p-2 space-y-1">
                      {/* Select All / Clear All */}
                      <div className="flex gap-2 pb-2 border-b border-gray-700 mb-2">
                        <button
                          onClick={() => setFilters({ ...filters, states: [...states] })}
                          className="flex-1 text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition-colors"
                        >
                          Select All
                        </button>
                        <button
                          onClick={() => setFilters({ ...filters, states: [] })}
                          className="flex-1 text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                      {states.map(state => (
                        <label key={state} className="flex items-center space-x-2 p-1 hover:bg-gray-800 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.states.includes(state)}
                            onChange={(e) => {
                              const newStates = e.target.checked
                                ? [...filters.states, state]
                                : filters.states.filter(s => s !== state);
                              setFilters({ ...filters, states: newStates });
                            }}
                            className="rounded border-gray-600 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="text-sm text-gray-300">{state}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Control Type Filter - Multi-select Dropdown */}
            <div className="relative" ref={typeDropdownRef}>
              <label className="block text-sm font-medium text-white font-bold mb-2">
                Institution Types {filters.controlTypes.length > 0 ? `(${filters.controlTypes.length} selected)` : '(All)'}
              </label>
              <div className="relative">
                <button
                  onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                  className="w-full cursor-pointer border border-gray-700 rounded-lg bg-black px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  <span className="flex items-center justify-between">
                    <span>
                      {filters.controlTypes.length === 0 
                        ? 'All Types' 
                        : filters.controlTypes.length === 1 
                        ? filters.controlTypes[0]
                        : `${filters.controlTypes.length} types selected`}
                    </span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {typeDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full border border-gray-700 rounded-lg bg-gray-900 shadow-lg">
                    <div className="p-2 space-y-1">
                      {/* Select All / Clear All */}
                      <div className="flex gap-2 pb-2 border-b border-gray-700 mb-2">
                        <button
                          onClick={() => setFilters({ ...filters, controlTypes: ['Public', 'Private Nonprofit', 'Private For-Profit'] })}
                          className="flex-1 text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition-colors"
                        >
                          Select All
                        </button>
                        <button
                          onClick={() => setFilters({ ...filters, controlTypes: [] })}
                          className="flex-1 text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                      {['Public', 'Private Nonprofit', 'Private For-Profit'].map(type => (
                        <label key={type} className="flex items-center space-x-2 p-1 hover:bg-gray-800 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.controlTypes.includes(type)}
                            onChange={(e) => {
                              const newTypes = e.target.checked
                                ? [...filters.controlTypes, type]
                                : filters.controlTypes.filter(t => t !== type);
                              setFilters({ ...filters, controlTypes: newTypes });
                            }}
                            className="rounded border-gray-600 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="text-sm text-gray-300">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                40-Year ROI vs Annual Cost
              </h2>
              <ResponsiveContainer width="100%" height={500}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 100 }}>
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
                    label={{ value: '40-Year ROI ($)', angle: -90, position: 'insideLeft', offset: -10, style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                    domain={[
                      (dataMin: number) => Math.floor(dataMin / 1000000) * 1000000,
                      (dataMax: number) => Math.ceil(dataMax / 1000000) * 1000000
                    ]}
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
                    onClick={handleDotClick}
                    cursor="pointer"
                  />
                  <Scatter 
                    name="Private Nonprofit" 
                    data={privateNonprofitData} 
                    fill="#10B981"
                    opacity={0.6}
                    onClick={handleDotClick}
                    cursor="pointer"
                  />
                  <Scatter 
                    name="Private For-Profit" 
                    data={privateForProfitData} 
                    fill="#EF4444"
                    opacity={0.6}
                    onClick={handleDotClick}
                    cursor="pointer"
                  />
                </ScatterChart>
              </ResponsiveContainer>

              {/* Institution Detail Popup (ENG-365) */}
              {selectedInstitution && (
                <div className="mt-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-blue-500/50 rounded-xl p-6 shadow-xl">
                  {institutionLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                    </div>
                  ) : (
                    <>
                      {/* Header */}
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold text-white mb-1">{selectedInstitution.name}</h3>
                        <p className="text-sm text-gray-400">
                          {selectedInstitution.city}, {selectedInstitution.state} • {selectedInstitution.control === 'Public' ? 'Public' : selectedInstitution.control === 'Private nonprofit' ? 'Private Nonprofit' : 'Private For-Profit'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Unit ID: {selectedInstitution.unitid}</p>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                          <h4 className="text-xs font-semibold text-gray-400 mb-1">Cost of Attendance</h4>
                          <p className="text-xl font-bold text-white">${(selectedInstitution.cost / 1000).toFixed(0)}K</p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-3">
                          <h4 className="text-xs font-semibold text-blue-400 mb-1">Average ROI</h4>
                          <p className="text-xl font-bold text-blue-400">${(selectedInstitution.avgROI / 1000000).toFixed(2)}M</p>
                        </div>
                        <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-3">
                          <h4 className="text-xs font-semibold text-orange-400 mb-1">ROI Ratio</h4>
                          <p className="text-xl font-bold text-orange-400">{(selectedInstitution.avgROI / selectedInstitution.cost).toFixed(1)}x</p>
                        </div>
                      </div>

                      {/* Programs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {/* Highest ROI Program */}
                        {selectedInstitution.topProgram ? (
                          <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-green-400 mb-2">🏆 Highest ROI Program</h4>
                            <p className="text-white font-medium mb-1 text-sm">{selectedInstitution.topProgram.title}</p>
                            <p className="text-green-400 font-bold text-lg">${(selectedInstitution.topProgram.roi / 1000000).toFixed(2)}M</p>
                          </div>
                        ) : (
                          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-400 mb-2">🏆 Highest ROI Program</h4>
                            <p className="text-gray-500 text-sm">Program-level ROI data not yet available for this institution. Check back later or view the college detail page for other metrics.</p>
                          </div>
                        )}

                        {/* Lowest ROI Program */}
                        {selectedInstitution.bottomProgram ? (
                          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-red-400 mb-2">📉 Lowest ROI Program</h4>
                            <p className="text-white font-medium mb-1 text-sm">{selectedInstitution.bottomProgram.title}</p>
                            <p className="text-red-400 font-bold text-lg">${(selectedInstitution.bottomProgram.roi / 1000000).toFixed(2)}M</p>
                          </div>
                        ) : (
                          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-400 mb-2">📉 Lowest ROI Program</h4>
                            <p className="text-gray-500 text-sm">Program-level ROI data not yet available for this institution. Check back later or view the college detail page for other metrics.</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => window.location.href = `/colleges/${selectedInstitution.unitid}`}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                          📊 View Full Details
                        </button>
                        {selectedInstitution.topProgram && (
                          <button
                            onClick={() => window.location.href = `/roi-calculator?institution=${selectedInstitution.unitid}&program=${selectedInstitution.topProgram!.cipCode}`}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                          >
                            💰 Calculate ROI (Highest)
                          </button>
                        )}
                        {selectedInstitution.bottomProgram && (
                          <button
                            onClick={() => window.location.href = `/roi-calculator?institution=${selectedInstitution.unitid}&program=${selectedInstitution.bottomProgram!.cipCode}`}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                          >
                            📉 Calculate ROI (Lowest)
                          </button>
                        )}
                      </div>

                      {/* Close Button */}
                      <button
                        onClick={() => setSelectedInstitution(null)}
                        className="mt-4 w-full text-gray-400 hover:text-white text-sm py-2 transition-colors"
                      >
                        Close
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Overall Statistics */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-gray-400 mb-1">Total Institutions</h3>
                  <p className="text-2xl font-bold text-white">{filteredData.length}</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-blue-400 mb-1">Average ROI</h3>
                  <p className="text-2xl font-bold text-blue-400">
                    ${filteredData.length > 0 ? ((filteredData.reduce((sum, d) => sum + d.roi, 0) / filteredData.length) / 1000000).toFixed(2) : 0}M
                  </p>
                </div>
                <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-green-400 mb-1">Maximum ROI</h3>
                  <p className="text-2xl font-bold text-green-400">
                    ${filteredData.length > 0 ? (Math.max(...filteredData.map(d => d.roi)) / 1000000).toFixed(2) : 0}M
                  </p>
                </div>
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-red-400 mb-1">Minimum ROI</h3>
                  <p className="text-2xl font-bold text-red-400">
                    ${filteredData.length > 0 ? (Math.min(...filteredData.map(d => d.roi)) / 1000000).toFixed(2) : 0}M
                  </p>
                </div>
              </div>

              {/* Insights by Institution Type */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white font-bold mb-1">Public Institutions</h3>
                  <p className="text-2xl font-bold text-orange-400 break-words">{publicData.length}</p>
                  <p className="text-xs text-orange-500 mt-1 break-words">
                    Avg ROI: ${publicData.length > 0 ? ((publicData.reduce((sum, d) => sum + d.roi, 0) / publicData.length) / 1000000).toFixed(2) : 0}M
                  </p>
                </div>
                <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white font-bold mb-1">Private Nonprofit</h3>
                  <p className="text-2xl font-bold text-green-400 break-words">{privateNonprofitData.length}</p>
                  <p className="text-xs text-green-500 mt-1 break-words">
                    Avg ROI: ${privateNonprofitData.length > 0 ? ((privateNonprofitData.reduce((sum, d) => sum + d.roi, 0) / privateNonprofitData.length) / 1000000).toFixed(2) : 0}M
                  </p>
                </div>
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white font-bold mb-1">Private For-Profit</h3>
                  <p className="text-2xl font-bold text-red-400 break-words">{privateForProfitData.length}</p>
                  <p className="text-xs text-red-500 mt-1 break-words">
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
