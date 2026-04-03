import { generateSEOMetadata, seoPresets } from '@/lib/seo';

export const metadata = generateSEOMetadata(seoPresets.salaryInsights);

export default function SalaryInsightsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
