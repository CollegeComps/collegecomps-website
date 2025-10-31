'use client';

import { useEffect, useState } from 'react';

const testimonials = [
  {
    initials: 'SJ',
    name: 'Sarah Johnson',
    role: 'College Counselor',
    color: 'bg-blue-100 text-blue-600',
    text: 'This platform helped my students make data-driven decisions. The ROI calculator is a game-changer for understanding long-term value.'
  },
  {
    initials: 'MC',
    name: 'Michael Chen',
    role: 'Engineering Student',
    color: 'bg-green-100 text-green-600',
    text: 'I compared 10 engineering programs and found the perfect fit. The salary data was eye-opening and helped justify my college choice.'
  },
  {
    initials: 'ER',
    name: 'Emily Rodriguez',
    role: 'Parent',
    color: 'bg-purple-100 text-purple-600',
    text: 'As a parent, I needed transparent data to help my daughter choose wisely. This tool provided clarity on costs and career outcomes.'
  },
  {
    initials: 'DW',
    name: 'David Williams',
    role: 'High School Senior',
    color: 'bg-orange-100 text-orange-600',
    text: 'CollegeComps showed me the real numbers behind each school. I found a great program at half the cost of my original choice with better career outcomes.'
  },
  {
    initials: 'LT',
    name: 'Lisa Thompson',
    role: 'Transfer Student',
    color: 'bg-pink-100 text-pink-600',
    text: 'The program comparison tool made my transfer decision so much easier. I could see exactly which credits would count and what my ROI would be.'
  },
  {
    initials: 'RK',
    name: 'Raj Kumar',
    role: 'International Student',
    color: 'bg-indigo-100 text-indigo-600',
    text: 'Coming from abroad, I needed clear cost breakdowns and outcome data. CollegeComps gave me confidence in my investment in US education.'
  },
  {
    initials: 'AP',
    name: 'Amanda Peterson',
    role: 'Graduate Student',
    color: 'bg-teal-100 text-teal-600',
    text: 'I used this to evaluate grad programs. The earnings projections helped me see which advanced degree would actually pay off financially.'
  },
  {
    initials: 'JB',
    name: 'James Brown',
    role: 'Career Changer',
    color: 'bg-cyan-100 text-cyan-600',
    text: 'Switching careers at 30, I needed to know if going back to school made sense. The ROI calculator showed me it was worth it.'
  },
  {
    initials: 'NK',
    name: 'Nina Kim',
    role: 'Financial Aid Counselor',
    color: 'bg-rose-100 text-rose-600',
    text: 'I recommend CollegeComps to all my students. It helps them understand the full picture beyond just sticker price.'
  }
];

export default function RotatingTestimonials() {
  const [selectedTestimonials, setSelectedTestimonials] = useState<typeof testimonials>([]);

  useEffect(() => {
    // Shuffle and select 3 random testimonials on mount
    const shuffled = [...testimonials].sort(() => Math.random() - 0.5);
    setSelectedTestimonials(shuffled.slice(0, 3));
  }, []);

  // If not loaded yet, show placeholder
  if (selectedTestimonials.length === 0) {
    return (
      <div className="grid md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl shadow-md p-6 border border-gray-100 animate-pulse">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {selectedTestimonials.map((testimonial, index) => (
        <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className={`w-12 h-12 ${testimonial.color} rounded-full flex items-center justify-center font-bold text-lg`}>
              {testimonial.initials}
            </div>
            <div className="ml-4">
              <div className="font-semibold text-gray-900">{testimonial.name}</div>
              <div className="text-sm text-gray-400">{testimonial.role}</div>
            </div>
          </div>
          <div className="text-yellow-400 mb-3">★★★★★</div>
          <p className="text-gray-300 italic">
            "{testimonial.text}"
          </p>
        </div>
      ))}
    </div>
  );
}
