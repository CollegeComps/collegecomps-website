'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BoltIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  NewspaperIcon,
  ChartBarIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

interface DataRelease {
  id: string;
  title: string;
  description: string;
  releaseDate: string;
  publicReleaseDate: string;
  category: 'salary' | 'college' | 'trend' | 'insight';
  status: 'available' | 'coming_soon';
  earlyAccess: boolean;
  dataPoints: number;
}

export default function PriorityDataPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dataReleases, setDataReleases] = useState<DataRelease[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/priority-data');
      return;
    }

    if (status === 'authenticated') {
      // Check tier access
      const tier = session?.user?.subscriptionTier || 'free';
      if (tier === 'free' || tier === 'premium') {
        router.push('/pricing');
        return;
      }
      
      fetchPriorityData();
    }
  }, [status, router, session]);

  const fetchPriorityData = async () => {
    try {
      const response = await fetch('/api/priority-data');
      if (!response.ok) {
        throw new Error('Failed to fetch priority data');
      }
      const data = await response.json();
      setDataReleases(data.releases || generateMockReleases());
    } catch (error) {
      console.error('Error fetching priority data:', error);
      // Use mock data for now
      setDataReleases(generateMockReleases());
    } finally {
      setLoading(false);
    }
  };

  const generateMockReleases = (): DataRelease[] => {
    const now = new Date();
    const releases: DataRelease[] = [
      {
        id: '1',
        title: 'Q4 2025 Salary Data - Tech Sector',
        description: 'Latest salary data from technology companies for recent graduates. Includes detailed breakdowns by role, location, and company size.',
        releaseDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        publicReleaseDate: new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'salary',
        status: 'available',
        earlyAccess: true,
        dataPoints: 15420
      },
      {
        id: '2',
        title: 'Updated College Cost Analysis 2025-2026',
        description: 'Comprehensive analysis of college costs including tuition, fees, room & board for the upcoming academic year.',
        releaseDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        publicReleaseDate: new Date(now.getTime() + 27 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'college',
        status: 'available',
        earlyAccess: true,
        dataPoints: 8950
      },
      {
        id: '3',
        title: 'Healthcare Sector Growth Predictions',
        description: 'AI-powered predictions for healthcare sector job growth and salary trends through 2030.',
        releaseDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        publicReleaseDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'trend',
        status: 'coming_soon',
        earlyAccess: true,
        dataPoints: 12300
      },
      {
        id: '4',
        title: 'Regional ROI Analysis - West Coast',
        description: 'Detailed ROI analysis for colleges on the West Coast, including state-by-state comparisons.',
        releaseDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        publicReleaseDate: new Date(now.getTime() + 29 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'insight',
        status: 'available',
        earlyAccess: true,
        dataPoints: 6780
      },
      {
        id: '5',
        title: 'Engineering Graduate Outcomes Report',
        description: 'Comprehensive outcomes data for engineering graduates across all major disciplines.',
        releaseDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        publicReleaseDate: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'salary',
        status: 'coming_soon',
        earlyAccess: true,
        dataPoints: 18900
      }
    ];
    return releases;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'salary': return ChartBarIcon;
      case 'college': return BoltIcon;
      case 'trend': return SparklesIcon;
      case 'insight': return NewspaperIcon;
      default: return BoltIcon;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'salary': return 'bg-green-100 text-green-700';
      case 'college': return 'bg-blue-100 text-blue-700';
      case 'trend': return 'bg-purple-100 text-purple-700';
      case 'insight': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilPublic = (publicDate: string) => {
    const days = Math.ceil((new Date(publicDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const filteredReleases = selectedCategory === 'all' 
    ? dataReleases 
    : dataReleases.filter(r => r.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BoltIcon className="w-12 h-12 text-yellow-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading priority data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
              <BoltIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Priority Data Access</h1>
              <p className="text-gray-600 mt-1">Get early access to new data releases before they go public</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-100 px-4 py-2 rounded-lg inline-flex">
            <SparklesIcon className="w-5 h-5" />
            <span className="font-semibold">Excel Tier Exclusive - 30 Days Early Access</span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-4">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-yellow-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Data
            </button>
            <button
              onClick={() => setSelectedCategory('salary')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === 'salary'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Salary Data
            </button>
            <button
              onClick={() => setSelectedCategory('college')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === 'college'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              College Data
            </button>
            <button
              onClick={() => setSelectedCategory('trend')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === 'trend'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Trends
            </button>
            <button
              onClick={() => setSelectedCategory('insight')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === 'insight'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Insights
            </button>
          </div>
        </div>

        {/* Data Releases */}
        <div className="space-y-4">
          {filteredReleases.map((release) => {
            const Icon = getCategoryIcon(release.category);
            const daysUntilPublic = getDaysUntilPublic(release.publicReleaseDate);
            
            return (
              <div key={release.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(release.category)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{release.title}</h3>
                        <p className="text-sm text-gray-500">{release.dataPoints.toLocaleString()} data points</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{release.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        {release.status === 'available' ? (
                          <>
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            <span className="text-green-600 font-semibold">Available Now</span>
                          </>
                        ) : (
                          <>
                            <ClockIcon className="w-5 h-5 text-orange-600" />
                            <span className="text-orange-600 font-semibold">
                              Coming {formatDate(release.releaseDate)}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <LockClosedIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">
                          Public: {formatDate(release.publicReleaseDate)} ({daysUntilPublic} days)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    {release.status === 'available' ? (
                      <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg font-semibold hover:from-yellow-700 hover:to-orange-700 transition-all">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Download
                      </button>
                    ) : (
                      <button className="px-6 py-3 bg-gray-100 text-gray-400 rounded-lg font-semibold cursor-not-allowed">
                        Coming Soon
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredReleases.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <BoltIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No data releases in this category</p>
          </div>
        )}

        {/* Benefits Info */}
        <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-start gap-3">
            <SparklesIcon className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Your Priority Benefits</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>30-day early access to all new data releases</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Exclusive insights and trend analysis before public release</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Priority notifications when new data becomes available</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Download data in multiple formats (CSV, Excel, JSON)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
