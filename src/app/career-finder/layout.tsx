import { generateSEOMetadata } from '@/lib/seo';

export const metadata = generateSEOMetadata({
  title: 'Career Finder - Discover Careers That Match Your Personality',
  description: 'Take our career assessment to discover careers that match your interests and personality. See salary data, education requirements, and growth projections for each career path.',
  path: '/career-finder',
});

export default function CareerFinderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
