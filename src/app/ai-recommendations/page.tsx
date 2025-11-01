'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  SparklesIcon, 
  AcademicCapIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface Recommendation {
  id: string;
  name: string;
  score: number;
  matchReasons: string[];
  admissionChance: 'High' | 'Moderate' | 'Reach';
  estimatedCost: number;
  avgSalary: number;
  roi: number;
}

interface RecommendationData {
  profile: {
    gpa?: number;
    sat?: number;
    act?: number;
    budget?: number;
    location?: string;
    interests?: string;
  };
  recommendations: {
    all: Recommendation[];
    safety: Recommendation[];
    target: Recommendation[];
    reach: Recommendation[];
  };
  summary: {
    totalAnalyzed: number;
    topMatches: number;
    safetySchools: number;
    targetSchools: number;
    reachSchools: number;
  };
}

export default function AIRecommendationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'safety' | 'target' | 'reach'>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/ai-recommendations');
      return;
    }

    if (status === 'authenticated') {
      fetchRecommendations();
    }
  }, [status, router]);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/ai/recommendations');
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setError(result.error);
        } else if (response.status === 400) {
          // Profile not complete - redirect to profile page
          router.push('/profile/academic?return=ai-recommendations');
          return;
        } else {
          setError('Failed to load recommendations');
        }
        return;
      }

      setData(result);
    } catch (err) {
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getAdmissionColor = (chance: string) => {
    switch (chance) {
      case 'High': return 'text-green-600 bg-green-100';
      case 'Moderate': return 'text-yellow-600 bg-yellow-100';
      case 'Reach': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-300 bg-gray-100';
    }
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="w-16 h-16 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-xl text-gray-300">Analyzing your profile...</p>
          <p className="text-gray-400 mt-2">Finding your perfect matches</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_12px_rgba(249,115,22,0.08)] p-8 text-center">
            <SparklesIcon className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white font-bold mb-4">AI Recommendations</h1>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-yellow-700">{error}</p>
            </div>
            
            {error.includes('Excel') ? (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                <SparklesIcon className="w-5 h-5" />
                Upgrade to Excel
              </Link>
            ) : error.includes('profile') ? (
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <AcademicCapIcon className="w-5 h-5" />
                Complete Your Profile
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const currentRecommendations = data.recommendations[activeTab];

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <SparklesIcon className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold tracking-tight text-white font-bold">AI-Powered Recommendations</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Based on your profile, we've analyzed {data.summary.totalAnalyzed} schools to find your perfect matches
          </p>
        </div>

        {/* Profile Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_12px_rgba(249,115,22,0.08)] p-6 mb-8">
          <h2 className="text-lg font-semibold text-white font-bold mb-4">Your Profile</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {data.profile.gpa && (
              <div className="text-center p-3 bg-gray-800 border border-gray-700 rounded-lg">
                <p className="text-sm text-gray-300">GPA</p>
                <p className="text-xl font-bold text-white font-bold">{data.profile.gpa}</p>
              </div>
            )}
            {data.profile.sat && (
              <div className="text-center p-3 bg-gray-800 border border-gray-700 rounded-lg">
                <p className="text-sm text-gray-300">SAT</p>
                <p className="text-xl font-bold text-white font-bold">{data.profile.sat}</p>
              </div>
            )}
            {data.profile.act && (
              <div className="text-center p-3 bg-gray-800 border border-gray-700 rounded-lg">
                <p className="text-sm text-gray-300">ACT</p>
                <p className="text-xl font-bold text-white font-bold">{data.profile.act}</p>
              </div>
            )}
            {data.profile.budget && (
              <div className="text-center p-3 bg-gray-800 border border-gray-700 rounded-lg">
                <p className="text-sm text-gray-300">Budget</p>
                <p className="text-xl font-bold text-white font-bold">{formatCurrency(data.profile.budget)}</p>
              </div>
            )}
            {data.profile.location && (
              <div className="text-center p-3 bg-gray-800 border border-gray-700 rounded-lg">
                <p className="text-sm text-gray-300">Location</p>
                <p className="text-xl font-bold text-white font-bold">{data.profile.location}</p>
              </div>
            )}
            {data.profile.interests && (
              <div className="text-center p-3 bg-gray-800 border border-gray-700 rounded-lg">
                <p className="text-sm text-gray-300">Interest</p>
                <p className="text-xl font-bold text-white font-bold">{data.profile.interests}</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Safety Schools</h3>
            <p className="text-3xl font-bold tracking-tight text-green-600">{data.summary.safetySchools}</p>
            <p className="text-sm text-green-700 mt-2">High admission chance</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Target Schools</h3>
            <p className="text-3xl font-bold tracking-tight text-yellow-600">{data.summary.targetSchools}</p>
            <p className="text-sm text-yellow-700 mt-2">Good fit schools</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
            <h3 className="text-lg font-semibold text-orange-900 mb-2">Reach Schools</h3>
            <p className="text-3xl font-bold tracking-tight text-orange-600">{data.summary.reachSchools}</p>
            <p className="text-sm text-orange-700 mt-2">Stretch goals</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_12px_rgba(249,115,22,0.08)] overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-300 hover:text-white font-bold'
                }`}
              >
                All Recommendations ({data.recommendations.all.length})
              </button>
              <button
                onClick={() => setActiveTab('safety')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'safety'
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-300 hover:text-white font-bold'
                }`}
              >
                Safety ({data.recommendations.safety.length})
              </button>
              <button
                onClick={() => setActiveTab('target')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'target'
                    ? 'border-b-2 border-yellow-600 text-yellow-600'
                    : 'text-gray-300 hover:text-white font-bold'
                }`}
              >
                Target ({data.recommendations.target.length})
              </button>
              <button
                onClick={() => setActiveTab('reach')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'reach'
                    ? 'border-b-2 border-orange-600 text-orange-600'
                    : 'text-gray-300 hover:text-white font-bold'
                }`}
              >
                Reach ({data.recommendations.reach.length})
              </button>
            </div>
          </div>

          {/* Recommendations List */}
          <div className="p-6">
            <div className="space-y-4">
              {currentRecommendations.map((school) => (
                <div
                  key={school.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-[0_0_10px_rgba(249,115,22,0.08)] transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white font-bold mb-2">{school.name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAdmissionColor(school.admissionChance)}`}>
                          {school.admissionChance} Admission Chance
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                          {school.score}% Match
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {school.matchReasons.map((reason, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-orange-500/10 text-orange-400 text-xs rounded-full"
                          >
                            ✓ {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-300 mb-1">Estimated Cost</p>
                      <p className="text-lg font-semibold text-white font-bold">{formatCurrency(school.estimatedCost)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300 mb-1">Avg Salary</p>
                      <p className="text-lg font-semibold text-white font-bold">{formatCurrency(school.avgSalary)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-300 mb-1">Estimated ROI</p>
                      <p className="text-lg font-semibold text-green-600">{formatCurrency(school.roi)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/college/${school.id}`}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors text-center"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/roi-calculator?college=${school.id}`}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-300 font-medium rounded-lg hover:bg-gray-200 transition-colors text-center"
                    >
                      Calculate ROI
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {currentRecommendations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No schools in this category</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
