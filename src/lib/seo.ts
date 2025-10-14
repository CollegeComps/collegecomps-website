import { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

export function generateSEOMetadata({
  title,
  description,
  path = '',
  image = '/og-image.png',
  type = 'website',
  noindex = false,
}: SEOProps): Metadata {
  const siteName = 'CollegeComps';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const url = `https://collegecomps.com${path}`;

  return {
    title: fullTitle,
    description,
    keywords: [
      'college ROI',
      'return on investment',
      'college comparison',
      'college costs',
      'student debt',
      'graduate salary',
      'college worth',
      'education ROI',
      'college decision',
      'higher education',
    ],
    authors: [{ name: 'CollegeComps' }],
    creator: 'CollegeComps',
    publisher: 'CollegeComps',
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type,
      title: fullTitle,
      description,
      url,
      siteName,
      images: [
        {
          url: image.startsWith('http') ? image : `https://collegecomps.com${image}`,
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
      images: [image.startsWith('http') ? image : `https://collegecomps.com${image}`],
      creator: '@collegecomps',
      site: '@collegecomps',
    },
    alternates: {
      canonical: url,
    },
    other: {
      'application-name': siteName,
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': siteName,
      'format-detection': 'telephone=no',
      'mobile-web-app-capable': 'yes',
    },
  };
}

// Common SEO presets for different pages
export const seoPresets = {
  home: {
    title: 'CollegeComps - College ROI Calculator & Comparison Tool',
    description:
      'Make smarter education decisions with our comprehensive college ROI calculator. Compare colleges, analyze costs, and predict graduate salaries based on real data.',
    path: '/',
  },
  roiCalculator: {
    title: 'ROI Calculator - Calculate College Return on Investment',
    description:
      'Calculate the return on investment for any college program. Compare tuition costs, projected salaries, and lifetime earnings to make informed decisions.',
    path: '/roi-calculator',
  },
  compareColleges: {
    title: 'Compare Colleges - Side-by-Side College Comparison',
    description:
      'Compare colleges side-by-side with detailed metrics on costs, admission rates, graduate salaries, and more. Make data-driven college choices.',
    path: '/compare',
  },
  collegeExplorer: {
    title: 'College Explorer - Browse 7,000+ US Colleges',
    description:
      'Explore comprehensive data on over 7,000 US colleges and universities. Filter by location, costs, programs, and outcomes to find your perfect match.',
    path: '/colleges',
  },
  salaryInsights: {
    title: 'Salary Insights - Real Graduate Salary Data',
    description:
      'Access real salary data from college graduates. See what alumni earn by major, institution, and years of experience.',
    path: '/salary-insights',
  },
  historicalTrends: {
    title: 'Historical Trends - College Cost & Salary Predictions',
    description:
      'Analyze historical trends in college costs and graduate salaries. AI-powered predictions help you understand future education value.',
    path: '/historical-trends',
  },
  pricing: {
    title: 'Pricing - CollegeComps Plans & Features',
    description:
      'Choose the right plan for your college search. Free and Premium tiers with unlimited ROI calculations, comparisons, and salary insights.',
    path: '/pricing',
  },
  privacy: {
    title: 'Privacy Policy - How We Protect Your Data',
    description:
      'Learn how CollegeComps collects, uses, and protects your personal information. GDPR and CCPA compliant privacy practices.',
    path: '/privacy',
    noindex: true,
  },
  terms: {
    title: 'Terms of Service - CollegeComps User Agreement',
    description:
      'Read our Terms of Service to understand your rights and responsibilities when using CollegeComps.',
    path: '/terms',
    noindex: true,
  },
};
