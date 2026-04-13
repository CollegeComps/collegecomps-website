import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { CollegeDataService, AcademicProgram } from '@/lib/database';
import { CollegeSchema, BreadcrumbSchema } from '@/components/StructuredData';
import { getControlTypeLabel } from '@/lib/formatting';
import CollegeDetailClient from '@/components/CollegeDetailClient';

// ISR: revalidate every 30 days. IPEDS data refreshes yearly.
export const revalidate = 2592000;

interface PageProps {
  params: Promise<{ unitid: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { unitid } = await params;
  const collegeService = new CollegeDataService();
  const institution = await collegeService.getInstitutionByUnitid(parseInt(unitid));

  if (!institution) {
    return {
      title: 'Institution Not Found | CollegeComps',
    };
  }

  const controlLabel = getControlTypeLabel(institution.control_public_private);
  const location = [institution.city, institution.state].filter(Boolean).join(', ');

  return {
    title: `${institution.name} | CollegeComps`,
    description: `Explore ${institution.name} in ${location}. ${controlLabel} institution. View programs, tuition, earnings data, and ROI analysis.`,
    openGraph: {
      title: `${institution.name} | CollegeComps`,
      description: `${controlLabel} institution in ${location}. Compare programs, costs, and graduate outcomes.`,
      url: `https://collegecomps.com/colleges/${unitid}`,
    },
  };
}

export default async function CollegeDetailPage({ params }: PageProps) {
  const { unitid } = await params;
  const unitidNum = parseInt(unitid);

  if (isNaN(unitidNum)) {
    notFound();
  }

  const collegeService = new CollegeDataService();

  // Fetch institution and programs in parallel
  const [institution, programs] = await Promise.all([
    collegeService.getInstitutionByUnitid(unitidNum),
    collegeService.getInstitutionPrograms(unitidNum),
  ]);

  if (!institution) {
    notFound();
  }

  // Calculate stats server-side (same logic as the old client-side code)
  const totalDataPoints = programs.reduce(
    (sum: number, p: AcademicProgram) => sum + (p.total_completions || p.completions || 0),
    0
  );

  const topPrograms = [...programs]
    .sort(
      (a: AcademicProgram, b: AcademicProgram) =>
        (b.total_completions || b.completions || 0) - (a.total_completions || a.completions || 0)
    )
    .slice(0, 5)
    .map((p: AcademicProgram) => ({
      name: p.cip_title || 'Unknown Program',
      dataPoints: p.total_completions || p.completions || 0,
    }));

  // Calculate ROI programs
  const programsWithROI = programs.filter((p: any) => p.program_roi != null);
  const sortedByROI = [...programsWithROI].sort(
    (a: any, b: any) => (b.program_roi || 0) - (a.program_roi || 0)
  );

  const highestROIProgram =
    sortedByROI.length > 0
      ? {
          name: sortedByROI[0].cip_title || 'Unknown Program',
          roi: sortedByROI[0].program_roi ?? 0,
          cipCode: sortedByROI[0].cipcode ?? '',
        }
      : null;

  const lowestROIProgram =
    sortedByROI.length > 0
      ? {
          name: sortedByROI[sortedByROI.length - 1].cip_title || 'Unknown Program',
          roi: sortedByROI[sortedByROI.length - 1].program_roi ?? 0,
          cipCode: sortedByROI[sortedByROI.length - 1].cipcode ?? '',
        }
      : null;

  const stats = {
    totalPrograms: programs.length,
    avgEarnings: institution.earnings_6_years_after_entry || 0,
    totalDataPoints,
    topPrograms,
    highestROIProgram,
    lowestROIProgram,
  };

  return (
    <div className="p-6">
      {/* Structured Data for SEO - rendered server-side for crawlers */}
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

      <CollegeDetailClient
        institution={institution}
        programs={programs}
        stats={stats}
        unitid={unitid}
      />
    </div>
  );
}
