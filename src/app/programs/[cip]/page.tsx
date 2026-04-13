import { cache } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getCollegeDb } from '@/lib/db-helper';
import { BreadcrumbSchema } from '@/components/StructuredData';
import { formatCurrency } from '@/lib/formatting';

// ISR: revalidate every 24 hours
export const revalidate = 86400;

interface PageProps {
  params: Promise<{ cip: string }>;
}

interface ProgramRow {
  cipcode: string;
  cip_title: string;
  program_roi: number | null;
  unitid: number;
  name: string;
  city: string | null;
  state: string | null;
  tuition_in_state: number | null;
  tuition_out_state: number | null;
  earnings_10_years_after_entry: number | null;
}

// React.cache deduplicates calls within a single render so generateMetadata
// and the page component share one DB query instead of running it twice.
const getProgramData = cache(async (cipPrefix: string) => {
  const db = getCollegeDb();
  if (!db) return null;

  // Optimized: pre-aggregate top 50 unitids first (one scan of academic_programs),
  // THEN join to institutions and the pre-computed latest-year financial data.
  // This avoids the correlated subquery which was scanning ~14.7M rows per execution.
  const rows = (await db
    .prepare(
      `WITH top_programs AS (
         SELECT ap.unitid,
                MAX(ap.cipcode) AS cipcode,
                MAX(ap.cip_title) AS cip_title,
                MAX(ap.program_roi) AS program_roi
         FROM academic_programs ap
         WHERE ap.cipcode LIKE ? AND ap.cip_title IS NOT NULL
         GROUP BY ap.unitid
         ORDER BY COALESCE(MAX(ap.program_roi), -999999) DESC
         LIMIT 50
       ),
       latest_financial AS (
         SELECT f.unitid, f.tuition_in_state, f.tuition_out_state
         FROM financial_data f
         INNER JOIN (
           SELECT unitid, MAX(year) AS max_year
           FROM financial_data
           GROUP BY unitid
         ) latest ON f.unitid = latest.unitid AND f.year = latest.max_year
       )
       SELECT tp.cipcode, tp.cip_title, tp.program_roi,
              i.unitid, i.name, i.city, i.state,
              lf.tuition_in_state, lf.tuition_out_state,
              e.earnings_10_years_after_entry
       FROM top_programs tp
       JOIN institutions i ON tp.unitid = i.unitid
       LEFT JOIN latest_financial lf ON i.unitid = lf.unitid
       LEFT JOIN earnings_outcomes e ON i.unitid = e.unitid
       ORDER BY COALESCE(tp.program_roi, -999999) DESC`
    )
    .all(cipPrefix + '%')) as ProgramRow[];

  return rows;
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { cip } = await params;
  const rows = await getProgramData(cip);

  if (!rows || rows.length === 0) {
    return { title: 'Program Not Found | CollegeComps' };
  }

  const programName = rows[0].cip_title;

  return {
    title: `Best Colleges for ${programName} by ROI | CollegeComps`,
    description: `Compare ${programName} programs at universities across the US. See which colleges offer the best return on investment.`,
    openGraph: {
      title: `Best Colleges for ${programName} by ROI | CollegeComps`,
      description: `Compare ${programName} programs at universities across the US. See which colleges offer the best return on investment.`,
      url: `https://collegecomps.com/programs/${cip}`,
    },
  };
}

export default async function ProgramCipPage({ params }: PageProps) {
  const { cip } = await params;
  const rows = await getProgramData(cip);

  if (!rows || rows.length === 0) {
    notFound();
  }

  const programName = rows[0].cip_title;

  return (
    <div className="min-h-screen bg-black text-white">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://collegecomps.com' },
          { name: 'Programs', url: 'https://collegecomps.com/programs' },
          {
            name: programName,
            url: `https://collegecomps.com/programs/${cip}`,
          },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <nav className="mb-6 text-sm text-gray-400">
          <Link href="/programs" className="hover:text-orange-500 transition-colors">
            Programs
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white">{programName}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Best Colleges for{' '}
          <span className="text-orange-500">{programName}</span> by ROI
        </h1>
        <p className="text-gray-400 text-lg mb-10 max-w-3xl">
          Compare {programName} programs at {rows.length} universities across
          the US, ranked by return on investment.
        </p>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-sm">
                <th className="pb-3 pr-4 font-medium">#</th>
                <th className="pb-3 pr-4 font-medium">Institution</th>
                <th className="pb-3 pr-4 font-medium hidden sm:table-cell">
                  Location
                </th>
                <th className="pb-3 pr-4 font-medium text-right">
                  Program ROI
                </th>
                <th className="pb-3 pr-4 font-medium text-right hidden md:table-cell">
                  In-State Tuition
                </th>
                <th className="pb-3 font-medium text-right hidden lg:table-cell">
                  Earnings (10yr)
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.unitid}
                  className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors"
                >
                  <td className="py-4 pr-4 text-gray-500 font-mono text-sm">
                    {index + 1}
                  </td>
                  <td className="py-4 pr-4">
                    <Link
                      href={`/colleges/${row.unitid}`}
                      className="text-white font-medium hover:text-orange-500 transition-colors"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="py-4 pr-4 text-gray-400 text-sm hidden sm:table-cell">
                    {[row.city, row.state].filter(Boolean).join(', ')}
                  </td>
                  <td className="py-4 pr-4 text-right">
                    <span
                      className={
                        row.program_roi != null && row.program_roi > 0
                          ? 'text-green-400 font-semibold'
                          : row.program_roi != null
                            ? 'text-red-400 font-semibold'
                            : 'text-gray-500'
                      }
                    >
                      {row.program_roi != null
                        ? formatCurrency(row.program_roi)
                        : 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-right text-gray-300 hidden md:table-cell">
                    {formatCurrency(row.tuition_in_state)}
                  </td>
                  <td className="py-4 text-right text-gray-300 hidden lg:table-cell">
                    {formatCurrency(row.earnings_10_years_after_entry)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gray-900 border border-gray-800 rounded-xl p-8 sm:p-10 text-center">
          <h2 className="text-2xl font-bold mb-3">
            Calculate Your Personal ROI
          </h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Use our ROI Calculator to estimate the financial return of a{' '}
            {programName} degree based on your specific situation.
          </p>
          <Link
            href="/roi-calculator"
            className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            Try the ROI Calculator
            <svg
              className="ml-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
