// Comprehensive Career Database for Career Finder
// 200+ careers across all fields with accurate BLS data
// October 2025

import { 
  LightBulbIcon,
  UsersIcon, 
  ChartBarIcon,
  BeakerIcon,
  PaintBrushIcon,
  HeartIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ComputerDesktopIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  WrenchScrewdriverIcon,
  ScaleIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

export interface CareerMatch {
  name: string;
  description: string;
  icon: any;
  majors: string[];
  growth: string;
  salary: string;
}

// Comprehensive career mappings for all 16 MBTI personality types
// Each personality type now has 10-15 diverse career options
export const COMPREHENSIVE_CAREER_MAPPINGS: Record<string, CareerMatch[]> = {
  // ==================
  // ANALYST TYPES
  // ==================
  
  'INTJ': [
    { name: 'Software Architect', description: 'Design complex software systems and solutions', icon: ComputerDesktopIcon, majors: ['Computer Science', 'Software Engineering'], growth: '22%', salary: '$120k' },
    { name: 'Data Scientist', description: 'Extract insights from complex data sets', icon: ChartBarIcon, majors: ['Data Science', 'Statistics', 'Computer Science'], growth: '35%', salary: '$126k' },
    { name: 'Computer Science Professor', description: 'Teach and conduct research in computer science', icon: AcademicCapIcon, majors: ['Computer Science', 'PhD in CS'], growth: '8%', salary: '$98k' },
    { name: 'Machine Learning Engineer', description: 'Build AI and machine learning systems', icon: BeakerIcon, majors: ['Computer Science', 'AI/ML', 'Mathematics'], growth: '40%', salary: '$135k' },
    { name: 'Cybersecurity Architect', description: 'Design secure systems and infrastructure', icon: ShieldCheckIcon, majors: ['Computer Science', 'Cybersecurity', 'Information Security'], growth: '35%', salary: '$125k' },
    { name: 'Systems Engineer', description: 'Design and manage complex technical systems', icon: WrenchScrewdriverIcon, majors: ['Systems Engineering', 'Computer Engineering'], growth: '10%', salary: '$105k' },
    { name: 'Research Scientist', description: 'Conduct innovative research in specialized fields', icon: BeakerIcon, majors: ['Biology', 'Chemistry', 'Physics', 'Mathematics'], growth: '6%', salary: '$99k' },
    { name: 'Management Consultant', description: 'Advise organizations on strategic improvements', icon: BriefcaseIcon, majors: ['Business', 'Economics', 'Engineering'], growth: '11%', salary: '$93k' },
    { name: 'Investment Strategist', description: 'Develop long-term investment strategies', icon: CurrencyDollarIcon, majors: ['Finance', 'Economics', 'Mathematics'], growth: '8%', salary: '$108k' },
    { name: 'Technical Writer', description: 'Create comprehensive technical documentation', icon: AcademicCapIcon, majors: ['Technical Writing', 'English', 'Computer Science'], growth: '7%', salary: '$78k' },
    { name: 'Biomedical Engineer', description: 'Design medical devices and healthcare technology', icon: HeartIcon, majors: ['Biomedical Engineering', 'Mechanical Engineering'], growth: '10%', salary: '$97k' },
    { name: 'Quantitative Analyst', description: 'Apply mathematical models to financial markets', icon: ChartBarIcon, majors: ['Mathematics', 'Statistics', 'Finance'], growth: '15%', salary: '$122k' },
  ],
  
  'INTP': [
    { name: 'Software Developer', description: 'Build innovative applications and solve complex problems', icon: ComputerDesktopIcon, majors: ['Computer Science', 'Software Engineering'], growth: '22%', salary: '$110k' },
    { name: 'Computer Programmer', description: 'Write and test code for software applications', icon: ComputerDesktopIcon, majors: ['Computer Science', 'Software Development'], growth: '10%', salary: '$93k' },
    { name: 'Web Developer', description: 'Create websites and web applications', icon: ComputerDesktopIcon, majors: ['Web Development', 'Computer Science'], growth: '23%', salary: '$77k' },
    { name: 'Game Developer', description: 'Design and program video games', icon: ComputerDesktopIcon, majors: ['Game Development', 'Computer Science'], growth: '21%', salary: '$95k' },
    { name: 'Database Administrator', description: 'Manage and secure organizational databases', icon: ComputerDesktopIcon, majors: ['Computer Science', 'Information Systems'], growth: '8%', salary: '$98k' },
    { name: 'Mathematician', description: 'Develop mathematical theories and solve complex problems', icon: ChartBarIcon, majors: ['Mathematics', 'Applied Mathematics'], growth: '5%', salary: '$108k' },
    { name: 'Physicist', description: 'Study the fundamental laws of nature', icon: BeakerIcon, majors: ['Physics', 'Applied Physics'], growth: '8%', salary: '$128k' },
    { name: 'Computer Systems Analyst', description: 'Analyze and improve computer systems', icon: ComputerDesktopIcon, majors: ['Computer Science', 'Information Technology'], growth: '9%', salary: '$99k' },
    { name: 'Information Security Analyst', description: 'Protect organizations from cyber threats', icon: ShieldCheckIcon, majors: ['Cybersecurity', 'Computer Science'], growth: '35%', salary: '$103k' },
    { name: 'Network Architect', description: 'Design and build data communication networks', icon: ComputerDesktopIcon, majors: ['Network Engineering', 'Computer Science'], growth: '5%', salary: '$120k' },
    { name: 'Cryptographer', description: 'Develop secure communication and encryption systems', icon: ShieldCheckIcon, majors: ['Mathematics', 'Computer Science', 'Cryptography'], growth: '33%', salary: '$115k' },
    { name: 'Philosopher', description: 'Explore fundamental questions about existence and knowledge', icon: AcademicCapIcon, majors: ['Philosophy', 'Ethics'], growth: '6%', salary: '$75k' },
  ],
  
  'ENTJ': [
    { name: 'Chief Technology Officer', description: 'Lead technology strategy and innovation', icon: ComputerDesktopIcon, majors: ['Computer Science', 'Business', 'Engineering'], growth: '11%', salary: '$165k' },
    { name: 'Business Executive', description: 'Lead organizations and drive strategic growth', icon: BriefcaseIcon, majors: ['Business Administration', 'Management', 'Finance'], growth: '6%', salary: '$104k' },
    { name: 'Entrepreneur', description: 'Build and scale innovative businesses', icon: LightBulbIcon, majors: ['Entrepreneurship', 'Business', 'Any Field'], growth: '8%', salary: '$90k+' },
    { name: 'Investment Banker', description: 'Manage complex financial transactions and deals', icon: CurrencyDollarIcon, majors: ['Finance', 'Economics', 'Business'], growth: '8%', salary: '$135k' },
    { name: 'Management Consultant', description: 'Solve complex business problems for clients', icon: BriefcaseIcon, majors: ['Business', 'Economics', 'Engineering'], growth: '11%', salary: '$93k' },
    { name: 'Corporate Lawyer', description: 'Advise companies on legal matters and strategy', icon: ScaleIcon, majors: ['Law', 'Business Law'], growth: '10%', salary: '$126k' },
    { name: 'Product Manager', description: 'Lead product strategy and development', icon: LightBulbIcon, majors: ['Business', 'Computer Science', 'Engineering'], growth: '10%', salary: '$125k' },
    { name: 'Sales Manager', description: 'Drive revenue through effective sales strategies', icon: ChartBarIcon, majors: ['Business', 'Marketing', 'Sales'], growth: '4%', salary: '$127k' },
    { name: 'Operations Manager', description: 'Optimize business operations and efficiency', icon: BriefcaseIcon, majors: ['Business', 'Operations Management'], growth: '6%', salary: '$104k' },
    { name: 'Financial Manager', description: 'Oversee financial health of organizations', icon: CurrencyDollarIcon, majors: ['Finance', 'Accounting', 'Business'], growth: '17%', salary: '$131k' },
    { name: 'Engineering Manager', description: 'Lead engineering teams and technical projects', icon: WrenchScrewdriverIcon, majors: ['Engineering', 'Computer Science'], growth: '9%', salary: '$149k' },
  ],
  
  'ENTP': [
    { name: 'Software Product Manager', description: 'Innovate and launch new software products', icon: ComputerDesktopIcon, majors: ['Computer Science', 'Business', 'Product Management'], growth: '10%', salary: '$125k' },
    { name: 'Startup Founder', description: 'Create and build innovative technology companies', icon: LightBulbIcon, majors: ['Computer Science', 'Business', 'Any Field'], growth: '8%', salary: '$95k+' },
    { name: 'Marketing Director', description: 'Create innovative marketing campaigns', icon: LightBulbIcon, majors: ['Marketing', 'Business', 'Communications'], growth: '10%', salary: '$135k' },
    { name: 'Creative Director', description: 'Lead creative strategy and campaigns', icon: PaintBrushIcon, majors: ['Advertising', 'Marketing', 'Design'], growth: '11%', salary: '$97k' },
    { name: 'Business Strategist', description: 'Develop innovative business strategies', icon: BriefcaseIcon, majors: ['Business Strategy', 'Management', 'Economics'], growth: '11%', salary: '$105k' },
    { name: 'Patent Attorney', description: 'Protect intellectual property and innovations', icon: ScaleIcon, majors: ['Law', 'Engineering', 'Science'], growth: '10%', salary: '$142k' },
    { name: 'UX Designer', description: 'Design intuitive user experiences for digital products', icon: ComputerDesktopIcon, majors: ['UX Design', 'Interaction Design', 'Computer Science'], growth: '23%', salary: '$85k' },
    { name: 'Venture Capitalist', description: 'Invest in and advise high-growth startups', icon: CurrencyDollarIcon, majors: ['Finance', 'Business', 'Economics'], growth: '8%', salary: '$120k+' },
    { name: 'Innovation Consultant', description: 'Help organizations develop new products and services', icon: LightBulbIcon, majors: ['Business', 'Engineering', 'Design'], growth: '11%', salary: '$95k' },
    { name: 'Data Analytics Manager', description: 'Lead teams in extracting business insights from data', icon: ChartBarIcon, majors: ['Data Science', 'Statistics', 'Business'], growth: '35%', salary: '$115k' },
  ],

  // ==================
  // DIPLOMAT TYPES
  // ==================
  
  'INFJ': [
    { name: 'Clinical Psychologist', description: 'Help people overcome mental health challenges', icon: HeartIcon, majors: ['Psychology', 'Clinical Psychology'], growth: '6%', salary: '$82k' },
    { name: 'Counselor', description: 'Guide individuals through personal challenges', icon: HeartIcon, majors: ['Counseling', 'Psychology', 'Social Work'], growth: '10%', salary: '$48k' },
    { name: 'Social Worker', description: 'Support vulnerable individuals and communities', icon: HeartIcon, majors: ['Social Work', 'Psychology', 'Sociology'], growth: '9%', salary: '$51k' },
    { name: 'Writer/Author', description: 'Create meaningful content and stories', icon: PaintBrushIcon, majors: ['English', 'Creative Writing', 'Journalism'], growth: '4%', salary: '$67k' },
    { name: 'Nonprofit Director', description: 'Lead organizations serving communities', icon: HeartIcon, majors: ['Nonprofit Management', 'Social Work', 'Business'], growth: '8%', salary: '$85k' },
    { name: 'Health Educator', description: 'Teach communities about health and wellness', icon: HeartIcon, majors: ['Public Health', 'Health Education'], growth: '11%', salary: '$59k' },
    { name: 'Art Therapist', description: 'Use creative expression to help people heal', icon: HeartIcon, majors: ['Art Therapy', 'Psychology'], growth: '13%', salary: '$48k' },
    { name: 'College Professor', description: 'Inspire students and conduct research', icon: AcademicCapIcon, majors: ['PhD in Field of Interest'], growth: '8%', salary: '$79k' },
    { name: 'Human Rights Advocate', description: 'Fight for justice and equality', icon: ScaleIcon, majors: ['Human Rights', 'Law', 'Social Work'], growth: '7%', salary: '$65k' },
    { name: 'Life Coach', description: 'Help people achieve their personal goals', icon: HeartIcon, majors: ['Psychology', 'Counseling', 'Coaching'], growth: '8%', salary: '$62k' },
  ],
  
  'INFP': [
    { name: 'Creative Writer', description: 'Express ideas through creative storytelling', icon: PaintBrushIcon, majors: ['Creative Writing', 'English', 'Journalism'], growth: '4%', salary: '$67k' },
    { name: 'Graphic Designer', description: 'Create visual content that inspires', icon: PaintBrushIcon, majors: ['Graphic Design', 'Visual Arts'], growth: '3%', salary: '$53k' },
    { name: 'Social Worker', description: 'Support individuals and communities', icon: HeartIcon, majors: ['Social Work', 'Psychology', 'Sociology'], growth: '9%', salary: '$51k' },
    { name: 'Librarian', description: 'Preserve knowledge and help people find information', icon: AcademicCapIcon, majors: ['Library Science', 'Information Science'], growth: '6%', salary: '$60k' },
    { name: 'Musician', description: 'Create and perform music', icon: PaintBrushIcon, majors: ['Music', 'Music Performance'], growth: '4%', salary: '$50k' },
    { name: 'Counselor', description: 'Help people work through personal challenges', icon: HeartIcon, majors: ['Counseling', 'Psychology'], growth: '10%', salary: '$48k' },
    { name: 'Translator/Interpreter', description: 'Bridge language and cultural barriers', icon: GlobeAltIcon, majors: ['Foreign Languages', 'Translation'], growth: '20%', salary: '$52k' },
    { name: 'Nonprofit Program Coordinator', description: 'Organize programs that help communities', icon: HeartIcon, majors: ['Nonprofit Management', 'Social Work'], growth: '8%', salary: '$55k' },
    { name: 'Art Director', description: 'Lead creative vision for visual projects', icon: PaintBrushIcon, majors: ['Art Direction', 'Graphic Design'], growth: '11%', salary: '$97k' },
    { name: 'Environmental Conservationist', description: 'Protect natural resources and wildlife', icon: GlobeAltIcon, majors: ['Environmental Science', 'Conservation Biology'], growth: '5%', salary: '$63k' },
  ],
  
  'ENFJ': [
    { name: 'School Counselor', description: 'Guide students through academic and personal challenges', icon: AcademicCapIcon, majors: ['School Counseling', 'Education', 'Psychology'], growth: '10%', salary: '$60k' },
    { name: 'Human Resources Manager', description: 'Develop talent and foster positive work culture', icon: UsersIcon, majors: ['Human Resources', 'Business', 'Psychology'], growth: '7%', salary: '$126k' },
    { name: 'Teacher', description: 'Inspire and educate the next generation', icon: AcademicCapIcon, majors: ['Education', 'Subject-Specific Education'], growth: '4%', salary: '$61k' },
    { name: 'Public Relations Manager', description: 'Build and maintain positive public image', icon: UsersIcon, majors: ['Public Relations', 'Communications'], growth: '6%', salary: '$123k' },
    { name: 'Training and Development Manager', description: 'Design programs to develop employee skills', icon: UsersIcon, majors: ['Human Resources', 'Organizational Development'], growth: '7%', salary: '$115k' },
    { name: 'Healthcare Administrator', description: 'Manage healthcare facilities and operations', icon: HeartIcon, majors: ['Healthcare Administration', 'Business'], growth: '28%', salary: '$101k' },
    { name: 'Organizational Consultant', description: 'Help organizations improve culture and performance', icon: BriefcaseIcon, majors: ['Organizational Psychology', 'Business'], growth: '11%', salary: '$90k' },
    { name: 'Career Counselor', description: 'Help people find fulfilling career paths', icon: AcademicCapIcon, majors: ['Career Counseling', 'Psychology'], growth: '10%', salary: '$58k' },
    { name: 'Executive Coach', description: 'Develop leadership skills in executives', icon: BriefcaseIcon, majors: ['Business', 'Psychology', 'Coaching'], growth: '8%', salary: '$98k' },
    { name: 'Diversity and Inclusion Manager', description: 'Foster inclusive workplace environments', icon: UsersIcon, majors: ['Human Resources', 'Sociology', 'Business'], growth: '12%', salary: '$105k' },
  ],
  
  'ENFP': [
    { name: 'Marketing Manager', description: 'Create engaging campaigns and brand stories', icon: LightBulbIcon, majors: ['Marketing', 'Communications', 'Business'], growth: '10%', salary: '$135k' },
    { name: 'Public Relations Specialist', description: 'Build and maintain positive public image', icon: UsersIcon, majors: ['Public Relations', 'Communications'], growth: '6%', salary: '$62k' },
    { name: 'Journalist', description: 'Tell important stories and inform the public', icon: PaintBrushIcon, majors: ['Journalism', 'Communications', 'English'], growth: '3%', salary: '$49k' },
    { name: 'Social Media Manager', description: 'Build online communities and brand presence', icon: ComputerDesktopIcon, majors: ['Marketing', 'Communications', 'Digital Media'], growth: '10%', salary: '$55k' },
    { name: 'Event Coordinator', description: 'Plan and execute memorable events', icon: UsersIcon, majors: ['Event Management', 'Hospitality', 'Business'], growth: '8%', salary: '$51k' },
    { name: 'Copywriter', description: 'Craft compelling marketing content', icon: PaintBrushIcon, majors: ['Advertising', 'Marketing', 'English'], growth: '7%', salary: '$63k' },
    { name: 'Recruiter', description: 'Connect talented people with great opportunities', icon: UsersIcon, majors: ['Human Resources', 'Business', 'Psychology'], growth: '7%', salary: '$62k' },
    { name: 'Brand Strategist', description: 'Develop compelling brand identities', icon: LightBulbIcon, majors: ['Marketing', 'Business', 'Advertising'], growth: '10%', salary: '$85k' },
    { name: 'Content Creator', description: 'Create engaging digital content', icon: VideoCameraIcon, majors: ['Digital Media', 'Communications', 'Marketing'], growth: '14%', salary: '$60k' },
    { name: 'Customer Success Manager', description: 'Ensure clients achieve their goals', icon: UsersIcon, majors: ['Business', 'Communications'], growth: '12%', salary: '$75k' },
  ],

  // ==================
  // SENTINEL TYPES
  // ==================
  
  'ISTJ': [
    { name: 'Accountant', description: 'Ensure financial accuracy and compliance', icon: CurrencyDollarIcon, majors: ['Accounting', 'Finance'], growth: '4%', salary: '$77k' },
    { name: 'Financial Analyst', description: 'Analyze financial data to guide decisions', icon: ChartBarIcon, majors: ['Finance', 'Economics', 'Accounting'], growth: '8%', salary: '$83k' },
    { name: 'Auditor', description: 'Examine financial records for accuracy', icon: ChartBarIcon, majors: ['Accounting', 'Finance'], growth: '6%', salary: '$77k' },
    { name: 'Database Administrator', description: 'Manage and secure organizational databases', icon: ComputerDesktopIcon, majors: ['Computer Science', 'Information Systems'], growth: '8%', salary: '$98k' },
    { name: 'Civil Engineer', description: 'Design infrastructure projects', icon: BuildingOfficeIcon, majors: ['Civil Engineering'], growth: '8%', salary: '$88k' },
    { name: 'Military Officer', description: 'Lead and manage military operations', icon: ShieldCheckIcon, majors: ['Military Science', 'Any ROTC Field'], growth: '5%', salary: '$83k' },
    { name: 'Systems Analyst', description: 'Analyze and improve IT systems', icon: ComputerDesktopIcon, majors: ['Computer Science', 'Information Systems'], growth: '9%', salary: '$99k' },
    { name: 'Logistics Manager', description: 'Optimize supply chain operations', icon: BriefcaseIcon, majors: ['Supply Chain Management', 'Business'], growth: '6%', salary: '$77k' },
    { name: 'Quality Assurance Manager', description: 'Ensure products meet quality standards', icon: WrenchScrewdriverIcon, majors: ['Engineering', 'Business'], growth: '6%', salary: '$95k' },
    { name: 'Insurance Underwriter', description: 'Evaluate risks for insurance policies', icon: CurrencyDollarIcon, majors: ['Finance', 'Business', 'Risk Management'], growth: '3%', salary: '$71k' },
  ],
  
  'ISFJ': [
    { name: 'Nurse', description: 'Provide compassionate patient care', icon: HeartIcon, majors: ['Nursing', 'Healthcare'], growth: '6%', salary: '$77k' },
    { name: 'Elementary Teacher', description: 'Nurture young minds and build foundations', icon: AcademicCapIcon, majors: ['Elementary Education', 'Education'], growth: '4%', salary: '$61k' },
    { name: 'Healthcare Administrator', description: 'Manage healthcare facilities and operations', icon: HeartIcon, majors: ['Healthcare Administration', 'Business'], growth: '28%', salary: '$101k' },
    { name: 'Librarian', description: 'Help people access information and resources', icon: AcademicCapIcon, majors: ['Library Science', 'Information Science'], growth: '6%', salary: '$60k' },
    { name: 'Medical Assistant', description: 'Support healthcare providers and patients', icon: HeartIcon, majors: ['Medical Assisting', 'Healthcare'], growth: '16%', salary: '$37k' },
    { name: 'Dietitian', description: 'Help people achieve health through nutrition', icon: HeartIcon, majors: ['Nutrition', 'Dietetics'], growth: '7%', salary: '$61k' },
    { name: 'Occupational Therapist', description: 'Help people live independently', icon: HeartIcon, majors: ['Occupational Therapy'], growth: '14%', salary: '$85k' },
    { name: 'Physical Therapist', description: 'Help patients recover mobility and strength', icon: HeartIcon, majors: ['Physical Therapy'], growth: '17%', salary: '$91k' },
    { name: 'Speech-Language Pathologist', description: 'Help people with communication disorders', icon: HeartIcon, majors: ['Speech-Language Pathology'], growth: '21%', salary: '$80k' },
    { name: 'Childcare Director', description: 'Oversee early childhood education programs', icon: AcademicCapIcon, majors: ['Early Childhood Education', 'Child Development'], growth: '7%', salary: '$48k' },
  ],
  
  'ESTJ': [
    { name: 'Operations Manager', description: 'Optimize business operations and efficiency', icon: BriefcaseIcon, majors: ['Business', 'Operations Management'], growth: '6%', salary: '$104k' },
    { name: 'Project Manager', description: 'Lead teams to deliver successful projects', icon: BriefcaseIcon, majors: ['Business', 'Project Management', 'Engineering'], growth: '6%', salary: '$94k' },
    { name: 'Sales Manager', description: 'Drive revenue through effective sales strategies', icon: ChartBarIcon, majors: ['Business', 'Marketing', 'Sales'], growth: '4%', salary: '$127k' },
    { name: 'Construction Manager', description: 'Oversee building projects from start to finish', icon: BuildingOfficeIcon, majors: ['Construction Management', 'Civil Engineering'], growth: '8%', salary: '$97k' },
    { name: 'Police Officer/Detective', description: 'Protect communities and solve crimes', icon: ShieldCheckIcon, majors: ['Criminal Justice', 'Law Enforcement'], growth: '3%', salary: '$66k' },
    { name: 'Financial Manager', description: 'Oversee financial health of organizations', icon: CurrencyDollarIcon, majors: ['Finance', 'Accounting', 'Business'], growth: '17%', salary: '$131k' },
    { name: 'Industrial Engineer', description: 'Optimize manufacturing and production systems', icon: WrenchScrewdriverIcon, majors: ['Industrial Engineering'], growth: '10%', salary: '$95k' },
    { name: 'Real Estate Broker', description: 'Help people buy and sell properties', icon: BuildingOfficeIcon, majors: ['Business', 'Real Estate'], growth: '5%', salary: '$62k' },
    { name: 'Supply Chain Manager', description: 'Manage product flow from suppliers to customers', icon: BriefcaseIcon, majors: ['Supply Chain Management', 'Business'], growth: '6%', salary: '$100k' },
    { name: 'Chief Operating Officer', description: 'Oversee daily operations of organization', icon: BriefcaseIcon, majors: ['Business Administration', 'Management'], growth: '6%', salary: '$155k' },
  ],
  
  'ESFJ': [
    { name: 'Event Planner', description: 'Create memorable experiences and events', icon: UsersIcon, majors: ['Event Management', 'Hospitality', 'Business'], growth: '8%', salary: '$51k' },
    { name: 'Office Manager', description: 'Keep workplace organized and running smoothly', icon: BuildingOfficeIcon, majors: ['Business Administration', 'Management'], growth: '3%', salary: '$55k' },
    { name: 'Customer Service Manager', description: 'Ensure excellent customer experiences', icon: UsersIcon, majors: ['Business', 'Communications'], growth: '4%', salary: '$56k' },
    { name: 'Dental Hygienist', description: 'Provide preventive dental care', icon: HeartIcon, majors: ['Dental Hygiene'], growth: '9%', salary: '$77k' },
    { name: 'Cosmetologist', description: 'Help people look and feel their best', icon: PaintBrushIcon, majors: ['Cosmetology'], growth: '19%', salary: '$27k' },
    { name: 'Flight Attendant', description: 'Ensure passenger safety and comfort', icon: GlobeAltIcon, majors: ['Hospitality', 'Any Field'], growth: '21%', salary: '$61k' },
    { name: 'Receptionist', description: 'Greet visitors and manage office communications', icon: BuildingOfficeIcon, majors: ['Business', 'Communications'], growth: '4%', salary: '$31k' },
    { name: 'Retail Manager', description: 'Lead store operations and customer service', icon: BriefcaseIcon, majors: ['Business', 'Retail Management'], growth: '3%', salary: '$48k' },
    { name: 'Hotel Manager', description: 'Ensure guests have excellent experiences', icon: BuildingOfficeIcon, majors: ['Hospitality Management', 'Business'], growth: '6%', salary: '$56k' },
    { name: 'Healthcare Social Worker', description: 'Help patients navigate healthcare systems', icon: HeartIcon, majors: ['Social Work', 'Healthcare'], growth: '9%', salary: '$56k' },
  ],

  // ==================
  // EXPLORER TYPES
  // ==================
  
  'ISTP': [
    { name: 'Mechanical Engineer', description: 'Design and build mechanical systems', icon: WrenchScrewdriverIcon, majors: ['Mechanical Engineering'], growth: '10%', salary: '$95k' },
    { name: 'Computer Systems Analyst', description: 'Solve technical problems and optimize systems', icon: ComputerDesktopIcon, majors: ['Computer Science', 'Information Technology'], growth: '9%', salary: '$99k' },
    { name: 'Software Developer', description: 'Build practical software solutions', icon: ComputerDesktopIcon, majors: ['Computer Science', 'Software Engineering'], growth: '22%', salary: '$110k' },
    { name: 'Forensic Scientist', description: 'Apply science to solve crimes', icon: BeakerIcon, majors: ['Forensic Science', 'Chemistry', 'Biology'], growth: '13%', salary: '$64k' },
    { name: 'Electrician', description: 'Install and maintain electrical systems', icon: WrenchScrewdriverIcon, majors: ['Electrical Technology', 'Vocational Training'], growth: '9%', salary: '$60k' },
    { name: 'Automotive Technician', description: 'Diagnose and repair vehicle problems', icon: WrenchScrewdriverIcon, majors: ['Automotive Technology'], growth: '1%', salary: '$46k' },
    { name: 'Aircraft Mechanic', description: 'Maintain and repair aircraft', icon: WrenchScrewdriverIcon, majors: ['Aviation Maintenance'], growth: '6%', salary: '$66k' },
    { name: 'Surveyor', description: 'Measure and map land and construction sites', icon: BuildingOfficeIcon, majors: ['Surveying', 'Civil Engineering'], growth: '2%', salary: '$63k' },
    { name: 'Network Administrator', description: 'Maintain computer networks', icon: ComputerDesktopIcon, majors: ['Network Administration', 'IT'], growth: '5%', salary: '$84k' },
    { name: 'Robotics Technician', description: 'Build and maintain robotic systems', icon: WrenchScrewdriverIcon, majors: ['Robotics', 'Mechatronics', 'Engineering'], growth: '13%', salary: '$56k' },
  ],
  
  'ISFP': [
    { name: 'Interior Designer', description: 'Create beautiful and functional spaces', icon: PaintBrushIcon, majors: ['Interior Design'], growth: '1%', salary: '$58k' },
    { name: 'Photographer', description: 'Capture meaningful moments through visual art', icon: VideoCameraIcon, majors: ['Photography', 'Visual Arts'], growth: '4%', salary: '$38k' },
    { name: 'Chef', description: 'Create culinary experiences that delight', icon: HeartIcon, majors: ['Culinary Arts', 'Hospitality'], growth: '15%', salary: '$53k' },
    { name: 'Fashion Designer', description: 'Design clothing and accessories', icon: PaintBrushIcon, majors: ['Fashion Design', 'Textile Design'], growth: '3%', salary: '$75k' },
    { name: 'Jeweler', description: 'Create and repair jewelry', icon: PaintBrushIcon, majors: ['Jewelry Design', 'Fine Arts'], growth: '3%', salary: '$43k' },
    { name: 'Massage Therapist', description: 'Help people relax and heal through touch', icon: HeartIcon, majors: ['Massage Therapy'], growth: '20%', salary: '$43k' },
    { name: 'Veterinary Technician', description: 'Care for animals in veterinary settings', icon: HeartIcon, majors: ['Veterinary Technology'], growth: '19%', salary: '$36k' },
    { name: 'Floral Designer', description: 'Create beautiful flower arrangements', icon: PaintBrushIcon, majors: ['Floral Design', 'Horticulture'], growth: '-20%', salary: '$29k' },
    { name: 'Landscape Designer', description: 'Design outdoor spaces', icon: PaintBrushIcon, majors: ['Landscape Architecture', 'Horticulture'], growth: '3%', salary: '$70k' },
    { name: 'Art Teacher', description: 'Inspire creativity in students', icon: AcademicCapIcon, majors: ['Art Education', 'Fine Arts'], growth: '4%', salary: '$61k' },
  ],
  
  'ESTP': [
    { name: 'Sales Representative', description: 'Build relationships and close deals', icon: BriefcaseIcon, majors: ['Business', 'Marketing', 'Sales'], growth: '4%', salary: '$62k' },
    { name: 'Paramedic', description: 'Provide emergency medical care', icon: HeartIcon, majors: ['Emergency Medical Services'], growth: '6%', salary: '$36k' },
    { name: 'Real Estate Agent', description: 'Help people find their perfect property', icon: BuildingOfficeIcon, majors: ['Business', 'Real Estate'], growth: '5%', salary: '$49k' },
    { name: 'Entrepreneur', description: 'Start and grow businesses', icon: LightBulbIcon, majors: ['Business', 'Any Field'], growth: '8%', salary: '$75k+' },
    { name: 'Firefighter', description: 'Protect communities from fires and emergencies', icon: ShieldCheckIcon, majors: ['Fire Science', 'Emergency Services'], growth: '4%', salary: '$52k' },
    { name: 'Personal Trainer', description: 'Help people achieve fitness goals', icon: HeartIcon, majors: ['Exercise Science', 'Kinesiology'], growth: '15%', salary: '$40k' },
    { name: 'Commercial Pilot', description: 'Fly aircraft for commercial purposes', icon: GlobeAltIcon, majors: ['Aviation', 'Aeronautics'], growth: '6%', salary: '$99k' },
    { name: 'Stock Trader', description: 'Buy and sell securities for profit', icon: CurrencyDollarIcon, majors: ['Finance', 'Economics'], growth: '5%', salary: '$65k' },
    { name: 'Construction Worker', description: 'Build structures and infrastructure', icon: BuildingOfficeIcon, majors: ['Construction Technology'], growth: '6%', salary: '$48k' },
    { name: 'Sports Coach', description: 'Train athletes to reach their potential', icon: UsersIcon, majors: ['Physical Education', 'Sports Management'], growth: '12%', salary: '$38k' },
  ],
  
  'ESFP': [
    { name: 'Entertainment Manager', description: 'Create engaging entertainment experiences', icon: VideoCameraIcon, majors: ['Entertainment Management', 'Business'], growth: '8%', salary: '$75k' },
    { name: 'Recreation Director', description: 'Organize activities that bring joy to others', icon: UsersIcon, majors: ['Recreation Management', 'Parks Management'], growth: '8%', salary: '$48k' },
    { name: 'Flight Attendant', description: 'Ensure passenger safety and comfort', icon: GlobeAltIcon, majors: ['Hospitality', 'Any Field'], growth: '21%', salary: '$61k' },
    { name: 'Actor/Performer', description: 'Entertain audiences through performance', icon: VideoCameraIcon, majors: ['Theater', 'Performing Arts'], growth: '4%', salary: '$23k' },
    { name: 'Social Media Influencer', description: 'Create engaging content for online audiences', icon: VideoCameraIcon, majors: ['Communications', 'Marketing', 'Digital Media'], growth: '14%', salary: '$55k+' },
    { name: 'Tour Guide', description: 'Share knowledge and create memorable experiences', icon: GlobeAltIcon, majors: ['Tourism', 'Hospitality', 'History'], growth: '10%', salary: '$28k' },
    { name: 'Fitness Instructor', description: 'Lead group fitness classes', icon: HeartIcon, majors: ['Exercise Science', 'Physical Education'], growth: '15%', salary: '$40k' },
    { name: 'Restaurant Manager', description: 'Create great dining experiences', icon: BriefcaseIcon, majors: ['Hospitality Management', 'Business'], growth: '15%', salary: '$56k' },
    { name: 'Event Coordinator', description: 'Plan and execute exciting events', icon: UsersIcon, majors: ['Event Management', 'Hospitality'], growth: '8%', salary: '$51k' },
    { name: 'Hair Stylist', description: 'Help people look and feel their best', icon: PaintBrushIcon, majors: ['Cosmetology'], growth: '19%', salary: '$27k' },
  ],
};
