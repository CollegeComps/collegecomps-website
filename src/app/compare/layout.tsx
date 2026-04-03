import { generateSEOMetadata, seoPresets } from '@/lib/seo';

export const metadata = generateSEOMetadata(seoPresets.compareColleges);

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
