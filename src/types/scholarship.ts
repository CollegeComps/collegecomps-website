// Scholarship data types
export interface ScholarshipLead {
  id?: number;
  full_name: string;
  email: string;
  phone: string;
  gpa: number;
  desired_major: string;
  state: string;
  created_at?: string;
}

export interface Scholarship {
  id: number;
  name: string;
  provider: string;
  amount_min: number;
  amount_max: number;
  gpa_requirement: number;
  major_categories: string[]; // e.g., ['STEM', 'Engineering']
  eligible_states: string[]; // e.g., ['CA', 'NY', 'ALL']
  deadline: string;
  website_url: string;
  description: string;
}

export interface ScholarshipMatch {
  scholarship: Scholarship;
  match_score: number; // 0-100, how well the student matches
  match_reasons: string[];
}
