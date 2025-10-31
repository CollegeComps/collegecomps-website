'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PencilIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import AIAutocomplete from '@/components/AIAutocomplete';

export default function EditPreferencesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    intended_major: '',
    degree_level: 'bachelors',
    target_schools: [] as string[],
    expected_graduation_year: new Date().getFullYear() + 4,
  });

  const [schoolInput, setSchoolInput] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchPreferences();
    }
  }, [status, router]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/onboarding');
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setFormData({
            intended_major: data.preferences.intended_major || '',
            degree_level: data.preferences.degree_level || 'bachelors',
            target_schools: data.preferences.target_schools || [],
            expected_graduation_year: data.preferences.expected_graduation_year || new Date().getFullYear() + 4,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSchool = (school: string) => {
    if (school && !formData.target_schools.includes(school)) {
      setFormData(prev => ({
        ...prev,
        target_schools: [...prev.target_schools, school]
      }));
      setSchoolInput('');
    }
  };

  const removeSchool = (school: string) => {
    setFormData(prev => ({
      ...prev,
      target_schools: prev.target_schools.filter(s => s !== school)
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save preferences');

      alert('Preferences updated successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-bold flex items-center gap-3">
            <PencilIcon className="h-8 w-8 text-blue-600" />
            Edit Your Preferences
          </h1>
          <p className="mt-2 text-gray-600">
            Update your academic goals and target schools
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white font-bold mb-2">
              Degree Level
            </label>
            <select
              value={formData.degree_level}
              onChange={(e) => setFormData(prev => ({ ...prev, degree_level: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white font-bold"
            >
              <option value="bachelors">Bachelor's Degree</option>
              <option value="masters">Master's Degree</option>
              <option value="doctorate">Doctorate/PhD</option>
              <option value="associate">Associate Degree</option>
              <option value="certificate">Certificate Program</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white font-bold mb-2">
              Intended Major or Field of Study
            </label>
            <AIAutocomplete
              type="major"
              value={formData.intended_major}
              onChange={(value) => setFormData(prev => ({ ...prev, intended_major: value }))}
              onSelect={(value) => setFormData(prev => ({ ...prev, intended_major: value }))}
              placeholder="e.g., Computer Science, Business, Engineering..."
              context={{
                degree_level: formData.degree_level
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white font-bold mb-2">
              Target Schools
            </label>
            <AIAutocomplete
              type="school"
              value={schoolInput}
              onChange={(value) => setSchoolInput(value)}
              onSelect={(value) => addSchool(value)}
              placeholder="Type to search schools..."
              context={{
                intended_major: formData.intended_major,
                degree_level: formData.degree_level
              }}
            />

            {formData.target_schools.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-600">Selected Schools ({formData.target_schools.length})</p>
                <div className="flex flex-wrap gap-2">
                  {formData.target_schools.map((school) => (
                    <div
                      key={school}
                      className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                    >
                      <span className="text-sm font-medium">{school}</span>
                      <button
                        onClick={() => removeSchool(school)}
                        className="text-blue-600 hover:text-blue-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-white font-bold mb-2">
              Expected Graduation Year
            </label>
            <select
              value={formData.expected_graduation_year}
              onChange={(e) => setFormData(prev => ({ ...prev, expected_graduation_year: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white font-bold"
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                saving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
