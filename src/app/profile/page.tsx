'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AlertSettings from '@/components/AlertSettings';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // User preferences
  const [preferences, setPreferences] = useState<any>(null);

  // Bookmarked colleges
  const [bookmarkedColleges, setBookmarkedColleges] = useState<any[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);

  // ROI Scenarios
  const [roiScenarios, setRoiScenarios] = useState<any[]>([]);
  const [scenariosLoading, setScenariosLoading] = useState(true);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
      fetchPreferences();
      fetchBookmarks();
      fetchROIScenarios();
    }
  }, [session]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/onboarding');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const fetchBookmarks = async () => {
    try {
      setBookmarksLoading(true);
      const response = await fetch('/api/bookmarks/colleges');
      if (response.ok) {
        const data = await response.json();
        setBookmarkedColleges(data.bookmarks || []);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setBookmarksLoading(false);
    }
  };

  const fetchROIScenarios = async () => {
    try {
      setScenariosLoading(true);
      const response = await fetch('/api/roi/scenarios');
      if (response.ok) {
        const data = await response.json();
        setRoiScenarios(data.scenarios || []);
      }
    } catch (error) {
      console.error('Error fetching ROI scenarios:', error);
    } finally {
      setScenariosLoading(false);
    }
  };

  const removeBookmark = async (unitid: number) => {
    try {
      const response = await fetch('/api/bookmarks/colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitid, action: 'remove' })
      });

      if (response.ok) {
        setBookmarkedColleges(prev => prev.filter(b => b.unitid !== unitid));
        setMessage({ type: 'success', text: 'Bookmark removed' });
      } else {
        setMessage({ type: 'error', text: 'Failed to remove bookmark' });
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
      setMessage({ type: 'error', text: 'Failed to remove bookmark' });
    }
  };

  const deleteScenario = async (scenarioId: number) => {
    try {
      const response = await fetch(`/api/roi/scenarios?id=${scenarioId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRoiScenarios(prev => prev.filter(s => s.id !== scenarioId));
        setMessage({ type: 'success', text: 'Scenario deleted' });
      } else {
        setMessage({ type: 'error', text: 'Failed to delete scenario' });
      }
    } catch (error) {
      console.error('Error deleting scenario:', error);
      setMessage({ type: 'error', text: 'Failed to delete scenario' });
    }
  };

  if (!session) {
    router.push('/');
    return null;
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Update session with new data
        await update({ name });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating your profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while changing your password' });
    } finally {
      setLoading(false);
    }
  };

  const isPremium = session.user.subscriptionTier === 'premium';

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full mb-4">
            <svg className="w-4 h-4 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-orange-400">Your Profile</span>
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-3">Account Settings</h1>
          <p className="text-xl text-gray-300">Manage your profile and account preferences</p>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-5 rounded-xl border-2 ${
              message.type === 'success'
                ? 'bg-green-900/30 border-green-500/50 text-green-300'
                : 'bg-red-900/30 border-red-500/50 text-red-300'
            } shadow-lg font-medium`}
          >
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {/* Account Status Card */}
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-orange-500/20 rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.15)] p-8 hover:shadow-[0_0_40px_rgba(249,115,22,0.2)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              Account Status
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <span className="text-gray-300 font-semibold">Subscription</span>
                {isPremium ? (
                  <span className="px-4 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
                    ⭐ Premium
                  </span>
                ) : (
                  <span className="px-4 py-1.5 bg-gray-700 border border-gray-600 text-gray-300 text-sm font-semibold rounded-full">
                    Free
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <span className="text-gray-300 font-semibold">Account Email</span>
                <span className="text-white font-medium">{session.user.email}</span>
              </div>
              {!isPremium && (
                <div className="pt-4 border-t border-gray-700">
                  <a
                    href="/pricing"
                    className="block w-full text-center px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl hover:from-orange-500 hover:to-orange-400 transition-all shadow-lg hover:shadow-orange-500/50"
                  >
                    ✨ Upgrade to Premium
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-orange-500/20 rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.15)] p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Profile Information
              </h2>
              <Link
                href="/edit-preferences"
                className="text-orange-500 hover:text-orange-400 font-bold text-sm flex items-center gap-1 transition-colors"
              >
                Edit Preferences
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-white mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-700 bg-gray-800 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-500 transition-all"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-700 rounded-xl text-gray-500 bg-gray-800/50 cursor-not-allowed"
                  disabled
                  title="Email cannot be changed"
                />
                <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Email address cannot be changed
                </p>
              </div>

              {/* Academic Preferences Display */}
              {preferences && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-white mb-3">
                    Academic Preferences
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {preferences.degree_level && (
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Degree Level</p>
                        <p className="text-sm text-white mt-1">{preferences.degree_level}</p>
                      </div>
                    )}
                    {preferences.intended_major && (
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Intended Major</p>
                        <p className="text-sm text-white mt-1">{preferences.intended_major}</p>
                      </div>
                    )}
                    {preferences.expected_graduation_year && (
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Expected Graduation</p>
                        <p className="text-sm text-white mt-1">{preferences.expected_graduation_year}</p>
                      </div>
                    )}
                    {preferences.target_schools && preferences.target_schools.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-400 font-medium mb-2">Target Schools</p>
                        <div className="flex flex-wrap gap-2">
                          {preferences.target_schools.map((school: string, idx: number) => (
                            <span 
                              key={idx}
                              className="px-3 py-1 bg-orange-500/20 border border-orange-500 text-orange-400 text-xs font-medium rounded-full"
                            >
                              {school}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Bookmarked Colleges */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.1)] p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Bookmarked Colleges</h2>
              <Link
                href="/colleges"
                className="text-orange-500 hover:text-orange-600 font-semibold text-sm"
              >
                Explore Colleges →
              </Link>
            </div>
            
            {bookmarksLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                <p className="mt-2 text-gray-300">Loading bookmarks...</p>
              </div>
            ) : bookmarkedColleges.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-white">No bookmarked colleges</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Start bookmarking colleges from the College Explorer to save them here
                </p>
                <div className="mt-6">
                  <a
                    href="/colleges"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-[0_0_8px_rgba(249,115,22,0.06)] text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600"
                  >
                    Browse Colleges
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarkedColleges.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">
                        <a
                          href={`/colleges/${bookmark.unitid}`}
                          className="hover:text-orange-500"
                        >
                          {bookmark.institution_name}
                        </a>
                      </h3>
                      <p className="text-sm text-gray-300 mt-1">
                        {bookmark.city}, {bookmark.state}
                      </p>
                      {bookmark.control && (
                        <p className="text-xs text-gray-400 mt-1">{bookmark.control}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Bookmarked {new Date(bookmark.bookmarked_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <a
                        href={`/colleges/${bookmark.unitid}`}
                        className="px-3 py-1 text-xs font-medium text-orange-500 hover:text-orange-600 border border-orange-600 hover:border-blue-700 rounded transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View
                      </a>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${bookmark.institution_name} from bookmarks?`)) {
                            removeBookmark(bookmark.unitid);
                          }
                        }}
                        className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 border border-red-600 hover:border-red-700 rounded transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {bookmarkedColleges.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        const unitids = bookmarkedColleges.map(b => b.unitid).join(',');
                        window.location.href = `/compare?unitids=${unitids}`;
                      }}
                      className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Compare All Bookmarked Colleges
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Saved ROI Scenarios */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.1)] p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Saved ROI Scenarios</h2>
              <Link
                href="/roi-calculator"
                className="text-orange-500 hover:text-orange-600 font-semibold text-sm"
              >
                ROI Calculator →
              </Link>
            </div>
            
            {scenariosLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                <p className="mt-2 text-gray-300">Loading scenarios...</p>
              </div>
            ) : roiScenarios.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-white">No saved scenarios</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Calculate ROI for different programs and save scenarios to compare them
                </p>
                <div className="mt-6">
                  <a
                    href="/roi-calculator"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-[0_0_8px_rgba(249,115,22,0.06)] text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600"
                  >
                    Try ROI Calculator
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {roiScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          {scenario.scenario_name}
                          {scenario.is_draft === 1 && (
                            <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                              Draft
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-300 mt-1">
                          {scenario.institution_name}
                        </p>
                        {scenario.program_name && (
                          <p className="text-xs text-gray-400 mt-1">{scenario.program_name}</p>
                        )}
                      </div>
                      <div className="ml-4 flex gap-2">
                        <a
                          href={`/roi-calculator?loadScenario=${scenario.id}`}
                          className="px-3 py-1 text-xs font-medium text-orange-500 hover:text-orange-600 border border-orange-600 hover:border-blue-700 rounded transition-colors inline-flex items-center gap-1"
                          title="Load this scenario in the ROI calculator"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Load
                        </a>
                        <button
                          onClick={() => {
                            if (confirm(`Delete scenario "${scenario.scenario_name}"?`)) {
                              deleteScenario(scenario.id);
                            }
                          }}
                          className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 border border-red-600 hover:border-red-700 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* ROI Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-400">Total Cost</p>
                        <p className="text-sm font-semibold text-white">
                          ${scenario.total_cost?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Net ROI</p>
                        <p className={`text-sm font-semibold ${
                          scenario.net_roi > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${scenario.net_roi?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">ROI %</p>
                        <p className={`text-sm font-semibold ${
                          scenario.roi_percentage > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {scenario.roi_percentage > 0 ? '+' : ''}{scenario.roi_percentage?.toFixed(1) || 'N/A'}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Payback</p>
                        <p className="text-sm font-semibold text-white">
                          {scenario.payback_period ? `${scenario.payback_period.toFixed(1)} yrs` : 'Never'}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-3">
                      Saved {new Date(scenario.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}

                {roiScenarios.filter(s => s.is_draft !== 1).length >= 2 && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        const scenarioIds = roiScenarios
                          .filter(s => s.is_draft !== 1)
                          .map(s => s.id)
                          .join(',');
                        window.location.href = `/compare-roi?scenarios=${scenarioIds}`;
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Compare All Scenarios
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.1)] p-8">
            <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-semibold text-white mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-white mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="Enter new password (min. 6 characters)"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Alert Settings */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.1)] p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Alert Preferences</h2>
              <Link
                href="/alerts"
                className="text-orange-500 hover:text-orange-600 font-semibold text-sm"
              >
                Full Settings →
              </Link>
            </div>
            <AlertSettings compact />
          </div>

          {/* Danger Zone */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.1)] p-8 border-2 border-red-200">
            <h2 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h2>
            <p className="text-gray-300 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  alert('Account deletion feature coming soon');
                }
              }}
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
