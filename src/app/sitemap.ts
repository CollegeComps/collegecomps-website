import { MetadataRoute } from 'next';
import { CollegeDataService } from '@/lib/database';

const BASE_URL = 'https://collegecomps.com';

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
      url: `${BASE_URL}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/colleges`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
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
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

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

    console.log(`Generated sitemap with ${institutions.length} college pages`);
  } catch (error) {
    console.error('Error generating college pages for sitemap:', error);
    // If database fails, return static pages only
  }

  return [...staticPages, ...collegePages];
}
