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
  // Analysts
  'INTJ': [
    { name: 'Software Architect', description: 'Design complex software systems and solutions', icon: BeakerIcon, majors: ['Computer Science', 'Software Engineering'], growth: '22%', salary: '$120k' },
    { name: 'Data Scientist', description: 'Extract insights from complex data', icon: ChartBarIcon, majors: ['Data Science', 'Statistics', 'Computer Science'], growth: '35%', salary: '$126k' },
    { name: 'Research Scientist', description: 'Conduct innovative research in specialized fields', icon: BeakerIcon, majors: ['Biology', 'Chemistry', 'Physics', 'Mathematics'], growth: '6%', salary: '$99k' },
  ],
  'INTP': [
    { name: 'Software Developer', description: 'Build innovative applications and solve complex problems', icon: BeakerIcon, majors: ['Computer Science', 'Software Engineering'], growth: '22%', salary: '$110k' },
    { name: 'Mathematician', description: 'Develop mathematical models and theories', icon: ChartBarIcon, majors: ['Mathematics', 'Applied Mathematics'], growth: '5%', salary: '$108k' },
    { name: 'Physicist', description: 'Study the fundamental laws of nature', icon: BeakerIcon, majors: ['Physics', 'Applied Physics'], growth: '8%', salary: '$128k' },
  ],
  'ENTJ': [
    { name: 'Business Executive', description: 'Lead organizations and drive strategic growth', icon: BriefcaseIcon, majors: ['Business Administration', 'Management', 'Finance'], growth: '6%', salary: '$104k' },
    { name: 'Entrepreneur', description: 'Build and scale innovative businesses', icon: LightBulbIcon, majors: ['Entrepreneurship', 'Business', 'Marketing'], growth: '8%', salary: '$90k+' },
    { name: 'Management Consultant', description: 'Solve complex business problems for clients', icon: BriefcaseIcon, majors: ['Business', 'Economics', 'Finance'], growth: '11%', salary: '$93k' },
  ],
  'ENTP': [
    { name: 'Product Manager', description: 'Innovate and launch new products', icon: LightBulbIcon, majors: ['Business', 'Computer Science', 'Engineering'], growth: '10%', salary: '$125k' },
    { name: 'Marketing Director', description: 'Create innovative marketing campaigns', icon: LightBulbIcon, majors: ['Marketing', 'Business', 'Communications'], growth: '10%', salary: '$135k' },
    { name: 'Inventor/Innovator', description: 'Develop new technologies and solutions', icon: BeakerIcon, majors: ['Engineering', 'Computer Science'], growth: '8%', salary: '$95k+' },
  ],
  
  // Diplomats
  'INFJ': [
    { name: 'Clinical Psychologist', description: 'Help people overcome mental health challenges', icon: HeartIcon, majors: ['Psychology', 'Clinical Psychology'], growth: '6%', salary: '$82k' },
    { name: 'Writer/Author', description: 'Create meaningful content and stories', icon: PaintBrushIcon, majors: ['English', 'Creative Writing', 'Journalism'], growth: '4%', salary: '$67k' },
    { name: 'Counselor', description: 'Guide individuals through personal challenges', icon: HeartIcon, majors: ['Counseling', 'Psychology', 'Social Work'], growth: '10%', salary: '$48k' },
  ],
  'INFP': [
    { name: 'Creative Writer', description: 'Express ideas through creative storytelling', icon: PaintBrushIcon, majors: ['Creative Writing', 'English', 'Journalism'], growth: '4%', salary: '$67k' },
    { name: 'Graphic Designer', description: 'Create visual content that inspires', icon: PaintBrushIcon, majors: ['Graphic Design', 'Visual Arts'], growth: '3%', salary: '$53k' },
    { name: 'Social Worker', description: 'Support individuals and communities', icon: HeartIcon, majors: ['Social Work', 'Psychology', 'Sociology'], growth: '9%', salary: '$51k' },
  ],
  'ENFJ': [
    { name: 'School Counselor', description: 'Guide students through academic and personal challenges', icon: HeartIcon, majors: ['Psychology', 'Counseling', 'Education'], growth: '10%', salary: '$60k' },
    { name: 'Human Resources Manager', description: 'Develop talent and foster positive work culture', icon: UsersIcon, majors: ['Human Resources', 'Business', 'Psychology'], growth: '7%', salary: '$126k' },
    { name: 'Teacher', description: 'Inspire and educate the next generation', icon: AcademicCapIcon, majors: ['Education', 'Subject-Specific Education'], growth: '4%', salary: '$61k' },
  ],
  'ENFP': [
    { name: 'Marketing Manager', description: 'Create engaging campaigns and brand stories', icon: LightBulbIcon, majors: ['Marketing', 'Communications', 'Business'], growth: '10%', salary: '$135k' },
    { name: 'Public Relations Specialist', description: 'Build and maintain positive public image', icon: UsersIcon, majors: ['Public Relations', 'Communications'], growth: '6%', salary: '$62k' },
    { name: 'Journalist', description: 'Tell important stories and inform the public', icon: PaintBrushIcon, majors: ['Journalism', 'Communications', 'English'], growth: '-3%', salary: '$49k' },
  ],
  
  // Sentinels
  'ISTJ': [
    { name: 'Accountant', description: 'Ensure financial accuracy and compliance', icon: ChartBarIcon, majors: ['Accounting', 'Finance'], growth: '4%', salary: '$77k' },
    { name: 'Financial Analyst', description: 'Analyze financial data to guide decisions', icon: ChartBarIcon, majors: ['Finance', 'Economics', 'Accounting'], growth: '8%', salary: '$83k' },
    { name: 'Auditor', description: 'Examine financial records for accuracy', icon: BriefcaseIcon, majors: ['Accounting', 'Finance'], growth: '6%', salary: '$77k' },
  ],
  'ISFJ': [
    { name: 'Nurse', description: 'Provide compassionate patient care', icon: HeartIcon, majors: ['Nursing', 'Healthcare'], growth: '6%', salary: '$77k' },
    { name: 'Elementary Teacher', description: 'Nurture young minds and build foundations', icon: AcademicCapIcon, majors: ['Elementary Education', 'Education'], growth: '4%', salary: '$61k' },
    { name: 'Healthcare Administrator', description: 'Manage healthcare facilities and operations', icon: BriefcaseIcon, majors: ['Healthcare Administration', 'Business'], growth: '28%', salary: '$101k' },
  ],
  'ESTJ': [
    { name: 'Operations Manager', description: 'Optimize business operations and efficiency', icon: BriefcaseIcon, majors: ['Business', 'Operations Management'], growth: '6%', salary: '$104k' },
    { name: 'Project Manager', description: 'Lead teams to deliver successful projects', icon: UsersIcon, majors: ['Business', 'Project Management', 'Engineering'], growth: '6%', salary: '$94k' },
    { name: 'Sales Manager', description: 'Drive revenue through effective sales strategies', icon: ChartBarIcon, majors: ['Business', 'Marketing', 'Sales'], growth: '4%', salary: '$127k' },
  ],
  'ESFJ': [
    { name: 'Event Planner', description: 'Create memorable experiences and events', icon: UsersIcon, majors: ['Hospitality', 'Event Management', 'Business'], growth: '8%', salary: '$51k' },
    { name: 'Office Manager', description: 'Keep workplace organized and running smoothly', icon: BriefcaseIcon, majors: ['Business Administration', 'Management'], growth: '3%', salary: '$55k' },
    { name: 'Customer Service Manager', description: 'Ensure excellent customer experiences', icon: HeartIcon, majors: ['Business', 'Communications'], growth: '4%', salary: '$56k' },
  ],
  
  // Explorers
  'ISTP': [
    { name: 'Mechanical Engineer', description: 'Design and build mechanical systems', icon: BeakerIcon, majors: ['Mechanical Engineering', 'Engineering'], growth: '10%', salary: '$95k' },
    { name: 'Computer Systems Analyst', description: 'Solve technical problems and optimize systems', icon: BeakerIcon, majors: ['Computer Science', 'Information Technology'], growth: '9%', salary: '$99k' },
    { name: 'Forensic Scientist', description: 'Apply science to solve crimes', icon: BeakerIcon, majors: ['Forensic Science', 'Chemistry', 'Biology'], growth: '13%', salary: '$64k' },
  ],
  'ISFP': [
    { name: 'Interior Designer', description: 'Create beautiful and functional spaces', icon: PaintBrushIcon, majors: ['Interior Design', 'Architecture'], growth: '1%', salary: '$58k' },
    { name: 'Photographer', description: 'Capture meaningful moments through visual art', icon: PaintBrushIcon, majors: ['Photography', 'Visual Arts'], growth: '4%', salary: '$38k' },
    { name: 'Chef', description: 'Create culinary experiences that delight', icon: HeartIcon, majors: ['Culinary Arts', 'Hospitality'], growth: '15%', salary: '$53k' },
  ],
  'ESTP': [
    { name: 'Sales Representative', description: 'Build relationships and close deals', icon: BriefcaseIcon, majors: ['Business', 'Marketing', 'Sales'], growth: '4%', salary: '$62k' },
    { name: 'Paramedic', description: 'Provide emergency medical care', icon: HeartIcon, majors: ['Emergency Medical Services', 'Paramedicine'], growth: '6%', salary: '$36k' },
    { name: 'Real Estate Agent', description: 'Help people find their perfect property', icon: BriefcaseIcon, majors: ['Business', 'Real Estate'], growth: '5%', salary: '$49k' },
  ],
  'ESFP': [
    { name: 'Entertainment Manager', description: 'Create engaging entertainment experiences', icon: UsersIcon, majors: ['Entertainment Management', 'Business'], growth: '8%', salary: '$75k' },
    { name: 'Recreation Director', description: 'Organize activities that bring joy to others', icon: HeartIcon, majors: ['Recreation Management', 'Parks Management'], growth: '8%', salary: '$48k' },
    { name: 'Flight Attendant', description: 'Ensure passenger safety and comfort', icon: UsersIcon, majors: ['Hospitality', 'Tourism'], growth: '21%', salary: '$61k' },
  ],
};

const PERSONALITY_DESCRIPTIONS: Record<string, { title: string; description: string; category: string }> = {
  // Analysts
  'INTJ': { category: 'The Analyst', title: 'Strategic Thinker', description: 'You are imaginative and strategic, with a plan for everything. You excel at analyzing complex systems and developing innovative solutions.' },
  'INTP': { category: 'The Analyst', title: 'Logical Innovator', description: 'You are innovative and curious, with an endless thirst for knowledge. You love exploring theoretical concepts and solving complex problems.' },
  'ENTJ': { category: 'The Analyst', title: 'Bold Leader', description: 'You are bold, imaginative, and strong-willed. You excel at organizing people and resources to achieve ambitious goals.' },
  'ENTP': { category: 'The Analyst', title: 'Creative Debater', description: 'You are smart and curious, always ready to challenge the status quo. You thrive on intellectual debates and innovative problem-solving.' },
  
  // Diplomats
  'INFJ': { category: 'The Diplomat', title: 'Insightful Counselor', description: 'You are quiet and mystical, yet very inspiring and idealistic. You seek deep meaning and are driven to help others reach their potential.' },
  'INFP': { category: 'The Diplomat', title: 'Poetic Idealist', description: 'You are poetic, kind, and altruistic, always eager to help a good cause. You value authenticity and seek to make the world a better place.' },
  'ENFJ': { category: 'The Diplomat', title: 'Charismatic Teacher', description: 'You are charismatic and inspiring, able to mesmerize your listeners. You are passionate about helping others and creating positive change.' },
  'ENFP': { category: 'The Diplomat', title: 'Enthusiastic Campaigner', description: 'You are enthusiastic, creative, and sociable. You approach life with excitement and see possibilities everywhere you look.' },
  
  // Sentinels
  'ISTJ': { category: 'The Sentinel', title: 'Practical Logistician', description: 'You are practical and fact-minded, with reliability that cannot be doubted. You value traditions and take pride in your integrity.' },
  'ISFJ': { category: 'The Sentinel', title: 'Dedicated Defender', description: 'You are very dedicated and warm, always ready to protect your loved ones. You are reliable and detail-oriented with a strong sense of duty.' },
  'ESTJ': { category: 'The Sentinel', title: 'Efficient Organizer', description: 'You are excellent at managing things and people. You value order, structure, and tradition, and you get things done efficiently.' },
  'ESFJ': { category: 'The Sentinel', title: 'Caring Provider', description: 'You are extraordinarily caring, social, and popular. You are eager to help others and create harmony in your environment.' },
  
  // Explorers
  'ISTP': { category: 'The Explorer', title: 'Bold Craftsman', description: 'You are bold and practical, a master of all kinds of tools. You enjoy hands-on work and troubleshooting complex problems.' },
  'ISFP': { category: 'The Explorer', title: 'Artistic Adventurer', description: 'You are flexible and charming, always ready to explore and experience something new. You have a strong aesthetic sense and value authenticity.' },
  'ESTP': { category: 'The Explorer', title: 'Energetic Entrepreneur', description: 'You are smart, energetic, and perceptive. You enjoy living on the edge and are always ready for action and new experiences.' },
  'ESFP': { category: 'The Explorer', title: 'Spontaneous Entertainer', description: 'You are spontaneous, energetic, and enthusiastic. You love being the center of attention and bringing joy to others.' },
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
    // Calculate scores for each dimension
    const scores = { EI: 0, SN: 0, TF: 0, JP: 0 };
    const dimensionCounts = { EI: 0, SN: 0, TF: 0, JP: 0 };
    
    QUESTIONS.forEach(q => {
      const answer = finalAnswers[q.id] || 3; // Default to neutral if not answered
      const score = q.direction === 'positive' ? answer : (6 - answer);
      scores[q.dimension] += score;
      dimensionCounts[q.dimension]++;
    });
    
    // Calculate average score for each dimension (out of 5)
    const avgScores = {
      EI: scores.EI / dimensionCounts.EI,
      SN: scores.SN / dimensionCounts.SN,
      TF: scores.TF / dimensionCounts.TF,
      JP: scores.JP / dimensionCounts.JP,
    };
    
    // Determine personality type based on whether average is above or below neutral (3.0)
    // Scores > 3 lean toward first letter, scores < 3 lean toward second letter
    const type = 
      (avgScores.EI > 3.0 ? 'E' : 'I') +
      (avgScores.SN > 3.0 ? 'N' : 'S') +
      (avgScores.TF > 3.0 ? 'F' : 'T') +
      (avgScores.JP > 3.0 ? 'P' : 'J');
    
    setPersonalityType(type);
    setCareers(CAREER_MAPPINGS[type] || CAREER_MAPPINGS['ISTJ']); // Default to ISTJ if type not found
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
  const personalityInfo = PERSONALITY_DESCRIPTIONS[personalityType] || PERSONALITY_DESCRIPTIONS['ISTJ'];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
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

        {/* Personality Type Description */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 mb-8 max-w-3xl mx-auto text-white">
          <div className="text-sm font-semibold uppercase tracking-wide mb-2 opacity-90">{personalityInfo.category}</div>
          <h2 className="text-3xl font-bold mb-3">{personalityInfo.title}</h2>
          <p className="text-lg leading-relaxed opacity-95">{personalityInfo.description}</p>
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
