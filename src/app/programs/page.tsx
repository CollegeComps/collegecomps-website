import { Metadata } from 'next';
import Link from 'next/link';
import {
  ComputerDesktopIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  HeartIcon,
  BeakerIcon,
  CalculatorIcon,
  AcademicCapIcon,
  BookOpenIcon,
  PencilIcon,
  UserGroupIcon,
  PaintBrushIcon,
  ScaleIcon,
  MegaphoneIcon,
  GlobeAmericasIcon,
} from '@heroicons/react/24/outline';
import { BreadcrumbSchema } from '@/components/StructuredData';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Browse Programs by Major | CollegeComps',
  description:
    'Explore college programs by field of study. Compare ROI across Computer Science, Engineering, Business, Health, and more.',
  openGraph: {
    title: 'Browse Programs by Major | CollegeComps',
    description:
      'Explore college programs by field of study. Compare ROI across Computer Science, Engineering, Business, Health, and more.',
    url: 'https://collegecomps.com/programs',
  },
};

const MAJOR_CATEGORIES = [
  { cip: '11', name: 'Computer Science & IT', icon: ComputerDesktopIcon },
  { cip: '14', name: 'Engineering', icon: WrenchScrewdriverIcon },
  { cip: '52', name: 'Business & Management', icon: ChartBarIcon },
  { cip: '51', name: 'Health Professions', icon: HeartIcon },
  { cip: '26', name: 'Biological Sciences', icon: BeakerIcon },
  { cip: '27', name: 'Mathematics & Statistics', icon: CalculatorIcon },
  { cip: '42', name: 'Psychology', icon: AcademicCapIcon },
  { cip: '13', name: 'Education', icon: BookOpenIcon },
  { cip: '23', name: 'English Language & Literature', icon: PencilIcon },
  { cip: '45', name: 'Social Sciences', icon: UserGroupIcon },
  { cip: '50', name: 'Visual & Performing Arts', icon: PaintBrushIcon },
  { cip: '40', name: 'Physical Sciences', icon: GlobeAmericasIcon },
  { cip: '22', name: 'Legal Studies', icon: ScaleIcon },
  { cip: '09', name: 'Communication & Journalism', icon: MegaphoneIcon },
  { cip: '03', name: 'Natural Resources & Conservation', icon: BeakerIcon },
];

export default function ProgramsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://collegecomps.com' },
          { name: 'Programs', url: 'https://collegecomps.com/programs' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Browse Programs by Major
        </h1>
        <p className="text-gray-400 text-lg mb-10 max-w-3xl">
          Explore college programs by field of study. See which schools offer the
          best return on investment for each major.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MAJOR_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.cip}
                href={`/programs/${category.cip}`}
                className="group bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-orange-500/50 hover:shadow-[0_0_16px_rgba(249,115,22,0.1)] transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                    <Icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white group-hover:text-orange-500 transition-colors">
                      {category.name}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      CIP {category.cip} &mdash; View top schools by ROI
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gray-900 border border-gray-800 rounded-xl p-8 sm:p-10 text-center">
          <h2 className="text-2xl font-bold mb-3">
            Not sure which program is right for you?
          </h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Use our ROI Calculator to compare the financial outcomes of
            different programs and find the best fit for your goals.
          </p>
          <Link
            href="/roi-calculator"
            className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            Try the ROI Calculator
            <svg
              className="ml-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
