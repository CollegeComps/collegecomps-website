'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AcademicCapIcon, CurrencyDollarIcon, MapPinIcon, CalendarIcon, CheckCircleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { ScholarshipMatch } from '@/types/scholarship';
import { US_STATES } from '@/lib/constants/states';

export default function ScholarshipMatchingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [matches, setMatches] = useState<ScholarshipMatch[]>([]);
  const [showAll, setShowAll] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    gpa: '',
    sat_score: '',
    act_score: '',
    desired_major: '',
    state: '',
  });

  // Load user profile data if logged in
  useEffect(() => {
    const loadUserProfile = async () => {
      if (status === 'loading') return;
      
      if (session?.user) {
        try {
          // Try to load from user_responses first (more complete data)
          const responsesRes = await fetch('/api/user/responses');
          if (responsesRes.ok) {
            const { responses } = await responsesRes.json();
            if (responses) {
              setFormData(prev => ({
                ...prev,
                full_name: session.user?.name || prev.full_name,
                email: session.user?.email || prev.email,
                gpa: responses.gpa?.toString() || prev.gpa,
                sat_score: responses.sat_score?.toString() || prev.sat_score,
                act_score: responses.act_score?.toString() || prev.act_score,
                desired_major: responses.preferred_major || prev.desired_major,
                state: responses.preferred_states?.[0] || prev.state, // Use first preferred state
              }));
              setLoadingProfile(false);
              return;
            }
          }

          // Fallback to user profile if no responses
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const profile = await response.json();
            setFormData(prev => ({
              ...prev,
              full_name: session.user?.name || prev.full_name,
              email: session.user?.email || prev.email,
              gpa: profile.gpa?.toString() || prev.gpa,
              sat_score: profile.sat_score?.toString() || prev.sat_score,
              act_score: profile.act_score?.toString() || prev.act_score,
              desired_major: profile.intended_major || prev.desired_major,
            }));
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
      setLoadingProfile(false);
    };

    loadUserProfile();
  }, [session, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Require login for scholarship matching
    if (!session?.user) {
      if (confirm('You need to sign in to access scholarship matching. Would you like to sign in now?')) {
        router.push('/auth/signin?callbackUrl=/scholarships');
      }
      return;
    }
    
    setLoading(true);

    try {
      // Update user responses with scholarship questionnaire data
      if (formData.gpa || formData.sat_score || formData.act_score || formData.desired_major || formData.state) {
        await fetch('/api/user/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gpa: formData.gpa ? parseFloat(formData.gpa) : null,
            sat_score: formData.sat_score ? parseInt(formData.sat_score) : null,
            act_score: formData.act_score ? parseInt(formData.act_score) : null,
            preferred_major: formData.desired_major || null,
            preferred_states: formData.state ? [formData.state] : null,
          }),
        });
      }

      // Update user profile with new data (for backward compatibility)
      if (formData.gpa || formData.sat_score || formData.act_score || formData.desired_major) {
        await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gpa: formData.gpa ? parseFloat(formData.gpa) : null,
            sat_score: formData.sat_score ? parseInt(formData.sat_score) : null,
            act_score: formData.act_score ? parseInt(formData.act_score) : null,
            intended_major: formData.desired_major || null,
          }),
        });
      }

      const response = await fetch('/api/scholarships/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          gpa: parseFloat(formData.gpa),
          sat_score: formData.sat_score ? parseInt(formData.sat_score) : null,
          act_score: formData.act_score ? parseInt(formData.act_score) : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to find scholarships');

      const data = await response.json();
      setMatches(data.matches || []);
      setSubmitted(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to find scholarships. Please try again.');
    } finally {
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (submitted && matches.length > 0) {
    const displayedMatches = showAll ? matches : matches.slice(0, 10);
    const hasMore = matches.length > 10;
    
    return (
      <div className="min-h-screen bg-black py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 border border-green-500 rounded-full mb-4">
              <CheckCircleIcon className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-4">
              Great News, {formData.full_name.split(' ')[0]}!
            </h1>
            <p className="text-xl text-white font-bold">
              We found <strong className="text-orange-500">{matches.length} scholarships</strong> you may be eligible for
            </p>
            {!showAll && hasMore && (
              <p className="text-sm text-gray-400 font-medium mt-2">
                Showing top 10 matches • <button onClick={() => setShowAll(true)} className="text-orange-500 hover:text-orange-400 font-bold">View all {matches.length} scholarships</button>
              </p>
            )}
          </div>

          <div className="space-y-6">
            {displayedMatches.map((match, index) => (
              <div
                key={match.scholarship.id}
                className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_12px_rgba(249,115,22,0.08)] p-6 hover:border-orange-500 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-extrabold text-orange-500">#{index + 1}</span>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{match.scholarship.name}</h2>
                        <p className="text-gray-400 font-medium">{match.scholarship.provider}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-2 rounded-lg font-bold">
                      {match.match_score}% Match
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 font-medium mb-4">{match.scholarship.description}</p>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-white">
                    <CurrencyDollarIcon className="h-5 w-5 text-orange-500" />
                    <span className="font-bold">
                      {formatCurrency(match.scholarship.amount_min)} - {formatCurrency(match.scholarship.amount_max)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <AcademicCapIcon className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">GPA {match.scholarship.gpa_requirement}+ required</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <CalendarIcon className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">Due: {formatDate(match.scholarship.deadline)}</span>
                  </div>
                </div>

                <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4 mb-4">
                  <h3 className="font-bold text-orange-400 mb-2">Why you match:</h3>
                  <ul className="space-y-1">
                    {match.match_reasons.map((reason, idx) => (
                      <li key={idx} className="text-sm text-gray-300 font-medium flex items-start gap-2">
                        <CheckCircleIcon className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-500" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={match.scholarship.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors"
                >
                  Learn More & Apply
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-yellow-500/10 border border-yellow-500 rounded-xl p-6">
            <h3 className="font-bold text-yellow-400 mb-2">📌 Next Steps</h3>
            <ul className="text-sm text-gray-300 font-medium space-y-1">
              <li>• Review each scholarship's specific requirements and deadlines</li>
              <li>• Gather required documents (transcripts, essays, letters of recommendation)</li>
              <li>• Apply early - many scholarships are first-come, first-served</li>
              <li>• Check back regularly for new scholarship opportunities</li>
            </ul>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => {
                setSubmitted(false);
                setMatches([]);
                setShowAll(false);
                setFormData({
                  full_name: '',
                  email: '',
                  phone: '',
                  gpa: '',
                  sat_score: '',
                  act_score: '',
                  desired_major: '',
                  state: '',
                });
              }}
              className="text-orange-500 hover:text-orange-400 font-bold"
            >
              ← Search Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/10 border border-orange-500 rounded-full mb-4">
            <AcademicCapIcon className="h-8 w-8 text-orange-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Find Scholarships You Qualify For
          </h1>
          <p className="text-xl text-white font-bold max-w-2xl mx-auto">
            Answer a few quick questions and we'll match you with scholarships that fit your profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_12px_rgba(249,115,22,0.08)] p-8">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white font-medium"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white font-medium"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white font-medium"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  High School GPA <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  required
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white font-medium"
                  placeholder="3.75"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  SAT Score (optional)
                </label>
                <input
                  type="number"
                  min="400"
                  max="1600"
                  value={formData.sat_score}
                  onChange={(e) => setFormData({ ...formData, sat_score: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white font-medium"
                  placeholder="1200"
                />
                <p className="text-xs text-gray-400 font-medium mt-1">Total score (400-1600)</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  ACT Score (optional)
                </label>
                <input
                  type="number"
                  min="1"
                  max="36"
                  value={formData.act_score}
                  onChange={(e) => setFormData({ ...formData, act_score: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white font-medium"
                  placeholder="24"
                />
                <p className="text-xs text-gray-400 font-medium mt-1">Composite score (1-36)</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Desired Major <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.desired_major}
                  onChange={(e) => setFormData({ ...formData, desired_major: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white font-medium"
                  placeholder="Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white font-medium"
                >
                  <option value="">Select state...</option>
                  <option value="ANY">Any State (Nationwide Scholarships)</option>
                  <option disabled>────────────────────────</option>
                  {US_STATES.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
              <p className="text-sm text-gray-300 font-medium">
                🔒 Your information is secure and will only be used to match you with relevant scholarships.
                We'll never share your data without your permission.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
                loading
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {loading ? 'Finding Scholarships...' : 'Find My Scholarships'}
            </button>
          </div>
        </form>

        <div className="mt-12 bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_12px_rgba(249,115,22,0.08)] p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Why Use Our Scholarship Matcher?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-orange-500/10 border border-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CurrencyDollarIcon className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-bold text-white mb-2">Free Money</h3>
              <p className="text-sm text-gray-300 font-medium">Scholarships don't need to be repaid - it's free money for your education!</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-500/10 border border-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MapPinIcon className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-bold text-white mb-2">Personalized Matches</h3>
              <p className="text-sm text-gray-300 font-medium">We only show scholarships that match your profile and qualifications</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-500/10 border border-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CalendarIcon className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-bold text-white mb-2">Updated Deadlines</h3>
              <p className="text-sm text-gray-300 font-medium">Never miss an opportunity with our up-to-date deadline information</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
