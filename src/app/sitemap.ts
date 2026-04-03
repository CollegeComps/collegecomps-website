import { MetadataRoute } from 'next';
import { CollegeDataService } from '@/lib/database';
import { US_STATES } from '@/lib/constants/states';

const BASE_URL = 'https://collegecomps.com';

const MAJOR_CIP_PREFIXES = [
  '11', '14', '52', '51', '26', '27', '42', '13', '23', '45', '50', '40', '22', '09', '03'
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/roi-calculator`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/career-finder`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/scholarships`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools/loan-calculator`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/colleges`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/analytics`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/salary-insights`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/historical-trends`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about/methodology`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/articles`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/student-loans`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  // Get all article pages
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const { getAllArticles } = await import('@/lib/articles');
    const articles = getAllArticles();
    articlePages = articles.map((article) => ({
      url: `${BASE_URL}/articles/${article.slug}`,
      lastModified: new Date(article.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error generating article pages for sitemap:', error);
  }

  // Get all college pages from database
  let collegePages: MetadataRoute.Sitemap = [];

  try {
    const collegeService = new CollegeDataService();

    // Get all institutions (limit to a reasonable number for sitemap)
    const institutions = await collegeService.getInstitutions(10000, 0);

    collegePages = institutions.map((college) => ({
      url: `${BASE_URL}/colleges/${college.unitid}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error generating college pages for sitemap:', error);
    // If database fails, return static pages only
  }

  // State-based pages (51 states + DC)
  const statePages: MetadataRoute.Sitemap = US_STATES.map((s) => ({
    url: `${BASE_URL}/colleges/state/${s.code.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Program/major category pages
  const programPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/programs`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    ...MAJOR_CIP_PREFIXES.map((cip) => ({
      url: `${BASE_URL}/programs/${cip}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];

  return [...staticPages, ...articlePages, ...statePages, ...programPages, ...collegePages];
}
