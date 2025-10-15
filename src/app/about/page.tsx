import { Metadata } from 'next';
import Link from 'next/link';
import {
  AcademicCapIcon,
  ChartBarIcon,
  UserGroupIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'About Us - CollegeComps Mission & Story',
  description: 'Learn about CollegeComps mission to empower students with data-driven college decisions. Discover our story, values, and commitment to transparency.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Making College Decisions Clear
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              CollegeComps empowers students and families to make informed education decisions 
              through comprehensive, data-driven college and program analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-xl text-gray-600">
              We believe that choosing a college and program should be based on data, not guesswork. 
              Our mission is to provide transparent, comprehensive analysis that helps students maximize 
              their return on investment while finding the right fit for their educational goals.
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <ChartBarIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Data-Driven</h3>
              <p className="text-gray-600">
                We aggregate data from trusted government sources like IPEDS and College Scorecard 
                to provide accurate, up-to-date information.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparent</h3>
              <p className="text-gray-600">
                No hidden agendas or paid placements. Our rankings and recommendations are based 
                solely on data and user-defined preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <UserGroupIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Student-Focused</h3>
              <p className="text-gray-600">
                Built for students, by people who understand the importance of making 
                the right educational investment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 text-center">
            <p className="mb-4">
              CollegeComps was born from a simple realization: choosing a college shouldn't be 
              a guessing game. With rising tuition costs and an increasingly complex higher education 
              landscape, students and families need clear, data-driven insights to make one of the 
              most important financial decisions of their lives.
            </p>

            <p className="mb-4">
              We saw families struggling to compare colleges effectively, relying on incomplete 
              information, anecdotal advice, or marketing materials that didn't tell the full story. 
              Meanwhile, comprehensive data from government sources like IPEDS and the College Scorecard 
              existed but remained inaccessible and difficult to interpret.
            </p>

            <p className="mb-4">
              CollegeComps bridges that gap. We've built a platform that transforms complex educational 
              data into actionable insights. Our ROI calculator helps students understand not just the 
              cost of college, but the potential return on their investment. Our comparison tools make 
              it easy to evaluate institutions side-by-side across dozens of metrics that matter.
            </p>

            <p>
              Today, CollegeComps serves thousands of students, parents, and counselors across the 
              United States, helping them make informed decisions about higher education. We're constantly 
              expanding our data sources, improving our tools, and listening to our users to build the 
              most comprehensive college analysis platform available.
            </p>
          </div>
        </div>
      </div>

      {/* What We Offer Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">What We Offer</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-start">
                <AcademicCapIcon className="w-8 h-8 text-blue-600 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">ROI Calculator</h3>
                  <p className="text-gray-700">
                    Calculate the return on investment for any college program. Compare tuition costs, 
                    projected earnings, and lifetime value to make financially sound decisions.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-start">
                <ChartBarIcon className="w-8 h-8 text-green-600 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">College Explorer</h3>
                  <p className="text-gray-700">
                    Browse and filter 6,000+ institutions with detailed information about costs, 
                    outcomes, demographics, and academic programs.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
              <div className="flex items-start">
                <LightBulbIcon className="w-8 h-8 text-purple-600 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Comparison Tools</h3>
                  <p className="text-gray-700">
                    Side-by-side comparisons of colleges with comprehensive metrics including costs, 
                    graduation rates, salary outcomes, and student demographics.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
              <div className="flex items-start">
                <HeartIcon className="w-8 h-8 text-orange-600 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized Insights</h3>
                  <p className="text-gray-700">
                    Save your favorite colleges, track comparisons, and receive personalized 
                    recommendations based on your preferences and goals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Sources Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Data Sources</h2>
          
          <p className="text-lg text-gray-600 text-center mb-8">
            We aggregate data from authoritative government sources to ensure accuracy and reliability:
          </p>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                IPEDS (Integrated Postsecondary Education Data System)
              </h3>
              <p className="text-gray-600">
                Comprehensive data on college enrollment, finances, graduation rates, and institutional 
                characteristics collected by the National Center for Education Statistics.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                College Scorecard
              </h3>
              <p className="text-gray-600">
                U.S. Department of Education data including average costs, graduation rates, loan 
                default rates, and post-graduation earnings.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                User-Contributed Data
              </h3>
              <p className="text-gray-600">
                Verified salary submissions from real graduates to provide current, real-world 
                earnings data across various programs and institutions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make Informed Decisions?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start exploring colleges and calculating ROI today. It's free to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/roi-calculator"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              Calculate ROI
            </Link>
            <Link
              href="/colleges"
              className="bg-transparent text-white px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white hover:bg-white hover:text-blue-600 transition-colors"
            >
              Explore Colleges
            </Link>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-12 bg-white">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-gray-600 mb-6">
            Have questions, feedback, or suggestions? We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <Link
              href="/support"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact Support
            </Link>
            <span className="hidden sm:inline text-gray-300">|</span>
            <a
              href="mailto:hello@collegecomps.com"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              hello@collegecomps.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
