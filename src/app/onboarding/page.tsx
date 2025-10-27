'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  AcademicCapIcon,
  BuildingLibraryIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import AIAutocomplete from '@/components/AIAutocomplete';

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    intended_major: '',
    degree_level: 'bachelors',
    target_schools: [] as string[],
    expected_graduation_year: new Date().getFullYear() + 4,
    gpa: '',
    sat_score: '',
    act_score: '',
    budget_range: '',
    location_preference: '',
    zip_code: '',
    // ENG-27: Enhanced financial fields for net price estimation
    student_income: '',
    parent_income: '',
    parent_assets: '',
  });

  const [schoolInput, setSchoolInput] = useState('');

  // Load existing data from user_responses or onboarding
  useEffect(() => {
    const loadExistingData = async () => {
      if (status === 'loading') return;
      
      if (session?.user) {
        try {
          // Load from both APIs in parallel
          const [responsesRes, onboardingRes] = await Promise.all([
            fetch('/api/user/responses'),
            fetch('/api/user/onboarding')
          ]);

          let newFormData = { ...formData };

          // First load from user_responses (scholarship finder data)
          if (responsesRes.ok) {
            const { responses } = await responsesRes.json();
            if (responses) {
              newFormData = {
                ...newFormData,
                gpa: responses.gpa?.toString() || newFormData.gpa,
                sat_score: responses.sat_score?.toString() || newFormData.sat_score,
                act_score: responses.act_score?.toString() || newFormData.act_score,
                intended_major: responses.preferred_major || newFormData.intended_major,
                parent_income: responses.parent_income?.toString() || newFormData.parent_income,
                student_income: responses.student_income?.toString() || newFormData.student_income,
                zip_code: responses.zip_code || newFormData.zip_code,
              };
            }
          }

          // Then overlay with onboarding data (more specific)
          if (onboardingRes.ok) {
            const data = await onboardingRes.json();
            if (data) {
              newFormData = {
                ...newFormData,
                intended_major: data.intended_major || newFormData.intended_major,
                degree_level: data.degree_level || newFormData.degree_level,
                target_schools: data.target_schools || newFormData.target_schools,
                expected_graduation_year: data.expected_graduation_year || newFormData.expected_graduation_year,
                gpa: data.gpa?.toString() || newFormData.gpa,
                sat_score: data.sat_score?.toString() || newFormData.sat_score,
                act_score: data.act_score?.toString() || newFormData.act_score,
                budget_range: data.budget_range || newFormData.budget_range,
                location_preference: data.location_preference || newFormData.location_preference,
                zip_code: data.zip_code || newFormData.zip_code,
                student_income: data.student_income?.toString() || newFormData.student_income,
                parent_income: data.parent_income?.toString() || newFormData.parent_income,
                parent_assets: data.parent_assets?.toString() || newFormData.parent_assets,
              };
            }
          }

          // Single state update with all loaded data
          setFormData(newFormData);
        } catch (error) {
          console.error('Error loading existing data:', error);
        }
      }
    };

    loadExistingData();
  }, [session, status]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

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

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Save to onboarding API
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save preferences');

      // Save to user_responses for recommendations
      await fetch('/api/user/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gpa: formData.gpa ? parseFloat(formData.gpa) : null,
          sat_score: formData.sat_score ? parseInt(formData.sat_score) : null,
          act_score: formData.act_score ? parseInt(formData.act_score) : null,
          parent_income: formData.parent_income ? parseInt(formData.parent_income) : null,
          student_income: formData.student_income ? parseInt(formData.student_income) : null,
          preferred_major: formData.intended_major || null,
          preferred_states: formData.location_preference ? [formData.location_preference] : null,
          zip_code: formData.zip_code || null
        })
      });

      // Also save to localStorage for backward compatibility
      localStorage.setItem('questionnaireAnswers', JSON.stringify({
        gpa: formData.gpa,
        satScore: formData.sat_score,
        actScore: formData.act_score,
        parentIncome: formData.parent_income,
        studentIncome: formData.student_income,
        major: formData.intended_major,
        state: formData.location_preference,
        zipCode: formData.zip_code
      }));

      // Track onboarding completion
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'onboarding_completed',
          eventData: {
            major: formData.intended_major,
            schools_count: formData.target_schools.length,
            graduation_year: formData.expected_graduation_year
          },
          pageUrl: '/onboarding'
        })
      });

      router.push('/');
    } catch (error) {
      console.error('Error saving onboarding:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setLoading(true);
      // Mark onboarding as complete even if skipped
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intended_major: '',
          degree_level: '',
          target_schools: [],
          expected_graduation_year: new Date().getFullYear()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save onboarding status');
      }

      // Wait a bit to ensure the database update is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.intended_major.length > 0;
    if (step === 2) return true; // School selection is now optional
    if (step === 3) return formData.expected_graduation_year > 0;
    if (step === 4) return true; // Academic info is optional
    return false;
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                {step > 1 ? <CheckCircleIcon className="h-6 w-6" /> : '1'}
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Major</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                {step > 2 ? <CheckCircleIcon className="h-6 w-6" /> : '2'}
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Schools</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                {step > 3 ? <CheckCircleIcon className="h-6 w-6" /> : '3'}
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Timeline</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 4 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center ${step >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                {step > 4 ? <CheckCircleIcon className="h-6 w-6" /> : '4'}
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Profile</span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Intended Major */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <AcademicCapIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">What do you want to study?</h2>
                <p className="text-gray-600">We'll personalize your experience based on your interests</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Degree Level
                </label>
                <select
                  value={formData.degree_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, degree_level: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="bachelors">Bachelor's Degree</option>
                  <option value="masters">Master's Degree</option>
                  <option value="doctorate">Doctorate/PhD</option>
                  <option value="associate">Associate Degree</option>
                  <option value="certificate">Certificate Program</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Intended Major or Field of Study
                </label>
                <AIAutocomplete
                  type="major"
                  value={formData.intended_major}
                  onChange={(value) => setFormData(prev => ({ ...prev, intended_major: value }))}
                  onSelect={(value) => setFormData(prev => ({ ...prev, intended_major: value }))}
                  placeholder="e.g., Computer Science, Business, Engineering..."
                  context={{
                    degree_level: formData.degree_level,
                    gpa: formData.gpa,
                    sat_score: formData.sat_score,
                    act_score: formData.act_score
                  }}
                />
              </div>

              <p className="text-sm text-gray-500">
                💡 Don't worry, you can change this later in your profile
              </p>
            </div>
          )}

          {/* Step 2: Target Schools */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                  <BuildingLibraryIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Which schools interest you?</h2>
                <p className="text-gray-600">Add schools you're considering (optional - you can add or change these later)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Search and Add Schools (Optional)
                </label>
                <AIAutocomplete
                  type="school"
                  value={schoolInput}
                  onChange={(value) => setSchoolInput(value)}
                  onSelect={(value) => addSchool(value)}
                  placeholder="Type to search schools..."
                  context={{
                    intended_major: formData.intended_major,
                    degree_level: formData.degree_level,
                    gpa: formData.gpa,
                    sat_score: formData.sat_score,
                    act_score: formData.act_score,
                    budget_range: formData.budget_range,
                    location_preference: formData.location_preference
                  }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Skip this step if you're still exploring options - you can add schools anytime from your profile
                </p>
              </div>

              {/* Selected Schools */}
              {formData.target_schools.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    Your Target Schools ({formData.target_schools.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.target_schools.map((school) => (
                      <div
                        key={school}
                        className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                      >
                        <span className="text-sm font-medium">{school}</span>
                        <button
                          onClick={() => removeSchool(school)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Graduation Year */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <CalendarIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">When do you plan to graduate?</h2>
                <p className="text-gray-600">This helps us show relevant ROI projections</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Expected Graduation Year
                </label>
                <select
                  value={formData.expected_graduation_year}
                  onChange={(e) => setFormData(prev => ({ ...prev, expected_graduation_year: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  {Array.from({ length: 10 }, (_, i) => currentYear + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">📊 What's Next?</h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Personalized college recommendations</li>
                  <li>• ROI calculations for your major</li>
                  <li>• Salary insights from alumni in your field</li>
                  <li>• Side-by-side comparisons of your target schools</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 4: Academic Profile (Optional) */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <AcademicCapIcon className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Tell us about your profile</h2>
                <p className="text-gray-600">Help us provide better recommendations and accurate net price estimates (all optional)</p>
              </div>

              {/* Academic Info Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Academic Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      GPA (if available)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4.0"
                      value={formData.gpa}
                      onChange={(e) => setFormData(prev => ({ ...prev, gpa: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="e.g., 3.75"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      SAT Score (if taken)
                    </label>
                    <input
                      type="number"
                      min="400"
                      max="1600"
                      value={formData.sat_score}
                      onChange={(e) => setFormData(prev => ({ ...prev, sat_score: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="e.g., 1450"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      ACT Score (if taken)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="36"
                      value={formData.act_score}
                      onChange={(e) => setFormData(prev => ({ ...prev, act_score: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="e.g., 32"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Location Preference
                    </label>
                    <input
                      type="text"
                      value={formData.location_preference}
                      onChange={(e) => setFormData(prev => ({ ...prev, location_preference: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="e.g., Northeast, California..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      pattern="[0-9]{5}"
                      maxLength={5}
                      value={formData.zip_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="e.g., 10001"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Used to find nearby colleges in recommendations
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Info Section - ENG-27 */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Information</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This information helps us estimate your net price and financial aid eligibility at different schools.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Annual Student Income
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.student_income}
                      onChange={(e) => setFormData(prev => ({ ...prev, student_income: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="e.g., 5000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Your personal income from work/jobs</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Annual Parent/Guardian Income
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.parent_income}
                      onChange={(e) => setFormData(prev => ({ ...prev, parent_income: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="e.g., 75000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Combined household income</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Parent/Guardian Assets
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.parent_assets}
                      onChange={(e) => setFormData(prev => ({ ...prev, parent_assets: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="e.g., 50000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Savings, investments (not home equity)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Estimated Budget (Annual)
                    </label>
                    <select
                      value={formData.budget_range}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget_range: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Select budget range...</option>
                      <option value="0-20000">$0 - $20,000</option>
                      <option value="20000-40000">$20,000 - $40,000</option>
                      <option value="40000-60000">$40,000 - $60,000</option>
                      <option value="60000+">$60,000+</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">What you can afford per year</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✨ <strong>Enhanced Recommendations:</strong> With this information, we can provide more accurate net price estimates, suggest appropriate safety/match/reach schools based on your academic profile, and help you understand your financial aid eligibility!
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                step === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeftIcon className="h-5 w-5" />
              Back
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  canProceed()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-colors ${
                  !loading
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Saving...' : 'Complete Setup'}
                {!loading && <CheckCircleIcon className="h-5 w-5" />}
              </button>
            )}
          </div>

          {/* Skip Option */}
          <div className="text-center mt-4">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
