import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

/**
 * Generate page-level metadata that inherits from the root layout's
 * metadataBase. Canonical URLs use relative paths so they resolve against
 * metadataBase automatically.
 */
export function generateSEOMetadata({
  title,
  description,
  path = '',
  image = '/opengraph-image',
  type = 'website',
  noindex = false,
}: SEOProps): Metadata {
  const siteName = 'CollegeComps';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return {
    title: fullTitle,
    description,
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      type,
      title: fullTitle,
      description,
      url: path || '/',
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@collegecomps',
      site: '@collegecomps',
    },
    alternates: {
      // Relative canonical — resolves to full URL via root metadataBase.
      canonical: path || '/',
    },
  };
}

/**
 * Search-targeted page titles and descriptions. The title should match what
 * a user would actually type into Google. Descriptions are under 160 chars.
 */
export const seoPresets = {
  home: {
    title: 'CollegeComps — Is Your Degree Really Worth the Debt?',
    description:
      'Compare the ROI of 6,000+ US colleges, trade schools, and graduate programs using federal IPEDS data. See real tuition vs. earnings before you borrow.',
    path: '/',
  },
  roiCalculator: {
    title: 'Free College ROI Calculator — See If Your Degree Is Worth It',
    description:
      'Calculate the 30-year return on investment for any US college or program. Uses real IPEDS tuition and graduate earnings data. No account required.',
    path: '/roi-calculator',
  },
  compareColleges: {
    title: 'Compare Colleges Side-by-Side — Costs, Salaries & ROI',
    description:
      'Compare up to 4 colleges at once on tuition, acceptance rate, graduate earnings, and lifetime ROI. Free comparison tool using federal data.',
    path: '/compare',
  },
  collegeExplorer: {
    title: 'Browse 6,000+ US Colleges by ROI, Cost & Outcomes',
    description:
      'Search and filter over 6,000 US colleges by location, cost, acceptance rate, and graduate earnings. Built on federal IPEDS data.',
    path: '/colleges',
  },
  salaryInsights: {
    title: 'Real Graduate Salary Data — By Major and Institution',
    description:
      'See what college graduates actually earn by major, school, and years of experience. Data from federal Bureau of Labor Statistics and alumni submissions.',
    path: '/salary-insights',
  },
  historicalTrends: {
    title: 'College Cost & Salary Trends — Historical Analysis',
    description:
      'See how college costs and graduate salaries have changed over time. Historical data visualizations powered by federal education statistics.',
    path: '/historical-trends',
  },
  pricing: {
    title: 'Pricing — Free & Premium Plans for College ROI Analysis',
    description:
      'CollegeComps is free for all core tools. Upgrade for unlimited saved comparisons, detailed salary insights, and advanced ROI analytics.',
    path: '/pricing',
  },
  privacy: {
    title: 'Privacy Policy',
    description:
      'How CollegeComps collects, uses, and protects your personal information. GDPR and CCPA compliant.',
    path: '/privacy',
    noindex: true,
  },
  terms: {
    title: 'Terms of Service',
    description:
      'Terms of Service covering your use of CollegeComps and our data.',
    path: '/terms',
    noindex: true,
  },
};
