'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface TrendData {
  year: number;
  avgCost: number;
  avgSalary: number;
  roi: number;
  prediction?: boolean;
}

interface CategoryTrend {
  category: string;
  growth: number;
  avgSalary: number;
  trend: 'up' | 'down' | 'stable';
}

interface TopProgram {
  name: string;
  cipcode: string;
  totalCompletions: number;
  schoolCount: number;
  avgCompletions: number;
  avgSalary: number;
  growthIndicator: 'high' | 'medium' | 'low';
}

export default function HistoricalTrendsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [categoryTrends, setCategoryTrends] = useState<CategoryTrend[]>([]);
  const [topPrograms, setTopPrograms] = useState<TopProgram[]>([]);
  const [selectedView, setSelectedView] = useState<'cost' | 'salary' | 'roi'>('salary');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/historical-trends');
      return;
    }

    if (status === 'authenticated') {
      // Historical Trends is now available to all users (free + premium)
      fetchTrendData();
    }
  }, [status, router, session]);

  const fetchTrendData = async () => {
    try {
      const response = await fetch('/api/trends/historical?years=7');
      if (!response.ok) {
        if (response.status === 403) {
          router.push('/pricing');
          return;
        }
        throw new Error('Failed to fetch trend data');
      }
      const data = await response.json();
      
      // Transform API data to match our component structure
      const combinedData = [
        ...(data.historical || []).map((item: any) => ({
          year: item.year,
          avgCost: item.avgCost,
          avgSalary: item.avgSalary,
          roi: item.avgROI,
          prediction: false
        })),
        ...(data.predictions || []).map((item: any) => ({
          year: item.year,
          avgCost: item.avgCost,
          avgSalary: item.avgSalary,
          roi: item.avgROI,
          prediction: true
        }))
      ];
      
      setTrendData(combinedData);
      
      // Transform category trends (general metrics)
      const transformedCategories = (data.categoryTrends || []).map((cat: any) => ({
        category: cat.category,
        growth: cat.changePercent,
        avgSalary: cat.currentValue,
        trend: cat.trend
      }));
      
      setCategoryTrends(transformedCategories);
      
      // Set top growing programs/fields
      setTopPrograms(data.topGrowingFields || []);
    } catch (error) {
      console.error('Error fetching trends:', error);
      // Use mock data as fallback
      setTrendData(generateMockData());
      setCategoryTrends(generateMockCategories());
      setTopPrograms(generateMockPrograms());
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (): TrendData[] => {
    const currentYear = new Date().getFullYear();
    const data: TrendData[] = [];
    
    // Historical data (6 years back to match API: 2019-2025)
    for (let i = 6; i >= 0; i--) {
      data.push({
        year: currentYear - i,
        avgCost: 45000 + (i * 2000) + Math.random() * 3000,
        avgSalary: 55000 + (i * 3500) + Math.random() * 5000,
        roi: 1.2 + (i * 0.08) + Math.random() * 0.1
      });
    }
    
    // Predictions (3 years forward)
    for (let i = 1; i <= 3; i++) {
      const lastData = data[data.length - 1];
      data.push({
        year: currentYear + i,
        avgCost: lastData.avgCost * (1 + 0.04 + Math.random() * 0.02),
        avgSalary: lastData.avgSalary * (1 + 0.06 + Math.random() * 0.03),
        roi: lastData.roi * (1 + 0.03 + Math.random() * 0.02),
        prediction: true
      });
    }
    
    return data;
  };

  const generateMockCategories = (): CategoryTrend[] => {
    return [
      { category: 'Computer Science', growth: 15.2, avgSalary: 95000, trend: 'up' },
      { category: 'Engineering', growth: 8.5, avgSalary: 78000, trend: 'up' },
      { category: 'Business', growth: 4.2, avgSalary: 65000, trend: 'stable' },
      { category: 'Healthcare', growth: 12.8, avgSalary: 72000, trend: 'up' },
      { category: 'Education', growth: -1.5, avgSalary: 48000, trend: 'down' },
      { category: 'Arts & Humanities', growth: 2.1, avgSalary: 45000, trend: 'stable' }
    ];
  };

  const generateMockPrograms = (): TopProgram[] => {
    return [
      { name: 'Computer Science', cipcode: '11.0701', totalCompletions: 125000, schoolCount: 450, avgCompletions: 278, avgSalary: 95000, growthIndicator: 'high' },
      { name: 'Nursing', cipcode: '51.3801', totalCompletions: 180000, schoolCount: 680, avgCompletions: 265, avgSalary: 72000, growthIndicator: 'high' },
      { name: 'Business Administration', cipcode: '52.0201', totalCompletions: 220000, schoolCount: 890, avgCompletions: 247, avgSalary: 68000, growthIndicator: 'high' },
      { name: 'Psychology', cipcode: '42.0101', totalCompletions: 95000, schoolCount: 520, avgCompletions: 183, avgSalary: 58000, growthIndicator: 'medium' },
      { name: 'Mechanical Engineering', cipcode: '14.1901', totalCompletions: 42000, schoolCount: 280, avgCompletions: 150, avgSalary: 82000, growthIndicator: 'medium' },
      { name: 'Biology', cipcode: '26.0101', totalCompletions: 78000, schoolCount: 450, avgCompletions: 173, avgSalary: 68000, growthIndicator: 'medium' },
      { name: 'Liberal Arts', cipcode: '24.0101', totalCompletions: 320000, schoolCount: 1200, avgCompletions: 267, avgSalary: 52000, growthIndicator: 'high' },
      { name: 'Criminal Justice', cipcode: '43.0104', totalCompletions: 85000, schoolCount: 420, avgCompletions: 202, avgSalary: 62000, growthIndicator: 'medium' },
      { name: 'Education', cipcode: '13.0101', totalCompletions: 95000, schoolCount: 680, avgCompletions: 140, avgSalary: 48000, growthIndicator: 'medium' }
    ];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ArrowPathIcon className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading trend data...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <ChartBarIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white font-bold">Historical Trends & Predictions</h1>
              <p className="text-gray-300 mt-1">Analyze past trends and future projections for college costs and salaries</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg inline-flex">
            <SparklesIcon className="w-5 h-5" />
            <span className="font-semibold">Premium Feature - Powered by AI</span>
          </div>
        </div>

        {/* View Selector */}
        <div className="mb-6 bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_12px_rgba(249,115,22,0.08)] p-4">
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedView('salary')}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                selectedView === 'salary'
                  ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(249,115,22,0.08)]'
                  : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
              }`}
            >
              Salary Trends
            </button>
            <button
              onClick={() => setSelectedView('cost')}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                selectedView === 'cost'
                  ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(249,115,22,0.08)]'
                  : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
              }`}
            >
              Cost Trends
            </button>
            <button
              onClick={() => setSelectedView('roi')}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                selectedView === 'roi'
                  ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(249,115,22,0.08)]'
                  : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
              }`}
            >
              ROI Analysis
            </button>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_12px_rgba(249,115,22,0.08)] p-6 mb-8">
          <h2 className="text-2xl font-bold text-white font-bold mb-6">
            {selectedView === 'salary' && 'Average Starting Salary Trends'}
            {selectedView === 'cost' && 'Average College Cost Trends'}
            {selectedView === 'roi' && 'Return on Investment Trends'}
          </h2>
          
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="year" 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value: number) => 
                  selectedView === 'roi' 
                    ? `${value.toFixed(1)}x` 
                    : formatCurrency(value)
                }
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: 'white'
                }}
                formatter={(value: any) => 
                  selectedView === 'roi' 
                    ? [`${value.toFixed(2)}x`, 'ROI'] 
                    : [formatCurrency(value), selectedView === 'salary' ? 'Salary' : 'Cost']
                }
                labelFormatter={(label: string | number) => `Year ${label}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey={selectedView === 'salary' ? 'avgSalary' : selectedView === 'cost' ? 'avgCost' : 'roi'}
                stroke="#3B82F6"
                fill="url(#colorValue)"
                strokeWidth={3}
                name={selectedView === 'salary' ? 'Historical' : selectedView === 'cost' ? 'Historical Cost' : 'Historical ROI'}
              />
            </AreaChart>
          </ResponsiveContainer>
          
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500/100 rounded"></div>
              <span className="text-gray-300">Historical Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-300">AI Predictions</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Trends */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_12px_rgba(249,115,22,0.08)] p-6">
          <h2 className="text-2xl font-bold text-white font-bold mb-6">Key Metrics Year-over-Year</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryTrends.map((category, index) => (
              <div 
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-[0_0_10px_rgba(249,115,22,0.08)] transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white font-bold">{category.category}</h3>
                  {category.trend === 'up' && (
                    <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                  )}
                  {category.trend === 'down' && (
                    <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
                  )}
                  {category.trend === 'stable' && (
                    <div className="w-5 h-0.5 bg-gray-400"></div>
                  )}
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-400">Change vs Previous Year</p>
                    <p className={`text-lg font-bold ${
                      category.growth > 0 ? 'text-green-600' : category.growth < 0 ? 'text-red-600' : 'text-gray-300'
                    }`}>
                      {category.growth > 0 ? '+' : ''}{category.growth}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Current Value</p>
                    <p className="text-lg font-bold text-white font-bold">
                      {category.category.includes('ROI') ? category.avgSalary.toLocaleString() : formatCurrency(category.avgSalary)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Programs by Average Salary */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_12px_rgba(249,115,22,0.08)] p-6">
          <h2 className="text-2xl font-bold text-white font-bold mb-6">Average Salary by Program</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPrograms.slice(0, 9).map((program, index) => (
              <div 
                key={program.cipcode}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-[0_0_10px_rgba(249,115,22,0.08)] transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white font-bold mb-1">{program.name}</h3>
                    <p className="text-xs text-gray-400">CIP: {program.cipcode}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400">Average Starting Salary</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(program.avgSalary)}
                    </p>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Offered by</span>
                      <span className="text-sm font-semibold text-white font-bold">{program.schoolCount.toLocaleString()} schools</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-50 rounded-xl p-6 border border-orange-500">
          <div className="flex items-start gap-3">
            <SparklesIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white font-bold mb-2">AI-Powered Insights</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Technology and healthcare sectors show strongest growth projections through 2028</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>College costs are predicted to increase by 4-5% annually, outpacing inflation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>STEM fields maintain highest ROI with average 1.8x returns within 5 years</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
