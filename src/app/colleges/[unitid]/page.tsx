import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { CollegeDataService, AcademicProgram } from '@/lib/database';
import { getCollegeDb } from '@/lib/db-helper';
import { CollegeSchema, BreadcrumbSchema } from '@/components/StructuredData';
import { getControlTypeLabel } from '@/lib/formatting';
import CollegeDetailClient from '@/components/CollegeDetailClient';
import CollegeSEOContent from '@/components/CollegeSEOContent';

// ISR: revalidate every 30 days. IPEDS data refreshes yearly.
export const revalidate = 2592000;

// Allow any unitid outside the pre-built top 500 to be lazily generated
// on first request and cached via ISR.
export const dynamicParams = true;

// Pre-build the top 500 most-relevant college detail pages at deploy time.
// We pick the top 500 by institution_avg_roi among institutions that actually
// HAVE usable data — skip the long tail of sparse schools that would produce
// thin-content soft 404s.
export async function generateStaticParams() {
  try {
    const db = getCollegeDb();
    if (!db) return [];
    const rows = (await db
      .prepare(
        `SELECT unitid FROM institutions
         WHERE name IS NOT NULL
           AND institution_avg_roi IS NOT NULL
         ORDER BY institution_avg_roi DESC
         LIMIT 500`
      )
      .all()) as { unitid: number }[];
    return rows.map((r) => ({ unitid: String(r.unitid) }));
  } catch {
    return [];
  }
}


interface PageProps {
  params: Promise<{ unitid: string }>;
}

function formatMoney(n: number | null | undefined): string | null {
  if (n == null) return null;
  return '$' + Math.round(n).toLocaleString('en-US');
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { unitid } = await params;
  const collegeService = new CollegeDataService();
  const institution = await collegeService.getInstitutionByUnitid(parseInt(unitid));

  if (!institution) {
    return {
      title: 'Institution Not Found | CollegeComps',
      robots: { index: false, follow: false },
    };
  }

  const controlLabel = getControlTypeLabel(institution.control_public_private);
  const location = [institution.city, institution.state].filter(Boolean).join(', ');

  // Build a unique, data-rich description using the fields that are actually
  // populated for this school. Every school gets a different sentence.
  const parts: string[] = [`${controlLabel} institution in ${location}.`];

  const tuition = institution.tuition_in_state ?? institution.tuition_out_state;
  if (tuition) {
    parts.push(`In-state tuition: ${formatMoney(tuition)}.`);
  }

  const earnings =
    institution.earnings_10_years_after_entry ?? institution.earnings_6_years_after_entry;
  if (earnings) {
    parts.push(`Graduates earn a median of ${formatMoney(earnings)} ten years after enrollment.`);
  }

  if (institution.institution_avg_roi != null) {
    const roiMillions = (institution.institution_avg_roi / 1_000_000).toFixed(2);
    parts.push(`Estimated lifetime ROI: $${roiMillions}M.`);
  }

  if (institution.acceptance_rate) {
    parts.push(`Acceptance rate: ${(institution.acceptance_rate * 100).toFixed(1)}%.`);
  }

  const description = `${institution.name} — ${parts.join(' ')}`.slice(0, 300);
  const title = `${institution.name} — ROI, Tuition & Earnings Data`;

  return {
    title,
    description,
    alternates: {
      canonical: `/colleges/${unitid}`,
    },
    openGraph: {
      title: `${institution.name} — ROI & Tuition | CollegeComps`,
      description,
      url: `/colleges/${unitid}`,
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

      {/*
        Server-rendered unique content — dynamic prose + FAQ per school.
        This appears in the initial HTML before the interactive component
        hydrates, so Google sees substantive unique content per page and
        stops classifying similar college pages as soft 404 / "not indexed".
      */}
      <CollegeSEOContent institution={institution} programs={programs} />

      <CollegeDetailClient
        institution={institution}
        programs={programs}
        stats={stats}
        unitid={unitid}
      />
    </div>
  );
}
