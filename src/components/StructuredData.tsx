/**
 * StructuredData Component
 * 
 * Renders JSON-LD structured data for improved SEO and rich results in search engines.
 * Use this component to add schema.org markup to pages.
 */

interface StructuredDataProps {
  data: Record<string, any>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Organization Schema
 * Use on homepage to define the organization
 */
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://collegecomps.com/#organization',
    name: 'CollegeComps',
    url: 'https://collegecomps.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://collegecomps.com/logo.png',
      width: 2752,
      height: 1536,
    },
    description:
      'Compare the ROI of 6,000+ US colleges, trade schools, and graduate programs using federal IPEDS data.',
    sameAs: [
      'https://twitter.com/collegecomps',
      'https://www.linkedin.com/company/collegecomps',
      'https://www.reddit.com/r/CollegeComps/',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'fpapalardo@collegecomps.com',
      availableLanguage: 'en',
    },
  };

  return <StructuredData data={schema} />;
}

/**
 * WebSite Schema with SearchAction — tells Google our site has internal
 * search, which enables the sitelinks search box in search results.
 */
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://collegecomps.com/#website',
    url: 'https://collegecomps.com',
    name: 'CollegeComps',
    description:
      'College ROI calculator and comparison tool using federal IPEDS data.',
    publisher: {
      '@id': 'https://collegecomps.com/#organization',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://collegecomps.com/colleges?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-US',
  };

  return <StructuredData data={schema} />;
}

/**
 * WebApplication Schema
 * Use on main tool pages (ROI Calculator, Compare)
 */
export function WebApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CollegeComps ROI Calculator',
    url: 'https://collegecomps.com/roi-calculator',
    // Dual categories — EducationalApplication is the primary subject,
    // FinanceApplication captures the ROI-calculation purpose.
    applicationCategory: ['EducationalApplication', 'FinanceApplication'],
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: undefined, // Add once we have real reviews
    description:
      'Calculate the return on investment for any college program. Compare tuition costs, projected salaries, and lifetime earnings to make informed education decisions.',
    featureList: [
      'College ROI Calculator',
      'Salary Projections',
      'Cost Analysis',
      'Program Comparison',
      'Trade School vs. Degree',
    ],
    isAccessibleForFree: true,
  };

  return <StructuredData data={schema} />;
}

/**
 * College/Educational Organization Schema
 * Use on individual college pages
 */
interface CollegeSchemaProps {
  name: string;
  url?: string;
  address?: {
    city?: string;
    state?: string;
    zipCode?: string;
  };
  tuition?: number;
  description?: string;
}

export function CollegeSchema({
  name,
  url,
  address,
  tuition,
  description,
}: CollegeSchemaProps) {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name,
  };

  if (url) schema.url = url;
  if (description) schema.description = description;

  if (address?.city || address?.state || address?.zipCode) {
    schema.address = {
      '@type': 'PostalAddress',
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.zipCode,
      addressCountry: 'US',
    };
  }

  if (tuition) {
    schema.tuition = {
      '@type': 'MonetaryAmount',
      value: tuition,
      currency: 'USD',
    };
  }

  return <StructuredData data={schema} />;
}

/**
 * BreadcrumbList Schema
 * Use on nested pages for navigation breadcrumbs
 */
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <StructuredData data={schema} />;
}

/**
 * FAQPage Schema
 * Use on FAQ sections or pages with common questions
 */
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return <StructuredData data={schema} />;
}

/**
 * Article Schema
 * Use on blog posts or informational content pages
 */
interface ArticleSchemaProps {
  title: string;
  description: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
}

export function ArticleSchema({
  title,
  description,
  author = 'CollegeComps',
  datePublished,
  dateModified,
  image,
}: ArticleSchemaProps) {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    author: {
      '@type': 'Organization',
      name: author,
    },
  };

  if (datePublished) schema.datePublished = datePublished;
  if (dateModified) schema.dateModified = dateModified;
  if (image) schema.image = image;

  return <StructuredData data={schema} />;
}
