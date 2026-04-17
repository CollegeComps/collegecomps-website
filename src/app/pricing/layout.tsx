import { generateSEOMetadata } from '@/lib/seo';

export const metadata = generateSEOMetadata({
  title: 'Pricing — Free & Premium Plans for College ROI Analysis',
  description:
    'CollegeComps is free for all core tools. Upgrade for unlimited saved comparisons, detailed salary insights, and advanced ROI analytics. No credit card required.',
  path: '/pricing',
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
