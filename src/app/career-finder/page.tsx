'use client';

import { useState } from 'react';
import { 
  LightBulbIcon,
  UsersIcon, 
  ChartBarIcon,
  BeakerIcon,
  PaintBrushIcon,
  HeartIcon,
  BriefcaseIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface Question {
  id: number;
  text: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP'; // Extrovert/Introvert, Sensing/iNtuition, Thinking/Feeling, Judging/Perceiving
  direction: 'positive' | 'negative';
}

const QUESTIONS: Question[] = [
  // Extrovert vs Introvert
  { id: 1, text: 'I enjoy working in teams and collaborating with others', dimension: 'EI', direction: 'positive' },
  { id: 2, text: 'I prefer working independently and focusing deeply on my own tasks', dimension: 'EI', direction: 'negative' },
  { id: 3, text: 'I feel energized after social interactions', dimension: 'EI', direction: 'positive' },
  
  // Sensing vs iNtuition
  { id: 4, text: 'I prefer practical, hands-on activities over abstract theories', dimension: 'SN', direction: 'negative' },
  { id: 5, text: 'I enjoy exploring new ideas and possibilities', dimension: 'SN', direction: 'positive' },
  { id: 6, text: 'I focus more on the big picture than on details', dimension: 'SN', direction: 'positive' },
  
  // Thinking vs Feeling
  { id: 7, text: 'I make decisions based on logic and objective analysis', dimension: 'TF', direction: 'negative' },
  { id: 8, text: 'I consider how decisions will affect people and relationships', dimension: 'TF', direction: 'positive' },
  { id: 9, text: 'I value harmony and empathy in my interactions', dimension: 'TF', direction: 'positive' },
  
  // Judging vs Perceiving
  { id: 10, text: 'I prefer structure and planning over spontaneity', dimension: 'JP', direction: 'negative' },
  { id: 11, text: 'I enjoy flexibility and keeping my options open', dimension: 'JP', direction: 'positive' },
  { id: 12, text: 'I thrive in fast-paced, adaptable environments', dimension: 'JP', direction: 'positive' },
];

interface CareerMatch {
  name: string;
  description: string;
  icon: any;
  majors: string[];
  growth: string;
  salary: string;
}

const CAREER_MAPPINGS: Record<string, CareerMatch[]> = {
  'ENTJ': [
    { name: 'Business Executive', description: 'Lead organizations and drive strategic growth', icon: BriefcaseIcon, majors: ['Business Administration', 'Management', 'Finance'], growth: '6%', salary: '$104k' },
    { name: 'Entrepreneur', description: 'Build and scale innovative businesses', icon: LightBulbIcon, majors: ['Entrepreneurship', 'Business', 'Marketing'], growth: '8%', salary: '$90k+' },
  ],
  'INTJ': [
    { name: 'Software Architect', description: 'Design complex software systems and solutions', icon: BeakerIcon, majors: ['Computer Science', 'Software Engineering'], growth: '22%', salary: '$120k' },
    { name: 'Data Scientist', description: 'Extract insights from complex data', icon: ChartBarIcon, majors: ['Data Science', 'Statistics', 'Computer Science'], growth: '35%', salary: '$126k' },
  ],
  'ENFJ': [
    { name: 'School Counselor', description: 'Guide students through academic and personal challenges', icon: HeartIcon, majors: ['Psychology', 'Counseling', 'Education'], growth: '10%', salary: '$60k' },
    { name: 'Human Resources Manager', description: 'Develop talent and foster positive work culture', icon: UsersIcon, majors: ['Human Resources', 'Business', 'Psychology'], growth: '7%', salary: '$126k' },
  ],
  'INFJ': [
    { name: 'Clinical Psychologist', description: 'Help people overcome mental health challenges', icon: HeartIcon, majors: ['Psychology', 'Clinical Psychology'], growth: '6%', salary: '$82k' },
    { name: 'Writer/Author', description: 'Create meaningful content and stories', icon: PaintBrushIcon, majors: ['English', 'Creative Writing', 'Journalism'], growth: '4%', salary: '$67k' },
  ],
  'DEFAULT': [
    { name: 'Business Analyst', description: 'Analyze data to drive business decisions', icon: ChartBarIcon, majors: ['Business', 'Economics', 'Data Analytics'], growth: '11%', salary: '$82k' },
    { name: 'Software Developer', description: 'Build applications and solve technical problems', icon: BeakerIcon, majors: ['Computer Science', 'Software Engineering'], growth: '22%', salary: '$110k' },
    { name: 'Marketing Manager', description: 'Create and execute marketing strategies', icon: LightBulbIcon, majors: ['Marketing', 'Business', 'Communications'], growth: '10%', salary: '$135k' },
  ],
};

export default function CareerFinderPage() {
  const [step, setStep] = useState<'intro' | 'quiz' | 'results'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [email, setEmail] = useState('');
  const [personalityType, setPersonalityType] = useState('');
  const [careers, setCareers] = useState<CareerMatch[]>([]);

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [QUESTIONS[currentQuestion].id]: value };
    setAnswers(newAnswers);
    
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate personality type and show results
      calculateResults(newAnswers);
    }
  };

  const calculateResults = (finalAnswers: Record<number, number>) => {
    const scores = { EI: 0, SN: 0, TF: 0, JP: 0 };
    
    QUESTIONS.forEach(q => {
      const answer = finalAnswers[q.id] || 3;
      const score = q.direction === 'positive' ? answer : (6 - answer);
      scores[q.dimension] += score;
    });
    
    // Determine personality type (simplified)
    const type = 
      (scores.EI >= 9 ? 'E' : 'I') +
      (scores.SN >= 9 ? 'N' : 'S') +
      (scores.TF >= 9 ? 'F' : 'T') +
      (scores.JP >= 9 ? 'P' : 'J');
    
    setPersonalityType(type);
    setCareers(CAREER_MAPPINGS[type] || CAREER_MAPPINGS.DEFAULT);
    setStep('results');
  };

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6">
              <LightBulbIcon className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Career Finder
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover careers that match your personality and interests. Take our quick assessment to find your ideal path.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Discover:</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BriefcaseIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Career Matches</h3>
                  <p className="text-sm text-gray-600">Careers aligned with your personality and strengths</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AcademicCapIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">College Majors</h3>
                  <p className="text-sm text-gray-600">Recommended majors for your career path</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ChartBarIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Salary Insights</h3>
                  <p className="text-sm text-gray-600">Expected earnings and job growth data</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-pink-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HeartIcon className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Personality Profile</h3>
                  <p className="text-sm text-gray-600">Understand your unique strengths and preferences</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-indigo-800">
                ⏱️ Takes just 5 minutes • 📊 Based on personality psychology • 🎯 Personalized results
              </p>
            </div>

            <button
              onClick={() => setStep('quiz')}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors"
            >
              Start Assessment
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>This assessment is based on personality psychology and career research</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'quiz') {
    const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {currentQuestion + 1} of {QUESTIONS.length}
              </span>
              <span className="text-sm font-medium text-indigo-600">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              {QUESTIONS[currentQuestion].text}
            </h2>

            <div className="space-y-3">
              {[
                { value: 5, label: 'Strongly Agree' },
                { value: 4, label: 'Agree' },
                { value: 3, label: 'Neutral' },
                { value: 2, label: 'Disagree' },
                { value: 1, label: 'Strongly Disagree' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left font-medium text-gray-700 hover:text-indigo-700"
                >
                  {option.label}
                </button>
              ))}
            </div>

            {currentQuestion > 0 && (
              <button
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="mt-6 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                ← Back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Results
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <LightBulbIcon className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Career Matches
          </h1>
          <p className="text-lg text-gray-600">
            Based on your personality type: <span className="font-bold text-indigo-600">{personalityType}</span>
          </p>
        </div>

        {/* Email Capture */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 max-w-2xl mx-auto">
          <h3 className="font-semibold text-gray-900 mb-3">Get Your Full Results via Email</h3>
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button 
              onClick={() => alert('Results sent!')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Send Results
            </button>
          </div>
        </div>

        {/* Career Matches */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {careers.map((career, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-indigo-100 w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0">
                  <career.icon className="w-7 h-7 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{career.name}</h3>
                  <p className="text-gray-600">{career.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-700 font-medium mb-1">AVG SALARY</p>
                  <p className="text-lg font-bold text-green-900">{career.salary}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium mb-1">JOB GROWTH</p>
                  <p className="text-lg font-bold text-blue-900">{career.growth}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Recommended Majors:</p>
                <div className="flex flex-wrap gap-2">
                  {career.majors.map((major, idx) => (
                    <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                      {major}
                    </span>
                  ))}
                </div>
              </div>

              <button className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                Explore Programs
              </button>
            </div>
          ))}
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Next Steps on Your Journey</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-indigo-600">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Explore College Programs</h4>
                <p className="text-sm text-gray-600">Search for colleges offering your recommended majors</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-indigo-600">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Calculate Your ROI</h4>
                <p className="text-sm text-gray-600">See the financial return on your education investment</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-indigo-600">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Find Scholarships</h4>
                <p className="text-sm text-gray-600">Discover funding opportunities for your chosen field</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => {
              setStep('intro');
              setCurrentQuestion(0);
              setAnswers({});
              setEmail('');
            }}
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            ← Take Assessment Again
          </button>
        </div>
      </div>
    </div>
  );
}
