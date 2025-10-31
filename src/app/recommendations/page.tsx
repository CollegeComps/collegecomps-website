'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Institution } from '@/lib/database';
import {
  generateRecommendations,
  groupRecommendationsByCategory,
  RecommendationResult,
  UserStats
} from '@/lib/recommendations';
import {
  MapPinIcon,
  AcademicCapIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function RecommendationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [career, setCareer] = useState<string>('');
  const [majors, setMajors] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<{
    safety: RecommendationResult[];
    match: RecommendationResult[];
    reach: RecommendationResult[];
  }>({ safety: [], match: [], reach: [] });
  const [maxDistance, setMaxDistance] = useState(50);
  const [zipCodeInput, setZipCodeInput] = useState('');
  const [zipCodeError, setZipCodeError] = useState('');

  useEffect(() => {
    // Read career and majors from URL params (from career-finder)
    const careerParam = searchParams?.get('career');
    const majorsParam = searchParams?.get('majors');
    
    if (careerParam) {
      setCareer(careerParam);
    }
    if (majorsParam) {
      setMajors(majorsParam.split(','));
    }
    
    loadUserStatsAndRecommendations();
  }, []);

  useEffect(() => {
    // Regenerate recommendations when distance or location changes
    if (userStats?.latitude && userStats?.longitude) {
      regenerateRecommendations();
    }
  }, [maxDistance, userStats?.latitude, userStats?.longitude]);

  const loadUserStatsAndRecommendations = async () => {
    try {
      setLoading(true);

      // Try to fetch from database first
      const sessionResponse = await fetch('/api/auth/session');
      const session = await sessionResponse.json();

      let stats: UserStats = {};

      let hasData = false;

      if (session?.user) {
        // User is logged in - fetch from database
        const responsesResponse = await fetch('/api/user/responses');
        if (responsesResponse.ok) {
          const { responses } = await responsesResponse.json();
          if (responses) {
            hasData = true;
            stats = {
              gpa: responses.gpa || undefined,
              sat: responses.sat_score || undefined,
              act: responses.act_score || undefined,
              zipCode: responses.zip_code || undefined,
              latitude: responses.latitude || undefined,
              longitude: responses.longitude || undefined
            };
          }
        }
      }

      // Fallback to localStorage if no database data
      if (!hasData) {
        const savedAnswers = localStorage.getItem('questionnaireAnswers');
        if (savedAnswers) {
          const answers = JSON.parse(savedAnswers);
          hasData = true;
          stats = {
            gpa: answers.gpa ? parseFloat(answers.gpa) : undefined,
            sat: answers.satScore ? parseInt(answers.satScore) : undefined,
            act: answers.actScore ? parseInt(answers.actScore) : undefined,
            zipCode: answers.zipCode,
            latitude: answers.latitude,
            longitude: answers.longitude
          };
        }
      }

      // If no data at all, show empty state
      if (!hasData) {
        setLoading(false);
        return;
      }

      // If no location data, try to get from ZIP code
      if (!stats.latitude && stats.zipCode) {
        const geoResponse = await fetch(`/api/geocode?zip=${stats.zipCode}`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          stats.latitude = geoData.latitude;
          stats.longitude = geoData.longitude;
          
          // Save the lat/long back to user_responses for future use
          if (session?.user) {
            await fetch('/api/user/responses', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...stats,
                latitude: geoData.latitude,
                longitude: geoData.longitude
              })
            });
          }
        }
      }

      setUserStats(stats);

      // Fetch institutions (get top 1000 to ensure we have enough nearby)
      const response = await fetch('/api/institutions?limit=1000');
      const data = await response.json();
      const institutions: Institution[] = data.institutions || [];

      // Generate recommendations
      const recs = generateRecommendations(institutions, stats, maxDistance);
      const grouped = groupRecommendationsByCategory(recs);
      setRecommendations(grouped);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const regenerateRecommendations = async () => {
    if (!userStats?.latitude || !userStats?.longitude) {
      return;
    }

    try {
      const response = await fetch('/api/institutions?limit=1000');
      const data = await response.json();
      const institutions: Institution[] = data.institutions || [];
      const recs = generateRecommendations(institutions, userStats, maxDistance);
      const grouped = groupRecommendationsByCategory(recs);
      setRecommendations(grouped);
    } catch (error) {
      console.error('Error regenerating recommendations:', error);
    }
  };

  const handleZipCodeChange = async (zip: string) => {
    if (zip.length !== 5 || !/^\d{5}$/.test(zip)) {
      setZipCodeError('Please enter a valid 5-digit zip code');
      return;
    }

    setZipCodeError('');
    setLoading(true);

    try {
      const geoResponse = await fetch(`/api/geocode?zip=${zip}`);
      if (!geoResponse.ok) {
        setZipCodeError('Invalid zip code or geocoding failed');
        setLoading(false);
        return;
      }

      const geoData = await geoResponse.json();
      const newStats = {
        ...userStats,
        zipCode: zip,
        latitude: geoData.latitude,
        longitude: geoData.longitude
      };
      setUserStats(newStats);
      setZipCodeInput(''); // Clear input after successful change

      // Regenerate recommendations with new location
      const response = await fetch('/api/institutions?limit=1000');
      const data = await response.json();
      const institutions: Institution[] = data.institutions || [];
      const recs = generateRecommendations(institutions, newStats, maxDistance);
      const grouped = groupRecommendationsByCategory(recs);
      setRecommendations(grouped);
      setLoading(false);
    } catch (error) {
      console.error('Error updating zip code:', error);
      setZipCodeError('Error updating location. Please try again.');
      setLoading(false);
    }
  };

  const getCategoryColor = (category: 'safety' | 'match' | 'reach') => {
    switch (category) {
      case 'safety':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'match':
        return 'bg-orange-500/10 border border-orange-500 text-white';
      case 'reach':
        return 'bg-purple-50 border-purple-200 text-purple-900';
    }
  };

  const getCategoryBadgeColor = (category: 'safety' | 'match' | 'reach') => {
    switch (category) {
      case 'safety':
        return 'bg-green-100 text-green-800';
      case 'match':
        return 'bg-orange-500/10 border border-orange-500 text-orange-600';
      case 'reach':
        return 'bg-purple-100 text-purple-800';
    }
  };

  const getCategoryDescription = (category: 'safety' | 'match' | 'reach') => {
    switch (category) {
      case 'safety':
        return 'Your stats are above the average for admitted students';
      case 'match':
        return 'Your stats align with the average for admitted students';
      case 'reach':
        return 'Your stats are below the average for admitted students';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Require authentication
  if (status === 'unauthenticated') {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto text-center">
          <AcademicCapIcon className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-white mb-2">
            Sign In Required
          </h2>
          <p className="text-white font-bold mb-6">
            Please sign in to view personalized college recommendations based on your profile.
          </p>
          <button
            onClick={() => router.push('/auth/signin?callbackUrl=/recommendations')}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-bold"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Only redirect if NO data at all (not just missing location)
  if (!userStats || (!userStats.gpa && !userStats.sat && !userStats.act)) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto text-center">
          <AcademicCapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Complete Your Profile
          </h2>
          <p className="text-gray-300 mb-6">
            To get personalized college recommendations, please complete the onboarding with your academic stats and location.
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Complete Onboarding
          </button>
        </div>
      </div>
    );
  }

  const totalRecommendations =
    recommendations.safety.length + recommendations.match.length + recommendations.reach.length;

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            College Recommendations
          </h1>
          <p className="text-gray-300 mb-4">
            Based on your stats and location, here are colleges within {maxDistance} miles
          </p>

          {/* Career/Majors info if coming from career-finder */}
          {career && (
            <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AcademicCapIcon className="w-6 h-6 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900">Career Match: {career}</h3>
                  {majors.length > 0 && (
                    <p className="text-sm text-blue-700 mt-1">
                      Recommended majors: {majors.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* User Stats Summary */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">\n            <div className="flex flex-wrap gap-4">\n              {userStats.gpa && (
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-300 mr-2">GPA:</span>
                  <span className="text-sm font-bold text-white">{userStats.gpa.toFixed(2)}</span>
                </div>
              )}
              {userStats.sat && (
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-300 mr-2">SAT:</span>
                  <span className="text-sm font-bold text-white">{userStats.sat}</span>
                </div>
              )}
              {userStats.act && (
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-300 mr-2">ACT:</span>
                  <span className="text-sm font-bold text-white">{userStats.act}</span>
                </div>
              )}
              {userStats.zipCode && (
                <div className="flex items-center">
                  <MapPinIcon className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-sm text-white">{userStats.zipCode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Distance Filter & Zip Code Override */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-white">Distance:</label>
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="25">Within 25 miles</option>
                <option value="50">Within 50 miles</option>
                <option value="100">Within 100 miles</option>
                <option value="250">Within 250 miles</option>
                <option value="500">Within 500 miles</option>
              </select>
            </div>

            {/* Zip Code Override */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-white">
                {userStats.zipCode ? 'Try different zip:' : 'Set zip code:'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={zipCodeInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setZipCodeInput(value);
                    if (zipCodeError) setZipCodeError('');
                  }}
                  placeholder={userStats.zipCode || '10001'}
                  maxLength={5}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-600 text-sm font-medium"
                />
                <button
                  onClick={() => handleZipCodeChange(zipCodeInput)}
                  disabled={zipCodeInput.length !== 5}
                  className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Update
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>{totalRecommendations} schools found</span>
              {userStats.zipCode && (
                <span className="text-xs text-gray-400">
                  from {userStats.zipCode}
                </span>
              )}
            </div>

            {zipCodeError && (
              <div className="w-full text-sm text-red-600">
                {zipCodeError}
              </div>
            )}
          </div>
        </div>

        {totalRecommendations === 0 ? (
          <div className="text-center py-12">
            <BuildingOffice2Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No schools found</h3>
            {!userStats.latitude || !userStats.longitude ? (
              <div className="space-y-4 max-w-md mx-auto">
                <p className="text-gray-300">
                  We need your location to find nearby colleges.
                </p>
                <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
                  <p className="text-sm text-gray-300 mb-3">
                    Enter a zip code to search or update your{' '}
                    <button
                      onClick={() => router.push('/onboarding')}
                      className="text-orange-500 hover:text-blue-700 font-semibold underline cursor-pointer hover:bg-blue-100 px-1 rounded transition-colors"
                    >
                      profile settings
                    </button>
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter zip code (e.g., 10001)"
                      maxLength={5}
                      pattern="[0-9]{5}"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-600 font-medium"
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.length === 5) {
                          const zip = e.currentTarget.value;
                          try {
                            const geoResponse = await fetch(`/api/geocode?zip=${zip}`);
                            if (geoResponse.ok) {
                              const geoData = await geoResponse.json();
                              const newStats = {
                                ...userStats,
                                zipCode: zip,
                                latitude: geoData.latitude,
                                longitude: geoData.longitude
                              };
                              setUserStats(newStats);
                              
                              // Immediately regenerate recommendations with new location
                              const response = await fetch('/api/institutions?limit=1000');
                              const data = await response.json();
                              const institutions: Institution[] = data.institutions || [];
                              const recs = generateRecommendations(institutions, newStats, maxDistance);
                              const grouped = groupRecommendationsByCategory(recs);
                              setRecommendations(grouped);
                            }
                          } catch (error) {
                            console.error('Error geocoding zip:', error);
                          }
                        }
                      }}
                    />
                    <button
                      onClick={async (e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        if (input && input.value.length === 5) {
                          const zip = input.value;
                          try {
                            const geoResponse = await fetch(`/api/geocode?zip=${zip}`);
                            if (geoResponse.ok) {
                              const geoData = await geoResponse.json();
                              const newStats = {
                                ...userStats,
                                zipCode: zip,
                                latitude: geoData.latitude,
                                longitude: geoData.longitude
                              };
                              setUserStats(newStats);
                              
                              // Immediately regenerate recommendations with new location
                              const response = await fetch('/api/institutions?limit=1000');
                              const data = await response.json();
                              const institutions: Institution[] = data.institutions || [];
                              const recs = generateRecommendations(institutions, newStats, maxDistance);
                              const grouped = groupRecommendationsByCategory(recs);
                              setRecommendations(grouped);
                            }
                          } catch (error) {
                            console.error('Error geocoding zip:', error);
                          }
                        }
                      }}
                      className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-300 mb-4">
                Try increasing the distance radius to find more colleges.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Safety Schools */}
            {recommendations.safety.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <h2 className="text-2xl font-bold text-green-700">
                    Safety Schools
                  </h2>
                  <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {recommendations.safety.length}
                  </span>
                </div>
                <p className="text-gray-300 mb-4">
                  {getCategoryDescription('safety')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.safety.map((rec) => (
                    <RecommendationCard key={rec.institution.unitid} rec={rec} />
                  ))}
                </div>
              </div>
            )}

            {/* Match Schools */}
            {recommendations.match.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <h2 className="text-2xl font-bold text-blue-700">
                    Match Schools
                  </h2>
                  <span className="ml-3 px-3 py-1 bg-orange-500/10 border border-orange-500 text-orange-600 rounded-full text-sm font-medium">
                    {recommendations.match.length}
                  </span>
                </div>
                <p className="text-gray-300 mb-4">
                  {getCategoryDescription('match')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.match.map((rec) => (
                    <RecommendationCard key={rec.institution.unitid} rec={rec} />
                  ))}
                </div>
              </div>
            )}

            {/* Reach Schools */}
            {recommendations.reach.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <h2 className="text-2xl font-bold text-purple-700">
                    Reach Schools
                  </h2>
                  <span className="ml-3 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {recommendations.reach.length}
                  </span>
                </div>
                <p className="text-gray-300 mb-4">
                  {getCategoryDescription('reach')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.reach.map((rec) => (
                    <RecommendationCard key={rec.institution.unitid} rec={rec} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: RecommendationResult }) {
  const router = useRouter();
  const { institution, distance, category, confidenceScore } = rec;

  const getCategoryBadgeColor = (cat: 'safety' | 'match' | 'reach') => {
    switch (cat) {
      case 'safety':
        return 'bg-green-100 text-green-800';
      case 'match':
        return 'bg-orange-500/10 border border-orange-500 text-orange-600';
      case 'reach':
        return 'bg-purple-100 text-purple-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      onClick={() => router.push(`/colleges/${institution.unitid}`)}
      className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-white text-lg leading-tight flex-1">
            {institution.name}
          </h3>
        </div>
        <div className="flex items-center text-sm text-gray-300 mb-2">
          <MapPinIcon className="w-4 h-4 mr-1" />
          {institution.city}, {institution.state}
          {distance && <span className="ml-2">• {distance.toFixed(1)} mi</span>}
        </div>
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryBadgeColor(category)}`}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        {institution.acceptance_rate && (
          <div className="flex justify-between">
            <span className="text-gray-300">Acceptance Rate:</span>
            <span className="font-medium text-white">
              {(institution.acceptance_rate * 100).toFixed(1)}%
            </span>
          </div>
        )}
        {institution.average_sat && (
          <div className="flex justify-between">
            <span className="text-gray-300">Avg SAT:</span>
            <span className="font-medium text-white">{institution.average_sat}</span>
          </div>
        )}
        {institution.average_act && (
          <div className="flex justify-between">
            <span className="text-gray-300">Avg ACT:</span>
            <span className="font-medium text-white">{institution.average_act}</span>
          </div>
        )}
        {institution.tuition_in_state && (
          <div className="flex justify-between">
            <span className="text-gray-300">Tuition:</span>
            <span className="font-medium text-white">
              {formatCurrency(institution.tuition_in_state)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="w-full flex items-center justify-center text-orange-500 hover:text-blue-700 font-medium text-sm">
          View Details
          <ArrowRightIcon className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}
