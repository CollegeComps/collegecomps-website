'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface SalarySubmission {
  id: number;
  institution_name: string;
  major: string;
  current_salary: number;
  graduation_year: number;
  created_at: string;
}

interface ImportantDate {
  id: string;
  title: string;
  date: string;
  type: 'financial_aid' | 'enrollment' | 'semester' | 'deadline';
  description?: string;
}

export default function MyTimelinePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [salarySubmissions, setSalarySubmissions] = useState<SalarySubmission[]>([]);
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/my-timeline');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      // Fetch user's salary submissions
      const salaryRes = await fetch('/api/user/salary-submissions');
      if (salaryRes.ok) {
        const salaryData = await salaryRes.json();
        setSalarySubmissions(salaryData.submissions || []);
      }

      // Set important academic dates (would normally come from user's school)
      setImportantDates([
        {
          id: '1',
          title: 'FAFSA Opens',
          date: '2025-10-01',
          type: 'financial_aid',
          description: 'Federal student aid application opens'
        },
        {
          id: '2',
          title: 'Early Decision Deadline',
          date: '2025-11-01',
          type: 'deadline',
          description: 'Common application early decision deadline'
        },
        {
          id: '3',
          title: 'Regular Decision Deadline',
          date: '2026-01-01',
          type: 'deadline',
          description: 'Common application regular decision deadline'
        },
        {
          id: '4',
          title: 'Spring Semester Begins',
          date: '2026-01-15',
          type: 'semester',
          description: 'Spring semester classes start'
        },
        {
          id: '5',
          title: 'Class Enrollment Opens',
          date: '2025-11-15',
          type: 'enrollment',
          description: 'Spring semester registration begins'
        },
        {
          id: '6',
          title: 'Financial Aid Deadline',
          date: '2026-03-01',
          type: 'financial_aid',
          description: 'Priority deadline for financial aid'
        },
      ]);
    } catch (error) {
      console.error('Error fetching timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getDateTypeIcon = (type: string) => {
    switch (type) {
      case 'financial_aid':
        return <BanknotesIcon className="h-5 w-5 text-green-600" />;
      case 'enrollment':
        return <AcademicCapIcon className="h-5 w-5 text-blue-600" />;
      case 'semester':
        return <CalendarIcon className="h-5 w-5 text-purple-600" />;
      case 'deadline':
        return <ClockIcon className="h-5 w-5 text-orange-600" />;
      default:
        return <CalendarIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDateTypeColor = (type: string) => {
    switch (type) {
      case 'financial_aid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'enrollment':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'semester':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'deadline':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your timeline...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
                My Timeline
              </h1>
              <p className="mt-2 text-gray-600">
                Track your college journey, submissions, and important dates
              </p>
            </div>
            <Link
              href="/submit-salary"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <CurrencyDollarIcon className="h-5 w-5" />
              Add Salary Data
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Salary Submissions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Salary Submissions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                  Your Salary Submissions
                </h2>
                <span className="text-sm text-gray-500">
                  {salarySubmissions.length} submission{salarySubmissions.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {salarySubmissions.length > 0 ? (
                <div className="space-y-3">
                  {salarySubmissions.map((submission) => (
                    <div key={submission.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{submission.institution_name}</h3>
                          <p className="text-sm text-gray-600">{submission.major}</p>
                          <div className="mt-2 flex items-center gap-4">
                            <span className="text-lg font-bold text-blue-600">
                              {formatCurrency(submission.current_salary)}
                            </span>
                            <span className="text-sm text-gray-500">
                              Class of {submission.graduation_year}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <CheckCircleIcon className="h-5 w-5 text-green-600 inline" />
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(submission.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No salary submissions yet</p>
                  <Link
                    href="/submit-salary"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Your First Salary
                  </Link>
                </div>
              )}
            </div>

            {/* Important Dates Calendar */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
                Important Academic Dates
              </h2>
              
              <div className="space-y-3">
                {importantDates
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((date) => (
                    <div
                      key={date.id}
                      className={`border rounded-lg p-4 ${
                        isUpcoming(date.date)
                          ? getDateTypeColor(date.type)
                          : 'bg-gray-50 text-gray-500 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getDateTypeIcon(date.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{date.title}</h3>
                            {isUpcoming(date.date) && (
                              <span className="text-xs font-medium px-2 py-1 bg-white/50 rounded">
                                Upcoming
                              </span>
                            )}
                          </div>
                          <p className="text-sm mt-1">{date.description}</p>
                          <p className="text-xs mt-2 font-medium">
                            📅 {formatDate(date.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Column: Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-700">Salary Submissions</span>
                  <span className="text-xl font-bold text-blue-600">{salarySubmissions.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-700">Upcoming Deadlines</span>
                  <span className="text-xl font-bold text-green-600">
                    {importantDates.filter(d => isUpcoming(d.date) && d.type === 'deadline').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-gray-700">Financial Aid Events</span>
                  <span className="text-xl font-bold text-purple-600">
                    {importantDates.filter(d => d.type === 'financial_aid').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  href="/submit-salary"
                  className="block w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  <CurrencyDollarIcon className="h-5 w-5 inline mr-2" />
                  Submit Salary Data
                </Link>
                <Link
                  href="/compare"
                  className="block w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors text-center"
                >
                  <AcademicCapIcon className="h-5 w-5 inline mr-2" />
                  Compare Colleges
                </Link>
                <Link
                  href="/profile"
                  className="block w-full bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center"
                >
                  <PencilIcon className="h-5 w-5 inline mr-2" />
                  Edit Preferences
                </Link>
              </div>
            </div>

            {/* Subscription Status */}
            {session?.user?.subscriptionTier === 'free' && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-2">⭐ Upgrade to Premium</h3>
                <p className="text-sm text-blue-100 mb-4">
                  Get unlimited comparisons, advanced insights, and personalized recommendations
                </p>
                <Link
                  href="/profile"
                  className="block w-full bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-center"
                >
                  Upgrade Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
