'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
import { COMPREHENSIVE_CAREER_MAPPINGS, type CareerMatch } from '@/data/career-database';
import { PERSONALITY_DESCRIPTIONS } from '@/data/personality-descriptions';

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

export default function CareerFinderPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState<'intro' | 'quiz' | 'results'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [personalityType, setPersonalityType] = useState('ISTJ');
  const [careers, setCareers] = useState<CareerMatch[]>([]);
  const [email, setEmail] = useState('');
  const [showAllCareers, setShowAllCareers] = useState(false);

  // Helper to get user-specific storage key
  const getStorageKey = () => {
    const userEmail = session?.user?.email || 'guest';
    return `careerFinderResults_${userEmail}`;
  };

  // Load saved results from sessionStorage on mount
  useEffect(() => {
    const storageKey = getStorageKey();
    const savedResults = sessionStorage.getItem(storageKey);
    if (savedResults) {
      try {
        const { personalityType: savedType, careerNames, answers: savedAnswers } = JSON.parse(savedResults);
        
        // Reconstruct careers with icons from the database
        const fullCareerData = COMPREHENSIVE_CAREER_MAPPINGS[savedType] || COMPREHENSIVE_CAREER_MAPPINGS['ISTJ'];
        const reconstructedCareers = fullCareerData.filter(career => 
          careerNames.includes(career.name)
        );
        
        setPersonalityType(savedType);
        setCareers(reconstructedCareers);
        setAnswers(savedAnswers);
        setStep('results');
      } catch (e) {
        console.error('Error loading saved career finder results:', e);
        sessionStorage.removeItem(storageKey); // Clear corrupted data
      }
    }
  }, [session?.user?.email]);

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
    
    const matchedCareers = COMPREHENSIVE_CAREER_MAPPINGS[type] || COMPREHENSIVE_CAREER_MAPPINGS['ISTJ'];
    
    setPersonalityType(type);
    setCareers(matchedCareers);
    setStep('results');
    
    // Save results to sessionStorage (without icons, which can't be serialized)
    // Use user-specific key to prevent cross-user caching
    const storageKey = getStorageKey();
    sessionStorage.setItem(storageKey, JSON.stringify({
      personalityType: type,
      careerNames: matchedCareers.map(c => c.name), // Store only names, not full objects
      answers: finalAnswers
    }));
  };

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-black py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500/20 border border-orange-500 rounded-full mb-6">
              <LightBulbIcon className="w-10 h-10 text-orange-500" />
            </div>
            <h1 className="text-5xl font-extrabold text-white mb-4">
              Career Finder
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-medium">
              Discover careers that match your personality and interests. Take our quick assessment to find your ideal path.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-[0_0_15px_rgba(249,115,22,0.1)] p-8 md:p-12 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">What You'll Discover:</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-orange-500/20 border border-orange-500 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BriefcaseIcon className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Career Matches</h3>
                  <p className="text-sm text-gray-300 font-medium">Careers aligned with your personality and strengths</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-orange-500/20 border border-orange-500 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AcademicCapIcon className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">College Majors</h3>
                  <p className="text-sm text-gray-300 font-medium">Recommended majors for your career path</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-500/20 border border-green-500 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ChartBarIcon className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Salary Insights</h3>
                  <p className="text-sm text-gray-300 font-medium">Expected earnings and job growth data</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-pink-500/20 border border-pink-500 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HeartIcon className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Personality Profile</h3>
                  <p className="text-sm text-gray-300 font-medium">Understand your unique strengths and preferences</p>
                </div>
              </div>
            </div>

            <div className="bg-black border border-gray-800 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-300 font-medium">
                Takes just 5 minutes • Based on personality psychology • Personalized results
              </p>
            </div>

            <button
              onClick={() => setStep('quiz')}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-4 rounded-lg font-bold text-lg hover:from-orange-700 hover:to-orange-600 transition-all shadow-[0_0_12px_rgba(249,115,22,0.08)] shadow-orange-500/20"
            >
              Start Assessment
            </button>
          </div>

          <div className="text-center text-sm text-gray-400">
            <p className="font-medium">This assessment is based on personality psychology and career research</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'quiz') {
    const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
    
    return (
      <div className="min-h-screen bg-black py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-gray-300">
                Question {currentQuestion + 1} of {QUESTIONS.length}
              </span>
              <span className="text-sm font-bold text-orange-500">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-600 to-orange-500 h-2 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(249,115,22,0.08)] shadow-orange-500/30"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-[0_0_15px_rgba(249,115,22,0.1)] p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
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
                  className="w-full p-4 border-2 border-gray-700 bg-black rounded-lg hover:border-orange-500 hover:bg-gray-800 transition-all text-left font-semibold text-gray-300 hover:text-orange-500"
                >
                  {option.label}
                </button>
              ))}
            </div>

            {currentQuestion > 0 && (
              <button
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="mt-6 text-orange-500 hover:text-orange-400 font-bold"
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
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/20 border border-green-500 rounded-full mb-6">
            <LightBulbIcon className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4">
            Your Career Matches
          </h1>
          <p className="text-lg text-gray-300 font-medium">
            Based on your personality type: <span className="font-bold text-orange-500">{personalityType}</span>
          </p>
        </div>

        {/* Personality Type Description */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl shadow-[0_0_12px_rgba(249,115,22,0.08)] shadow-orange-500/20 p-8 mb-8 max-w-3xl mx-auto text-white border border-orange-500/30">
          <div className="text-sm font-bold uppercase tracking-wide mb-2 opacity-90">{personalityInfo.category}</div>
          <h2 className="text-3xl font-extrabold mb-3">{personalityInfo.title}</h2>
          <p className="text-lg leading-relaxed opacity-95 font-medium">{personalityInfo.description}</p>
        </div>

        {/* Email Capture */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_12px_rgba(249,115,22,0.08)] p-6 mb-8 max-w-2xl mx-auto">
          <h3 className="font-bold text-white mb-3">Get Your Full Results via Email</h3>
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 bg-black border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-500"
            />
            <button 
              onClick={() => alert('Results sent!')}
              className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-2 rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all font-bold shadow-[0_0_12px_rgba(249,115,22,0.08)] shadow-orange-500/20"
            >
              Send Results
            </button>
          </div>
        </div>

        {/* Career Matches */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-extrabold text-white">
              Your Top Career Matches ({careers.length} total)
            </h2>
            {careers.length > 6 && (
              <button
                onClick={() => setShowAllCareers(!showAllCareers)}
                className="text-orange-500 hover:text-orange-400 font-bold"
              >
                {showAllCareers ? 'Show Less ↑' : `Show All ${careers.length} Careers ↓`}
              </button>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {(showAllCareers ? careers : careers.slice(0, 6)).map((career, index) => {
              const IconComponent = career.icon;
              return (
              <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_12px_rgba(249,115,22,0.08)] p-8 hover:shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:shadow-orange-500/10 hover:border-orange-500/50 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-orange-500/20 border border-orange-500 w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-7 h-7 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-extrabold text-white mb-1">{career.name}</h3>
                    <p className="text-gray-300 font-medium">{career.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg">
                    <p className="text-xs text-green-500 font-bold mb-1">AVG SALARY</p>
                    <p className="text-lg font-extrabold text-green-400">{career.salary}</p>
                  </div>
                  <div className="bg-orange-500/100/10 border border-orange-500/30 p-3 rounded-lg">
                    <p className="text-xs text-orange-500 font-bold mb-1">JOB GROWTH</p>
                    <p className="text-lg font-extrabold text-orange-400">{career.growth}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-300 mb-2">Recommended Majors:</p>
                  <div className="flex flex-wrap gap-2">
                    {career.majors.map((major, idx) => (
                      <span key={idx} className="px-3 py-1 bg-orange-500/20 border border-orange-500/50 text-orange-400 rounded-full text-sm font-semibold">
                        {major}
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => router.push(`/recommendations?career=${encodeURIComponent(career.name)}&majors=${encodeURIComponent(career.majors.join(','))}`)}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-3 rounded-lg font-bold hover:from-orange-700 hover:to-orange-600 transition-all shadow-[0_0_12px_rgba(249,115,22,0.08)] shadow-orange-500/20"
                >
                  Explore Programs
                </button>
              </div>
              );
            })}
          </div>
          
          {!showAllCareers && careers.length > 6 && (
            <div className="text-center">
              <button
                onClick={() => setShowAllCareers(true)}
                className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500 text-orange-400 px-6 py-3 rounded-lg font-bold hover:bg-orange-500/30 transition-all"
              >
                View All {careers.length} Career Options
              </button>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-[0_0_12px_rgba(249,115,22,0.08)] p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white font-bold mb-6">Next Steps on Your Journey</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-orange-600">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-white font-bold">Explore College Programs</h4>
                <p className="text-sm text-gray-300">Search for colleges offering your recommended majors</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-orange-600">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-white font-bold">Calculate Your ROI</h4>
                <p className="text-sm text-gray-300">See the financial return on your education investment</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-orange-600">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-white font-bold">Find Scholarships</h4>
                <p className="text-sm text-gray-300">Discover funding opportunities for your chosen field</p>
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
            className="text-orange-600 hover:text-orange-700 font-semibold"
          >
            ← Take Assessment Again
          </button>
        </div>
      </div>
    </div>
  );
}
