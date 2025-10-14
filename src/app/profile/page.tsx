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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-lg text-gray-600">Manage your profile and account preferences</p>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid gap-6">
          {/* Account Status Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Account Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700 font-medium">Subscription</span>
                {isPremium ? (
                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full">
                    ⭐ Premium
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-semibold rounded-full">
                    Free
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700 font-medium">Account Email</span>
                <span className="text-gray-600">{session.user.email}</span>
              </div>
              {!isPremium && (
                <div className="pt-3 border-t border-gray-200">
                  <a
                    href="/pricing"
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ✨ Upgrade to Premium
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
              <Link
                href="/edit-preferences"
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                Edit Preferences →
              </Link>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-gray-50"
                  disabled
                  title="Email cannot be changed"
                />
                <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
              </div>

              {/* Academic Preferences Display */}
              {preferences && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Academic Preferences
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {preferences.degree_level && (
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Degree Level</p>
                        <p className="text-sm text-gray-900 mt-1">{preferences.degree_level}</p>
                      </div>
                    )}
                    {preferences.intended_major && (
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Intended Major</p>
                        <p className="text-sm text-gray-900 mt-1">{preferences.intended_major}</p>
                      </div>
                    )}
                    {preferences.expected_graduation_year && (
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Expected Graduation</p>
                        <p className="text-sm text-gray-900 mt-1">{preferences.expected_graduation_year}</p>
                      </div>
                    )}
                    {preferences.target_schools && preferences.target_schools.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-500 font-medium mb-2">Target Schools</p>
                        <div className="flex flex-wrap gap-2">
                          {preferences.target_schools.map((school: string, idx: number) => (
                            <span 
                              key={idx}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
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
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Bookmarked Colleges */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Bookmarked Colleges</h2>
              <Link
                href="/colleges"
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                Explore Colleges →
              </Link>
            </div>
            
            {bookmarksLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading bookmarks...</p>
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">No bookmarked colleges</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start bookmarking colleges from the College Explorer to save them here
                </p>
                <div className="mt-6">
                  <a
                    href="/colleges"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
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
                    className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        <a
                          href={`/colleges/${bookmark.unitid}`}
                          className="hover:text-blue-600"
                        >
                          {bookmark.institution_name}
                        </a>
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {bookmark.city}, {bookmark.state}
                      </p>
                      {bookmark.control && (
                        <p className="text-xs text-gray-500 mt-1">{bookmark.control}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Bookmarked {new Date(bookmark.bookmarked_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <a
                        href={`/colleges/${bookmark.unitid}`}
                        className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700 rounded transition-colors"
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

          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Enter new password (min. 6 characters)"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Alert Preferences</h2>
              <Link
                href="/alerts"
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                Full Settings →
              </Link>
            </div>
            <AlertSettings compact />
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-red-200">
            <h2 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h2>
            <p className="text-gray-600 mb-4">
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
