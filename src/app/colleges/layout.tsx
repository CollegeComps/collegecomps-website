import { generateSEOMetadata, seoPresets } from '@/lib/seo';

export const metadata = generateSEOMetadata(seoPresets.collegeExplorer);

export default function CollegesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
