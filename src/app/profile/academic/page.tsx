'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AcademicProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    gpa: '',
    sat: '',
    act: '',
    budget: '',
    location_preference: '',
    program_interest: '',
    career_goals: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch existing profile
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            setFormData({
              gpa: data.profile.gpa || '',
              sat: data.profile.sat || '',
              act: data.profile.act || '',
              budget: data.profile.budget || '',
              location_preference: data.profile.location_preference || '',
              program_interest: data.profile.program_interest || '',
              career_goals: data.profile.career_goals || ''
            });
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gpa: formData.gpa ? parseFloat(formData.gpa) : null,
          sat: formData.sat ? parseInt(formData.sat) : null,
          act: formData.act ? parseInt(formData.act) : null,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          location_preference: formData.location_preference || null,
          program_interest: formData.program_interest || null,
          career_goals: formData.career_goals || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/ai-recommendations');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-white font-bold mb-2">Academic Profile</h1>
          <p className="text-gray-300 mb-8">
            Complete your academic profile to get personalized college recommendations based on your qualifications and preferences.
          </p>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">Profile updated successfully! Redirecting to recommendations...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GPA (0.0 - 4.0) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-600"
                  placeholder="3.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SAT Score (400 - 1600) <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="400"
                  max="1600"
                  value={formData.sat}
                  onChange={(e) => setFormData({ ...formData, sat: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-600"
                  placeholder="1200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ACT Score (1 - 36) <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="36"
                  value={formData.act}
                  onChange={(e) => setFormData({ ...formData, act: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-600"
                  placeholder="28"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Annual Budget ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-600"
                  placeholder="30000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location Preference <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.location_preference}
                onChange={(e) => setFormData({ ...formData, location_preference: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-600"
                placeholder="e.g., California, East Coast, Urban areas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Program/Major Interest <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.program_interest}
                onChange={(e) => setFormData({ ...formData, program_interest: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-600"
                placeholder="e.g., Computer Science, Business, Engineering"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Career Goals <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <textarea
                value={formData.career_goals}
                onChange={(e) => setFormData({ ...formData, career_goals: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-600"
                placeholder="Describe your career aspirations and goals..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save & Get Recommendations'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
