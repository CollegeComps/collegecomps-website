'use client';

import { useState } from 'react';
import { AcademicCapIcon, CurrencyDollarIcon, MapPinIcon, CalendarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ScholarshipMatch } from '@/types/scholarship';

export default function ScholarshipMatchingPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [matches, setMatches] = useState<ScholarshipMatch[]>([]);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    gpa: '',
    desired_major: '',
    state: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/scholarships/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          gpa: parseFloat(formData.gpa),
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Great News, {formData.full_name.split(' ')[0]}!
            </h1>
            <p className="text-xl text-gray-600">
              We found <strong>{matches.length} scholarships</strong> you may be eligible for
            </p>
          </div>

          <div className="space-y-6">
            {matches.map((match, index) => (
              <div
                key={match.scholarship.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-bold text-purple-600">#{index + 1}</span>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{match.scholarship.name}</h2>
                        <p className="text-gray-600">{match.scholarship.provider}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
                      {match.match_score}% Match
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{match.scholarship.description}</p>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold">
                      {formatCurrency(match.scholarship.amount_min)} - {formatCurrency(match.scholarship.amount_max)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <AcademicCapIcon className="h-5 w-5 text-purple-600" />
                    <span>GPA {match.scholarship.gpa_requirement}+ required</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <CalendarIcon className="h-5 w-5 text-purple-600" />
                    <span>Due: {formatDate(match.scholarship.deadline)}</span>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-purple-900 mb-2">Why you match:</h3>
                  <ul className="space-y-1">
                    {match.match_reasons.map((reason, idx) => (
                      <li key={idx} className="text-sm text-purple-800 flex items-start gap-2">
                        <CheckCircleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={match.scholarship.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Learn More & Apply
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="font-semibold text-yellow-900 mb-2">📌 Next Steps</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
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
                setFormData({
                  full_name: '',
                  email: '',
                  phone: '',
                  gpa: '',
                  desired_major: '',
                  state: '',
                });
              }}
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              ← Search Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <AcademicCapIcon className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Scholarships You Qualify For
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Answer a few quick questions and we'll match you with scholarships that fit your profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  placeholder="3.75"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Desired Major <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.desired_major}
                  onChange={(e) => setFormData({ ...formData, desired_major: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  placeholder="Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Select state...</option>
                  <option value="CA">California</option>
                  <option value="NY">New York</option>
                  <option value="TX">Texas</option>
                  <option value="FL">Florida</option>
                  <option value="MA">Massachusetts</option>
                  {/* Add more states as needed */}
                </select>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                🔒 Your information is secure and will only be used to match you with relevant scholarships.
                We'll never share your data without your permission.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {loading ? 'Finding Scholarships...' : 'Find My Scholarships'}
            </button>
          </div>
        </form>

        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Use Our Scholarship Matcher?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Free Money</h3>
              <p className="text-sm text-gray-600">Scholarships don't need to be repaid - it's free money for your education!</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MapPinIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Personalized Matches</h3>
              <p className="text-sm text-gray-600">We only show scholarships that match your profile and qualifications</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Updated Deadlines</h3>
              <p className="text-sm text-gray-600">Never miss an opportunity with our up-to-date deadline information</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
