'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const DEGREE_LEVELS = [
  { value: 'none', label: 'No Degree (Self-taught / Bootcamp / Certification)' },
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'phd', label: 'PhD/Doctorate' },
  { value: 'professional', label: 'Professional Degree (MD, JD, etc.)' }
];

const COMPANY_SIZES = [
  { value: 'startup', label: 'Startup (1-50 employees)' },
  { value: 'small', label: 'Small (51-500)' },
  { value: 'medium', label: 'Medium (501-5000)' },
  { value: 'large', label: 'Large (5001-50000)' },
  { value: 'enterprise', label: 'Enterprise (50000+)' }
];

const REMOTE_OPTIONS = [
  { value: 'remote', label: 'Fully Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' }
];

export default function SubmitSalaryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Autocomplete state
  const [institutionSuggestions, setInstitutionSuggestions] = useState<string[]>([]);
  const [majorSuggestions, setMajorSuggestions] = useState<string[]>([]);
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState(false);
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);
  const institutionRef = useRef<HTMLDivElement>(null);
  const majorRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    institution_name: '',
    degree_level: '',
    major: '',
    graduation_year: new Date().getFullYear(),
    current_salary: '',
    years_experience: '', // Total years in the field
    total_compensation: '',
    job_title: '',
    company_name: '',
    industry: '',
    company_size: '',
    location_city: '',
    location_state: '',
    remote_status: '',
    student_debt_remaining: '',
    student_debt_original: '',
    is_public: true,
    has_degree: true // Track if they have a degree
  });

  // Additional degrees state (for users with multiple degrees)
  const [additionalDegrees, setAdditionalDegrees] = useState<Array<{
    institution_name: string;
    degree_level: string;
    major: string;
    graduation_year: number;
  }>>([]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (institutionRef.current && !institutionRef.current.contains(event.target as Node)) {
        setShowInstitutionDropdown(false);
      }
      if (majorRef.current && !majorRef.current.contains(event.target as Node)) {
        setShowMajorDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search institutions
  useEffect(() => {
    const searchInstitutions = async () => {
      if (formData.institution_name.length < 2) {
        setInstitutionSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/institutions/search?q=${encodeURIComponent(formData.institution_name)}`);
        const data = await response.json();
        setInstitutionSuggestions(data.institutions || []);
        setShowInstitutionDropdown(true);
      } catch (error) {
        console.error('Institution search error:', error);
      }
    };

    const debounce = setTimeout(searchInstitutions, 300);
    return () => clearTimeout(debounce);
  }, [formData.institution_name]);

  // Search majors
  useEffect(() => {
    const searchMajors = async () => {
      if (formData.major.length < 2) {
        setMajorSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/majors/search?q=${encodeURIComponent(formData.major)}`);
        const data = await response.json();
        setMajorSuggestions(data.majors || []);
        setShowMajorDropdown(true);
      } catch (error) {
        console.error('Major search error:', error);
      }
    };

    const debounce = setTimeout(searchMajors, 300);
    return () => clearTimeout(debounce);
  }, [formData.major]);

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white font-bold mb-2">Sign In Required</h2>
          <p className="text-gray-300 mb-6">
            You need to be logged in to submit salary data. This helps us maintain data quality and prevent spam.
          </p>
          <Link
            href="/auth/signin?callbackUrl=/submit-salary"
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate salary ranges
    const salary = parseInt(formData.current_salary);
    const totalComp = formData.total_compensation ? parseInt(formData.total_compensation) : 0;
    const debtOriginal = formData.student_debt_original ? parseInt(formData.student_debt_original) : 0;
    const debtRemaining = formData.student_debt_remaining ? parseInt(formData.student_debt_remaining) : 0;

    // Validation checks
    if (salary < 10000) {
      setError('Base salary seems too low. Please enter a realistic annual salary ($10,000+).');
      setLoading(false);
      return;
    }

    if (salary > 10000000) {
      setError('Base salary seems unusually high. Please verify your entry.');
      setLoading(false);
      return;
    }

    if (totalComp > 0 && totalComp < salary) {
      setError('Total compensation cannot be less than base salary.');
      setLoading(false);
      return;
    }

    if (totalComp > 20000000) {
      setError('Total compensation seems unusually high. Please verify your entry.');
      setLoading(false);
      return;
    }

    if (debtRemaining > debtOriginal) {
      setError('Remaining debt cannot be greater than original debt.');
      setLoading(false);
      return;
    }

    if (debtOriginal > 1000000) {
      setError('Student debt amount seems unusually high. Please verify your entry.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/salary-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          current_salary: salary,
          years_experience: parseInt(formData.years_experience),
          total_compensation: totalComp > 0 ? totalComp : null,
          student_debt_remaining: debtRemaining > 0 ? debtRemaining : null,
          student_debt_original: debtOriginal > 0 ? debtOriginal : null,
          has_degree: formData.has_degree,
          institution_name: formData.has_degree ? formData.institution_name : 'N/A (No Degree)',
          additional_degrees: additionalDegrees.length > 0 ? JSON.stringify(additionalDegrees) : null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/salary-insights'), 2000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white font-bold mb-2">Thank You!</h2>
          <p className="text-gray-300 mb-4">
            Your salary data has been submitted successfully. You're helping future students make better decisions!
          </p>
          <p className="text-sm text-blue-600">Redirecting to insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-bold mb-3">
            Share Your Salary Data
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Help future students by sharing your post-graduation earnings. All data is anonymized and aggregated.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Your submission helps improve our ROI calculations with real-world data</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Education Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white font-bold mb-4 flex items-center">
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3 text-sm font-bold">1</span>
              Education Background
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {formData.degree_level !== 'none' && (
                <div ref={institutionRef} className="relative">
                  <label className="block text-sm font-semibold text-white font-bold mb-1">
                    College/University *
                  </label>
                  <input
                    type="text"
                    required={formData.has_degree}
                    value={formData.institution_name}
                    onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white font-bold"
                    placeholder="e.g., Stanford University"
                  />
                  {showInstitutionDropdown && institutionSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {institutionSuggestions.map((institution, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, institution_name: institution });
                            setShowInstitutionDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 text-white font-bold text-sm"
                        >
                          {institution}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-white font-bold mb-1">
                  Degree Level *
                </label>
                <select
                  required
                  value={formData.degree_level}
                  onChange={(e) => {
                    const hasDegree = e.target.value !== 'none';
                    setFormData({ 
                      ...formData, 
                      degree_level: e.target.value,
                      has_degree: hasDegree,
                      // Clear college fields if no degree
                      institution_name: hasDegree ? formData.institution_name : '',
                      graduation_year: hasDegree ? formData.graduation_year : new Date().getFullYear()
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white font-bold"
                >
                  <option value="">Select degree level</option>
                  {DEGREE_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                {formData.degree_level === 'none' && (
                  <p className="mt-1 text-sm text-blue-600">
                    Great! You can still share your salary data even without a college degree.
                  </p>
                )}
              </div>

              <div ref={majorRef} className="relative">
                <label className="block text-sm font-semibold text-white font-bold mb-1">
                  Major/Field of Study *
                </label>
                <input
                  type="text"
                  required
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white font-bold"
                  placeholder="e.g., Computer Science"
                />
                {showMajorDropdown && majorSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {majorSuggestions.map((major, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, major });
                          setShowMajorDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-white font-bold text-sm"
                      >
                        {major}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {formData.degree_level !== 'none' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-white font-bold mb-1">
                      Graduation Year *
                    </label>
                    <input
                      type="number"
                      required={formData.has_degree}
                      min="1950"
                      max={new Date().getFullYear()}
                      value={formData.graduation_year}
                      onChange={(e) => setFormData({ ...formData, graduation_year: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white font-bold"
                    />
                  </div>

                  {/* Additional Degrees Section */}
                  {additionalDegrees.map((degree, index) => (
                    <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-white font-bold">Additional Degree {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => setAdditionalDegrees(additionalDegrees.filter((_, i) => i !== index))}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Institution</label>
                        <input
                          type="text"
                          value={degree.institution_name}
                          onChange={(e) => {
                            const updated = [...additionalDegrees];
                            updated[index].institution_name = e.target.value;
                            setAdditionalDegrees(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-white font-bold"
                          placeholder="e.g., Stanford University"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Degree Level</label>
                        <select
                          value={degree.degree_level}
                          onChange={(e) => {
                            const updated = [...additionalDegrees];
                            updated[index].degree_level = e.target.value;
                            setAdditionalDegrees(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-white font-bold"
                        >
                          <option value="">Select degree level</option>
                          {DEGREE_LEVELS.filter(l => l.value !== 'none').map(level => (
                            <option key={level.value} value={level.value}>{level.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Major</label>
                        <input
                          type="text"
                          value={degree.major}
                          onChange={(e) => {
                            const updated = [...additionalDegrees];
                            updated[index].major = e.target.value;
                            setAdditionalDegrees(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-white font-bold"
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Graduation Year</label>
                        <input
                          type="number"
                          min="1950"
                          max={new Date().getFullYear()}
                          value={degree.graduation_year}
                          onChange={(e) => {
                            const updated = [...additionalDegrees];
                            updated[index].graduation_year = parseInt(e.target.value);
                            setAdditionalDegrees(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-white font-bold"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setAdditionalDegrees([...additionalDegrees, {
                      institution_name: '',
                      degree_level: '',
                      major: '',
                      graduation_year: new Date().getFullYear()
                    }])}
                    className="w-full py-2 px-4 border-2 border-dashed border-blue-400 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">+</span> Add Another Degree
                  </button>
                </>
              )}

              {/* Total Years of Experience (for everyone, especially non-degree holders) */}
              <div>
                <label className="block text-sm font-semibold text-white font-bold mb-1">
                  Total Years of Experience in Field *
                </label>
                <select
                  required
                  value={formData.years_experience}
                  onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white font-bold"
                >
                  <option value="">Select years</option>
                  <option value="0">Less than 1 year</option>
                  <option value="1">1 year</option>
                  <option value="2">2 years</option>
                  <option value="3">3 years</option>
                  <option value="4">4 years</option>
                  <option value="5">5 years</option>
                  <option value="7">7 years</option>
                  <option value="10">10 years</option>
                  <option value="15">15 years</option>
                  <option value="20">20+ years</option>
                </select>
                <p className="mt-1 text-xs text-gray-400">
                  Total time working in this field, including internships and self-taught work
                </p>
              </div>
            </div>
          </div>

          {/* Compensation Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white font-bold mb-4 flex items-center">
              <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-3 text-sm font-bold">2</span>
              Current Compensation
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white font-bold mb-1">
                  Base Salary (Annual) *
                  <span className="text-xs text-gray-400 ml-1">(before taxes)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-gray-400">$</span>
                  <input
                    type="number"
                    required
                    min="10000"
                    max="10000000"
                    value={formData.current_salary}
                    onChange={(e) => setFormData({ ...formData, current_salary: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white font-bold"
                    placeholder="75000"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">Enter your annual base salary ($10k - $10M)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white font-bold mb-1">
                  Total Compensation (Optional)
                  <span className="text-xs text-gray-400 ml-1">(includes bonuses, stock)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-gray-400">$</span>
                  <input
                    type="number"
                    min="0"
                    max="20000000"
                    value={formData.total_compensation}
                    onChange={(e) => setFormData({ ...formData, total_compensation: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white font-bold"
                    placeholder="90000"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">Must be ≥ base salary if provided</p>
              </div>
            </div>
          </div>

          {/* Job Details Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white font-bold mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-3 text-sm font-bold">3</span>
              Job Details (Optional but Helpful)
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white font-bold mb-1">Job Title</label>
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white font-bold"
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white font-bold mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white font-bold"
                  placeholder="e.g., Google"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white font-bold mb-1">Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white font-bold"
                  placeholder="e.g., Technology, Finance, Healthcare"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white font-bold mb-1">Company Size</label>
                <select
                  value={formData.company_size}
                  onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white font-bold"
                >
                  <option value="">Select size</option>
                  {COMPANY_SIZES.map(size => (
                    <option key={size.value} value={size.value}>{size.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white font-bold mb-1">Location (City)</label>
                <input
                  type="text"
                  value={formData.location_city}
                  onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white font-bold"
                  placeholder="e.g., San Francisco"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white font-bold mb-1">State</label>
                <input
                  type="text"
                  maxLength={2}
                  value={formData.location_state}
                  onChange={(e) => setFormData({ ...formData, location_state: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white font-bold"
                  placeholder="CA"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white font-bold mb-1">Work Location Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {REMOTE_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, remote_status: option.value })}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        formData.remote_status === option.value
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-white font-bold'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Student Debt Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white font-bold mb-4 flex items-center">
              <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mr-3 text-sm font-bold">4</span>
              Student Debt (Optional)
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white font-bold mb-1">
                  Original Student Debt
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-gray-400">$</span>
                  <input
                    type="number"
                    min="0"
                    max="1000000"
                    value={formData.student_debt_original}
                    onChange={(e) => setFormData({ ...formData, student_debt_original: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white font-bold"
                    placeholder="0"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">Total debt when you graduated (max $1M)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white font-bold mb-1">
                  Remaining Student Debt
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-gray-400">$</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.student_debt_remaining}
                    onChange={(e) => setFormData({ ...formData, student_debt_remaining: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white font-bold"
                    placeholder="0"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">Current outstanding balance (≤ original debt)</p>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-white font-bold mb-1">Your Privacy is Protected</p>
                <p className="text-xs text-gray-300">
                  All submitted data is anonymized and aggregated. We never share personal information, company names, or any identifying details.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-300 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Salary Data'}
            </button>
          </div>
        </form>

        {/* Trust Indicators */}
        <div className="mt-8 text-center text-sm text-gray-300">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>100% Anonymous</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secure & Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Quality Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
