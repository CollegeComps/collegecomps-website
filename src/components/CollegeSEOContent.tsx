import Link from 'next/link';
import { Institution, AcademicProgram } from '@/lib/database';
import { FAQSchema } from '@/components/StructuredData';
import { formatCurrency, getControlTypeLabel } from '@/lib/formatting';

interface Props {
  institution: Institution;
  programs: AcademicProgram[];
}

/**
 * Server-rendered SEO content section for every college page.
 *
 * The goal: ensure every college detail page has substantive, UNIQUE prose
 * that Google can index — no more soft-404 classification from thin content.
 *
 * This section is rendered on the server BEFORE the interactive client
 * component, so crawlers see it in the initial HTML.
 *
 * Content strategy:
 *  - Open with a unique paragraph built from the school's actual facts
 *  - Always include the top programs as a bulleted list (always unique)
 *  - Always include a FAQ section with dynamic per-school answers
 *  - For sparse schools, explain WHAT data is and isn't reported to IPEDS
 *    (unique, informative — beats a blank card)
 */
export default function CollegeSEOContent({ institution, programs }: Props) {
  const location = [institution.city, institution.state].filter(Boolean).join(', ');
  const controlLabel = getControlTypeLabel(
    institution.control_public_private ?? institution.control_of_institution
  );

  const tuitionInState = institution.tuition_in_state ?? null;
  const tuitionOutState = institution.tuition_out_state ?? null;
  const earnings10yr = institution.earnings_10_years_after_entry ?? null;
  const earnings6yr = institution.earnings_6_years_after_entry ?? null;
  const earnings = earnings10yr ?? earnings6yr;
  const earningsYear = earnings10yr ? '10' : '6';
  const netPrice = institution.net_price ?? null;
  const acceptanceRate = institution.acceptance_rate ?? null;
  const roi = institution.institution_avg_roi ?? null;
  const totalEnrollment = institution.total_enrollment ?? null;

  // Build programs summary for unique copy
  const programsWithCompletions = programs.filter(
    (p) => (p.total_completions || p.completions || 0) > 0
  );
  const topProgramsByCompletions = [...programs]
    .sort(
      (a, b) =>
        (b.total_completions || b.completions || 0) -
        (a.total_completions || a.completions || 0)
    )
    .slice(0, 8)
    .map((p) => p.cip_title)
    .filter(Boolean);

  // Build FAQ entries dynamically — every school gets a unique set of Q&As
  const faqs: { question: string; answer: string }[] = [];

  faqs.push({
    question: `Where is ${institution.name} located?`,
    answer: `${institution.name} is located in ${location}.`,
  });

  faqs.push({
    question: `What type of institution is ${institution.name}?`,
    answer: `${institution.name} is a ${controlLabel.toLowerCase()} institution${
      totalEnrollment ? ` with a total enrollment of ${totalEnrollment.toLocaleString()} students` : ''
    }.`,
  });

  if (tuitionInState || tuitionOutState) {
    const tuitionStr = tuitionInState
      ? `In-state tuition is ${formatCurrency(tuitionInState)} per year${
          tuitionOutState && tuitionOutState !== tuitionInState
            ? `, while out-of-state tuition is ${formatCurrency(tuitionOutState)}`
            : ''
        }.`
      : `Tuition is ${formatCurrency(tuitionOutState!)} per year.`;
    faqs.push({
      question: `How much does ${institution.name} cost?`,
      answer: `${tuitionStr}${netPrice ? ` The average net price after financial aid is ${formatCurrency(netPrice)}.` : ''}`,
    });
  } else {
    faqs.push({
      question: `How much does ${institution.name} cost?`,
      answer: `Tuition figures for ${institution.name} are not currently reported in the federal IPEDS dataset we use. Contact the school directly for the most accurate pricing.`,
    });
  }

  if (earnings) {
    faqs.push({
      question: `What do ${institution.name} graduates earn?`,
      answer: `Students who enrolled at ${institution.name} earn a median of ${formatCurrency(earnings)} ${earningsYear} years after entry, according to U.S. Department of Education data.`,
    });
  }

  if (roi != null) {
    const roiStr = (roi / 1_000_000).toFixed(2);
    faqs.push({
      question: `Is ${institution.name} a good return on investment?`,
      answer: `${institution.name} has an estimated lifetime ROI of $${roiStr} million based on comparing total cost of attendance to projected lifetime earnings relative to a high school graduate baseline.`,
    });
  }

  if (acceptanceRate) {
    const pct = (acceptanceRate * 100).toFixed(1);
    const selectivity =
      acceptanceRate < 0.2
        ? 'highly selective'
        : acceptanceRate < 0.5
        ? 'selective'
        : acceptanceRate < 0.75
        ? 'moderately selective'
        : 'less selective';
    faqs.push({
      question: `How competitive is ${institution.name} admissions?`,
      answer: `${institution.name} has a ${pct}% acceptance rate, making it ${selectivity}.`,
    });
  }

  if (programsWithCompletions.length > 0) {
    faqs.push({
      question: `What programs does ${institution.name} offer?`,
      answer: `${institution.name} offers ${programs.length} programs across multiple fields${
        topProgramsByCompletions.length
          ? `, including ${topProgramsByCompletions.slice(0, 5).join(', ')}`
          : ''
      }.`,
    });
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
      {/* Emit FAQ schema for rich results */}
      <FAQSchema faqs={faqs} />

      {/* Unique summary paragraph — different for every school */}
      <div className="mb-8 prose prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-white mb-3">About {institution.name}</h2>
        <p className="text-gray-300 leading-relaxed">
          {institution.name} is a {controlLabel.toLowerCase()} institution located in{' '}
          {location}.{' '}
          {totalEnrollment
            ? `It enrolls approximately ${totalEnrollment.toLocaleString()} students across ${programs.length} academic program${programs.length === 1 ? '' : 's'}.`
            : `It offers ${programs.length} academic program${programs.length === 1 ? '' : 's'}.`}
          {acceptanceRate
            ? ` The school admits ${(acceptanceRate * 100).toFixed(1)}% of applicants.`
            : ''}
        </p>

        {(tuitionInState || tuitionOutState) && (
          <p className="text-gray-300 leading-relaxed mt-4">
            Tuition at {institution.name} is{' '}
            {tuitionInState ? formatCurrency(tuitionInState) : formatCurrency(tuitionOutState!)}
            {tuitionInState ? ' per year for in-state students' : ' per year'}
            {tuitionOutState && tuitionOutState !== tuitionInState
              ? `, with out-of-state tuition at ${formatCurrency(tuitionOutState)}`
              : ''}
            .{' '}
            {netPrice
              ? `The average net price after financial aid is ${formatCurrency(netPrice)}, giving families a clearer picture of actual out-of-pocket costs.`
              : ''}
          </p>
        )}

        {earnings && (
          <p className="text-gray-300 leading-relaxed mt-4">
            According to data from the U.S. Department of Education, graduates who enrolled at{' '}
            {institution.name} earn a median of {formatCurrency(earnings)} {earningsYear} years
            after entry.{' '}
            {roi != null
              ? `With an estimated lifetime ROI of $${(roi / 1_000_000).toFixed(2)} million, this institution represents ${
                  roi > 1_000_000 ? 'a strong return' : 'a modest return'
                } on the investment in tuition and foregone earnings.`
              : ''}
          </p>
        )}

        {!earnings && !tuitionInState && !tuitionOutState && (
          <p className="text-gray-300 leading-relaxed mt-4">
            Detailed tuition and graduate earnings data for {institution.name} are not currently
            reported in the IPEDS (Integrated Postsecondary Education Data System) dataset that
            powers this page. This is common for smaller private institutions, vocational schools,
            and schools that do not participate in federal student aid programs. Contact the
            school directly for up-to-date cost and outcome information.
          </p>
        )}

        {topProgramsByCompletions.length > 0 && (
          <>
            <h3 className="text-xl font-bold text-white mt-8 mb-3">
              Most Popular Programs at {institution.name}
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              {topProgramsByCompletions.map((name, i) => (
                <li key={i}>{name}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Visible FAQ section — users see it, Google indexes it as FAQ rich result */}
      {faqs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Frequently Asked Questions About {institution.name}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 rounded-lg p-5"
              >
                <h3 className="text-base font-bold text-white mb-2">{faq.question}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cross-links to help Google understand the site structure */}
      <div className="mb-6 text-sm text-gray-400">
        <span>See related: </span>
        {institution.state && (
          <>
            <Link
              href={`/colleges/state/${(institution.state as string).toLowerCase()}`}
              className="text-orange-500 hover:text-orange-400 font-medium"
            >
              Best ROI colleges in {institution.state}
            </Link>
            {' · '}
          </>
        )}
        <Link href="/roi-calculator" className="text-orange-500 hover:text-orange-400 font-medium">
          Calculate your ROI
        </Link>
        {' · '}
        <Link href="/compare" className="text-orange-500 hover:text-orange-400 font-medium">
          Compare colleges
        </Link>
      </div>
    </section>
  );
}
