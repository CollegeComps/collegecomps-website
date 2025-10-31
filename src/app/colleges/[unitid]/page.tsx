'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Institution, AcademicProgram } from '@/lib/database';
import { CollegeSchema, BreadcrumbSchema } from '@/components/StructuredData';
import { CollegeLocationMap } from '@/components/CollegeLocationMap';
import { EnrollmentCharts } from '@/components/EnrollmentCharts';
import {
  ArrowLeftIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  ChartBarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

// Dynamic import for school categories
const { getSchoolBadges } = require('@/lib/school-categories');

interface InstitutionDetails {
  institution: Institution;
  programs: AcademicProgram[];
  stats: {
    totalPrograms: number;
    avgEarnings: number;
    totalGraduates: number;
    topPrograms: Array<{ name: string; graduates: number }>;
  };
}

export default function CollegeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const unitid = params?.unitid as string;
  
  const [details, setDetails] = useState<InstitutionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'programs' | 'costs'>('overview');

  useEffect(() => {
    if (unitid) {
      fetchInstitutionDetails(parseInt(unitid));
    }
  }, [unitid]);

  const fetchInstitutionDetails = async (unitidNum: number) => {
    try {
      setLoading(true);
      
      // Fetch institution basic info
      const instResponse = await fetch(`/api/institutions?unitid=${unitidNum}`);
      const instData = await instResponse.json();
      
      // Fetch programs
      const programsResponse = await fetch(`/api/programs?unitid=${unitidNum}`);
      const programsData = await programsResponse.json();
      
      if (instData.institutions?.length > 0) {
        const institution = instData.institutions[0];
        const programs = programsData.programs || [];
        
        // Calculate stats
        const totalGraduates = programs.reduce((sum: number, p: AcademicProgram) => 
          sum + (p.total_completions || p.completions || 0), 0);
        
        const topPrograms = programs
          .sort((a: AcademicProgram, b: AcademicProgram) => 
            (b.total_completions || b.completions || 0) - (a.total_completions || a.completions || 0))
          .slice(0, 5)
          .map((p: AcademicProgram) => ({
            name: p.cip_title || 'Unknown Program',
            graduates: p.total_completions || p.completions || 0
          }));

        setDetails({
          institution,
          programs,
          stats: {
            totalPrograms: programs.length,
            avgEarnings: institution.earnings_6_years_after_entry || 0,
            totalGraduates,
            topPrograms
          }
        });
      }
    } catch (error) {
      console.error('Error fetching institution details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getControlTypeLabel = (control?: number) => {
    switch (control) {
      case 1: return 'Public';
      case 2: return 'Private Non-profit';
      case 3: return 'Private For-profit';
      default: return 'Unknown';
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
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="py-12">
            <BuildingOffice2Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white font-bold mb-2">
              Institution not found
            </h2>
            <p className="text-gray-500 mb-6">
              The requested institution could not be found.
            </p>
            <button
              onClick={() => router.push('/colleges')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to College Explorer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { institution, programs, stats } = details;

  return (
    <div className="p-6">
      {/* Structured Data for SEO */}
      <CollegeSchema
        name={institution.name}
        url={institution.website || institution.website_url}
        address={{
          city: institution.city,
          state: institution.state || institution.state_postal_code,
          zipCode: institution.zip_code || institution.zipcode,
        }}
        tuition={institution.tuition_in_state}
        description={`${institution.name} - Located in ${institution.city}, ${institution.state || institution.state_postal_code}. ${getControlTypeLabel(institution.control_public_private || institution.control_of_institution)} institution.`}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://collegecomps.com' },
          { name: 'Colleges', url: 'https://collegecomps.com/colleges' },
          { name: institution.name, url: `https://collegecomps.com/colleges/${unitid}` },
        ]}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/colleges')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to College Explorer
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white font-bold mb-2">
                {institution.name}
              </h1>
              <div className="flex items-center text-gray-600 text-lg mb-3">
                <MapPinIcon className="w-5 h-5 mr-2" />
                {institution.city}, {institution.state}
              </div>
              
              {/* School Category Badges */}
              {(() => {
                const badges = getSchoolBadges({
                  unitid: institution.unitid,
                  historically_black: institution.historically_black,
                  control_of_institution: institution.control_of_institution,
                  name: institution.name
                });
                return badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {badges.map((badge: any) => (
                      <span
                        key={badge.category}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color} ${badge.bgColor}`}
                        title={badge.description}
                      >
                        {badge.label}
                      </span>
                    ))}
                  </div>
                );
              })()}
            </div>
            
            {institution.website && (
              <a
                href={institution.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <GlobeAltIcon className="w-5 h-5 mr-2" />
                Visit Website
              </a>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <AcademicCapIcon className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white font-bold">{stats.totalPrograms}</p>
                <p className="text-sm text-gray-600">Programs</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <UsersIcon className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white font-bold">{stats.totalGraduates.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Graduates</p>
              </div>
            </div>
          </div>
          
          {stats.avgEarnings > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <ChartBarIcon className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-white font-bold">{formatCurrency(stats.avgEarnings)}</p>
                  <p className="text-sm text-gray-600">Avg Earnings</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <BuildingOffice2Icon className="w-8 h-8 text-orange-500 mr-3" />
              <div>
                <p className="text-lg font-bold text-white font-bold">{getControlTypeLabel(institution.control_public_private)}</p>
                <p className="text-sm text-gray-600">Institution Type</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'programs', label: 'Programs' },
              { key: 'costs', label: 'Costs & Financial Aid' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Admissions Data */}
                {(institution.acceptance_rate || institution.average_sat || institution.average_act) && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-semibold text-white font-bold mb-4">Admissions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {institution.acceptance_rate && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 mb-1">Acceptance Rate</dt>
                          <dd className="text-2xl font-bold text-purple-700">
                            {(institution.acceptance_rate * 100).toFixed(1)}%
                          </dd>
                        </div>
                      )}
                      {institution.average_sat && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 mb-1">Average SAT</dt>
                          <dd className="text-2xl font-bold text-indigo-700">
                            {institution.average_sat}
                          </dd>
                        </div>
                      )}
                      {institution.average_act && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 mb-1">Average ACT</dt>
                          <dd className="text-2xl font-bold text-indigo-700">
                            {institution.average_act}
                          </dd>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Enrollment and Gender Demographics Charts */}
                <EnrollmentCharts
                  undergrad_enrollment={institution.undergrad_enrollment}
                  grad_enrollment={institution.grad_enrollment}
                  percent_male={institution.percent_male}
                  percent_female={institution.percent_female}
                  total_enrollment={institution.total_enrollment}
                />
                
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-white font-bold mb-4">Institution Information</h2>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Type</dt>
                      <dd className="text-lg text-white font-bold">{getControlTypeLabel(institution.control_of_institution)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Location</dt>
                      <dd className="text-lg text-white font-bold">{institution.city}, {institution.state}</dd>
                    </div>
                    {institution.zip_code && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">ZIP Code</dt>
                        <dd className="text-lg text-white font-bold">{institution.zip_code}</dd>
                      </div>
                    )}
                    {institution.athletic_conference && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Athletic Conference</dt>
                        <dd className="text-lg text-white font-bold">{institution.athletic_conference}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Unit ID</dt>
                      <dd className="text-lg text-white font-bold">{institution.unitid}</dd>
                    </div>
                  </dl>
                </div>

                {stats.topPrograms.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-semibold text-white font-bold mb-4">Top Programs by Graduates</h2>
                    <div className="space-y-3">
                      {stats.topPrograms.map((program) => (
                        <div key={program.name} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <span className="font-medium text-white font-bold">{program.name}</span>
                          <span className="text-sm text-gray-600">{program.graduates} graduates</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'programs' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-white font-bold mb-4">
                  Academic Programs ({programs.length})
                </h2>
                <div className="space-y-3">
                  {programs.slice(0, 20).map((program, index) => (
                    <div key={`${program.cipcode}-${index}`} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                      <div>
                        <h3 className="font-medium text-white font-bold">{program.cip_title || 'Unknown Program'}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          {program.cipcode && (
                            <span className="px-2 py-1 text-xs rounded bg-gray-200 text-white font-bold">
                              CIP: {program.cipcode}
                            </span>
                          )}
                          {program.credential_name && (
                            <span className="px-2 py-1 text-xs rounded bg-blue-200 text-blue-900">
                              {program.credential_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">
                          {(program.total_completions || program.completions || 0).toLocaleString()} graduates
                        </span>
                      </div>
                    </div>
                  ))}
                  {programs.length > 20 && (
                    <p className="text-center text-gray-500 pt-4">
                      ... and {programs.length - 20} more programs
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'costs' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-white font-bold mb-4">Tuition & Fees</h2>
                  <div className="space-y-4">
                    {institution.tuition_in_state && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">In-State Tuition</span>
                        <span className="font-semibold text-white font-bold">{formatCurrency(institution.tuition_in_state)}</span>
                      </div>
                    )}
                    {institution.tuition_out_state && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Out-of-State Tuition</span>
                        <span className="font-semibold text-white font-bold">{formatCurrency(institution.tuition_out_state)}</span>
                      </div>
                    )}
                    {institution.fees && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fees</span>
                        <span className="font-semibold text-white font-bold">{formatCurrency(institution.fees)}</span>
                      </div>
                    )}
                    {institution.room_board_on_campus && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room & Board</span>
                        <span className="font-semibold text-white font-bold">{formatCurrency(institution.room_board_on_campus)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {institution.net_price && (
                  <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">Average Net Price</h3>
                    <p className="text-3xl font-bold text-green-700">{formatCurrency(institution.net_price)}</p>
                    <p className="text-sm text-green-600 mt-2">
                      This is the average amount students pay after financial aid
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {(institution.earnings_6_years_after_entry || institution.mean_earnings_10_years) && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-white font-bold mb-4">Graduate Outcomes</h3>
                <div className="space-y-4">
                  {institution.earnings_6_years_after_entry && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Average Earnings (6 years)</p>
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="w-5 h-5 text-green-500 mr-2" />
                        <p className="text-2xl font-bold text-white font-bold">{formatCurrency(institution.earnings_6_years_after_entry)}</p>
                      </div>
                    </div>
                  )}
                  {institution.mean_earnings_10_years && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Average Earnings (10 years)</p>
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="w-5 h-5 text-blue-500 mr-2" />
                        <p className="text-2xl font-bold text-white font-bold">{formatCurrency(institution.mean_earnings_10_years)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-white font-bold mb-3">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/roi-calculator?unitid=${institution.unitid}`)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Calculate ROI
                </button>
                {institution.website && (
                  <a
                    href={institution.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 text-center transition-colors"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </div>

            {/* Location Map */}
            <CollegeLocationMap
              name={institution.name}
              latitude={institution.latitude}
              longitude={institution.longitude}
              city={institution.city}
              state={institution.state}
              zip_code={institution.zip_code}
            />
          </div>
        </div>
      </div>
    </div>
  );
}