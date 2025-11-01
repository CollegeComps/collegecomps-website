'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChartBarIcon,
  CalendarIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ArrowsRightLeftIcon,
  CurrencyDollarIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  stats: {
    total_events: number;
    unique_event_types: number;
    active_days: number;
    first_activity: string;
    last_activity: string;
  };
  eventBreakdown: Array<{
    event_type: string;
    count: number;
    last_occurrence: string;
  }>;
  timeline: Array<{
    date: string;
    event_count: number;
    event_types: number;
  }>;
  recentEvents: Array<{
    event_type: string;
    event_data: any;
    page_url: string;
    created_at: string;
  }>;
  savedComparisons: number;
  salarySubmissions: number;
  subscriptionTier: string;
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      // Check if user is admin
      if (session?.user?.email !== 'admin@test.com') {
        router.push('/');
        return;
      }
      fetchAnalytics();
    }
  }, [status, router, session]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/stats');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'search':
        return <MagnifyingGlassIcon className="h-5 w-5" />;
      case 'comparison':
        return <ArrowsRightLeftIcon className="h-5 w-5" />;
      case 'view':
        return <EyeIcon className="h-5 w-5" />;
      case 'salary_submit':
        return <CurrencyDollarIcon className="h-5 w-5" />;
      default:
        return <ChartBarIcon className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white font-bold flex items-center gap-3">
                <ChartBarIcon className="h-8 w-8 text-orange-500" />
                Admin Analytics Dashboard
              </h1>
              <p className="mt-2 text-gray-300">
                Platform-wide user behavior and engagement metrics
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                🔒 Admin Only
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Actions</p>
                <p className="text-3xl font-bold tracking-tight text-white font-bold">{data.stats.total_events}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FireIcon className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Active Days</p>
                <p className="text-3xl font-bold tracking-tight text-white font-bold">{data.stats.active_days}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Saved Comparisons</p>
                <p className="text-3xl font-bold tracking-tight text-white font-bold">{data.savedComparisons}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <ArrowsRightLeftIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            {data.subscriptionTier === 'free' && data.savedComparisons >= 3 && (
              <p className="mt-2 text-xs text-orange-600">
                At limit (3/3)
              </p>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Salary Submissions</p>
                <p className="text-3xl font-bold tracking-tight text-white font-bold">{data.salarySubmissions}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Event Types */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-white font-bold mb-4">Activity Breakdown</h2>
            <div className="space-y-3">
              {data.eventBreakdown.length > 0 ? (
                data.eventBreakdown.map((event) => (
                  <div key={event.event_type} className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-orange-500">
                        {getEventIcon(event.event_type)}
                      </div>
                      <div>
                        <p className="font-medium text-white font-bold capitalize">
                          {event.event_type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-gray-400">
                          Last: {formatDateTime(event.last_occurrence)}
                        </p>
                      </div>
                    </div>
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {event.count}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No activity yet</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-white font-bold mb-4">Recent Activity</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {data.recentEvents.length > 0 ? (
                data.recentEvents.map((event, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 hover:bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="text-gray-400 mt-1">
                      {getEventIcon(event.event_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white font-bold capitalize">
                        {event.event_type.replace(/_/g, ' ')}
                      </p>
                      {event.event_data && (
                        <p className="text-xs text-gray-400 truncate">
                          {JSON.stringify(event.event_data)}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {formatDateTime(event.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-white font-bold mb-4">30-Day Activity Timeline</h2>
          {data.timeline.length > 0 ? (
            <div className="space-y-2">
              {data.timeline.map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-300 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {formatDate(day.date)}
                  </div>
                  <div className="flex-1">
                    <div className="bg-blue-200 h-8 rounded" style={{ width: `${Math.min((day.event_count / Math.max(...data.timeline.map(t => t.event_count))) * 100, 100)}%` }}>
                      <div className="flex items-center justify-start h-full px-3">
                        <span className="text-sm font-semibold text-orange-400">{day.event_count} events</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No activity in the last 30 days</p>
          )}
        </div>

        {/* Account Info */}
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-white font-bold mb-4">Account Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-300">First Activity</p>
              <p className="text-lg font-semibold text-white font-bold">
                {data.stats.first_activity ? formatDate(data.stats.first_activity) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-300">Last Activity</p>
              <p className="text-lg font-semibold text-white font-bold">
                {data.stats.last_activity ? formatDateTime(data.stats.last_activity) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Upgrade CTA for Free Users */}
        {data.subscriptionTier === 'free' && (
          <div className="mt-8 bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.2)] p-8 text-white">
            <h3 className="text-2xl font-bold mb-2">Unlock More Insights</h3>
            <p className="mb-4 text-orange-100">
              Upgrade to Premium for unlimited comparisons, advanced analytics, and personalized recommendations.
            </p>
            <Link
              href="/profile"
              className="inline-block bg-white text-orange-500 font-semibold px-6 py-3 rounded-lg hover:bg-orange-500/10 transition-colors"
            >
              Upgrade to Premium
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
