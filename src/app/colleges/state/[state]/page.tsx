import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { US_STATES } from '@/lib/constants/states';
import { getCollegeDb } from '@/lib/db-helper';
import { BreadcrumbSchema } from '@/components/StructuredData';
import { formatCurrency } from '@/lib/formatting';

// ISR: revalidate every 24 hours
export const revalidate = 86400;

interface PageProps {
  params: Promise<{ state: string }>;
}

interface StateCollege {
  unitid: number;
  name: string;
  city: string;
  state: string;
  control_public_private: number | null;
  institution_avg_roi: number | null;
  acceptance_rate: number | null;
  tuition_in_state: number | null;
  tuition_out_state: number | null;
  net_price: number | null;
  earnings_6_years_after_entry: number | null;
  earnings_10_years_after_entry: number | null;
}

function getStateInfo(stateCode: string) {
  const upper = stateCode.toUpperCase();
  return US_STATES.find((s) => s.code === upper);
}

function formatROI(roi: number | null): string {
  if (roi == null) return 'N/A';
  return '$' + (roi / 1_000_000).toFixed(2) + 'M';
}

export function generateStaticParams() {
  return US_STATES.map((s) => ({ state: s.code.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state } = await params;
  const stateInfo = getStateInfo(state);

  if (!stateInfo) {
    return { title: 'State Not Found | CollegeComps' };
  }

  const db = getCollegeDb();
  let count = 0;
  if (db) {
    const row = (await db
      .prepare('SELECT COUNT(*) as cnt FROM institutions WHERE state = ?')
      .get(stateInfo.code)) as { cnt: number } | undefined;
    count = row?.cnt ?? 0;
  }

  return {
    title: `Best ROI Colleges in ${stateInfo.name} | CollegeComps`,
    description: `Compare the top colleges in ${stateInfo.name} by return on investment. See tuition, earnings, and ROI data for ${count}+ institutions.`,
    openGraph: {
      title: `Best ROI Colleges in ${stateInfo.name} | CollegeComps`,
      description: `Compare the top colleges in ${stateInfo.name} by return on investment. See tuition, earnings, and ROI data for ${count}+ institutions.`,
      url: `https://collegecomps.com/colleges/state/${stateInfo.code.toLowerCase()}`,
    },
  };
}

const QUERY = `
SELECT i.unitid, i.name, i.city, i.state, i.control_public_private,
       i.institution_avg_roi, i.acceptance_rate,
       f.tuition_in_state, f.tuition_out_state, f.net_price,
       e.earnings_6_years_after_entry, e.earnings_10_years_after_entry
FROM institutions i
LEFT JOIN financial_data f ON i.unitid = f.unitid
  AND f.year = (SELECT year FROM financial_data WHERE unitid = i.unitid ORDER BY year DESC LIMIT 1)
LEFT JOIN earnings_outcomes e ON i.unitid = e.unitid
WHERE i.state = ?
ORDER BY COALESCE(i.institution_avg_roi, -999999) DESC
LIMIT 50
`;

export default async function StatePage({ params }: PageProps) {
  const { state } = await params;
  const stateInfo = getStateInfo(state);

  if (!stateInfo) {
    notFound();
  }

  const db = getCollegeDb();
  if (!db) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">College data is currently unavailable. Please try again later.</p>
      </div>
    );
  }

  const colleges = (await db.prepare(QUERY).all(stateInfo.code)) as StateCollege[];

  // Compute summary stats
  const withROI = colleges.filter((c) => c.institution_avg_roi != null);
  const avgROI =
    withROI.length > 0
      ? withROI.reduce((sum, c) => sum + (c.institution_avg_roi ?? 0), 0) / withROI.length
      : null;
  const withTuition = colleges.filter((c) => c.tuition_in_state != null);
  const avgTuition =
    withTuition.length > 0
      ? withTuition.reduce((sum, c) => sum + (c.tuition_in_state ?? 0), 0) / withTuition.length
      : null;
  const withEarnings = colleges.filter((c) => c.earnings_10_years_after_entry != null);
  const avgEarnings =
    withEarnings.length > 0
      ? withEarnings.reduce((sum, c) => sum + (c.earnings_10_years_after_entry ?? 0), 0) / withEarnings.length
      : null;

  // Total count for the state
  const totalRow = (await db
    .prepare('SELECT COUNT(*) as cnt FROM institutions WHERE state = ?')
    .get(stateInfo.code)) as { cnt: number } | undefined;
  const totalCount = totalRow?.cnt ?? colleges.length;

  return (
    <div className="min-h-screen bg-black text-white">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://collegecomps.com' },
          { name: 'Colleges', url: 'https://collegecomps.com/colleges' },
          { name: stateInfo.name, url: `https://collegecomps.com/colleges/state/${stateInfo.code.toLowerCase()}` },
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <nav className="text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-orange-400 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/colleges" className="hover:text-orange-400 transition-colors">Colleges</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-200">{stateInfo.name}</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">
          Best ROI Colleges in <span className="text-orange-400">{stateInfo.name}</span>
        </h1>

        <p className="text-lg text-gray-300 mb-8 max-w-3xl leading-relaxed">
          {stateInfo.name} is home to {totalCount} institutions of higher education.
          {avgROI != null && (
            <> The average lifetime return on investment among the top colleges in {stateInfo.name} is{' '}
            <strong className="text-white">{formatROI(avgROI)}</strong>.</>
          )}
          {avgTuition != null && (
            <> Average in-state tuition across these institutions is{' '}
            <strong className="text-white">{formatCurrency(Math.round(avgTuition))}</strong>.</>
          )}
          {avgEarnings != null && (
            <> Graduates from {stateInfo.name} colleges earn an average of{' '}
            <strong className="text-white">{formatCurrency(Math.round(avgEarnings))}</strong> ten years after enrollment.</>
          )}
          {' '}Below are the top {colleges.length} colleges in {stateInfo.name} ranked by return on investment.
        </p>

        {/* Summary Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">Institutions</p>
            <p className="text-2xl font-bold text-orange-400">{totalCount}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">Avg In-State Tuition</p>
            <p className="text-2xl font-bold text-orange-400">{avgTuition != null ? formatCurrency(Math.round(avgTuition)) : 'N/A'}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">Avg 10-Year Earnings</p>
            <p className="text-2xl font-bold text-orange-400">{avgEarnings != null ? formatCurrency(Math.round(avgEarnings)) : 'N/A'}</p>
          </div>
        </div>

        {/* College List */}
        <h2 className="text-2xl font-semibold mb-6">
          Top {colleges.length} Colleges by ROI in {stateInfo.name}
        </h2>

        {colleges.length === 0 ? (
          <p className="text-gray-400">No institutions found for {stateInfo.name}.</p>
        ) : (
          <div className="space-y-4">
            {colleges.map((college, index) => (
              <Link
                key={college.unitid}
                href={`/colleges/${college.unitid}`}
                className="block bg-gray-900 rounded-lg p-5 border border-gray-800 hover:border-orange-400/50 transition-colors group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-sm font-mono text-gray-500 shrink-0">#{index + 1}</span>
                      <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors truncate">
                        {college.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-400 ml-8">
                      {college.city}, {college.state}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 sm:gap-x-8 ml-8 sm:ml-0 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Tuition</p>
                      <p className="text-sm font-medium text-gray-200">
                        {formatCurrency(college.tuition_in_state)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">10yr Earnings</p>
                      <p className="text-sm font-medium text-gray-200">
                        {formatCurrency(college.earnings_10_years_after_entry)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Lifetime ROI</p>
                      <p className={`text-sm font-bold ${college.institution_avg_roi != null && college.institution_avg_roi > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                        {formatROI(college.institution_avg_roi)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* SEO Content Section */}
        <section className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-semibold mb-4">
            Understanding College ROI in {stateInfo.name}
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Return on investment (ROI) measures the financial value of a college degree by comparing the total
            cost of attendance against lifetime earnings. A higher ROI means graduates earn significantly more
            over their careers relative to what they paid for their education. The colleges listed above represent
            the best value in {stateInfo.name} based on this metric.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4">
            Factors that influence college ROI include tuition costs, financial aid availability, graduation rates,
            and the earning potential of graduates. In {stateInfo.name}, public institutions often provide strong
            ROI due to lower in-state tuition, while selective private colleges can also rank highly thanks to
            strong graduate outcomes.
          </p>
          <p className="text-gray-300 leading-relaxed">
            The data shown here is sourced from the U.S. Department of Education&apos;s IPEDS database and includes
            tuition figures, median earnings six and ten years after enrollment, and calculated lifetime ROI
            estimates. Use this data as a starting point for your college research.
          </p>
        </section>

        {/* CTA */}
        <div className="mt-16 bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
          <h2 className="text-2xl font-semibold mb-3">Calculate Your Personal ROI</h2>
          <p className="text-gray-300 mb-6 max-w-lg mx-auto">
            Want to see how a specific college and program stacks up for you? Try our free ROI Calculator
            to compare costs, earnings, and long-term financial outcomes.
          </p>
          <Link
            href="/roi-calculator"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Try the ROI Calculator
          </Link>
        </div>
      </div>
    </div>
  );
}
