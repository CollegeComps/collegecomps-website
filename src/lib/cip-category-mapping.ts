/**
 * CIP Code (Classification of Instructional Programs) to Major Category Mapping
 * 
 * CIP codes are 2-6 digit codes where the first 2 digits represent the broad category.
 * This utility maps CIP codes to high-level major categories for filtering.
 * 
 * Reference: https://nces.ed.gov/ipeds/cipcode/
 */

export type MajorCategory = 
  | 'STEM'
  | 'Humanities'
  | 'Social Sciences'
  | 'Arts'
  | 'Business'
  | 'Health'
  | 'Education'
  | 'Other';

/**
 * Mapping of CIP code prefixes (first 2 digits) to major categories
 */
const CIP_TO_CATEGORY: Record<string, MajorCategory> = {
  // STEM (Science, Technology, Engineering, Mathematics)
  '01': 'STEM', // Agriculture, Agriculture Operations, and Related Sciences
  '03': 'STEM', // Natural Resources and Conservation
  '11': 'STEM', // Computer and Information Sciences
  '14': 'STEM', // Engineering
  '15': 'STEM', // Engineering Technologies
  '26': 'STEM', // Biological and Biomedical Sciences
  '27': 'STEM', // Mathematics and Statistics
  '40': 'STEM', // Physical Sciences
  '41': 'STEM', // Science Technologies/Technicians
  
  // Business
  '52': 'Business', // Business, Management, Marketing, and Related Support Services
  
  // Health
  '51': 'Health', // Health Professions and Related Programs
  '60': 'Health', // Residency Programs (Medical)
  '61': 'Health', // Medical Residency/Fellowship Programs
  
  // Education
  '13': 'Education', // Education
  
  // Humanities
  '05': 'Humanities', // Area, Ethnic, Cultural, Gender, and Group Studies
  '16': 'Humanities', // Foreign Languages, Literatures, and Linguistics
  '23': 'Humanities', // English Language and Literature/Letters
  '24': 'Humanities', // Liberal Arts and Sciences, General Studies and Humanities
  '38': 'Humanities', // Philosophy and Religious Studies
  '39': 'Humanities', // Theology and Religious Vocations
  '54': 'Humanities', // History
  
  // Social Sciences
  '09': 'Social Sciences', // Communication, Journalism, and Related Programs
  '19': 'Social Sciences', // Family and Consumer Sciences/Human Sciences
  '22': 'Social Sciences', // Legal Professions and Studies
  '30': 'Social Sciences', // Multi/Interdisciplinary Studies
  '42': 'Social Sciences', // Psychology
  '43': 'Social Sciences', // Homeland Security, Law Enforcement, Firefighting
  '44': 'Social Sciences', // Public Administration and Social Service Professions
  '45': 'Social Sciences', // Social Sciences
  
  // Arts
  '04': 'Arts', // Architecture and Related Services
  '10': 'Arts', // Communications Technologies/Technicians and Support Services
  '50': 'Arts', // Visual and Performing Arts
  
  // Other/Vocational
  '12': 'Other', // Personal and Culinary Services
  '28': 'Other', // Military Technologies and Applied Sciences
  '29': 'Other', // Military Science, Leadership and Operational Art
  '31': 'Other', // Parks, Recreation, Leisure, and Fitness Studies
  '32': 'Other', // Basic Skills and Developmental/Remedial Education
  '33': 'Other', // Citizenship Activities
  '34': 'Other', // Health-Related Knowledge and Skills
  '35': 'Other', // Interpersonal and Social Skills
  '36': 'Other', // Leisure and Recreational Activities
  '37': 'Other', // Personal Awareness and Self-Improvement
  '46': 'Other', // Construction Trades
  '47': 'Other', // Mechanic and Repair Technologies/Technicians
  '48': 'Other', // Precision Production
  '49': 'Other', // Transportation and Materials Moving
};

/**
 * Get the major category for a given CIP code
 * @param cipCode The CIP code (e.g., "11.0701", "14", "52.0201")
 * @returns The major category or 'Other' if not found
 */
export function getMajorCategory(cipCode: string | null | undefined): MajorCategory {
  if (!cipCode) return 'Other';
  
  // Extract first 2 digits (the broad category)
  const prefix = cipCode.substring(0, 2).padStart(2, '0');
  
  return CIP_TO_CATEGORY[prefix] || 'Other';
}

/**
 * Get all CIP code prefixes for a given major category
 * @param category The major category
 * @returns Array of CIP code prefixes (2 digits) for that category
 */
export function getCIPCodesForCategory(category: MajorCategory): string[] {
  return Object.entries(CIP_TO_CATEGORY)
    .filter(([, cat]) => cat === category)
    .map(([prefix]) => prefix);
}

/**
 * Check if a CIP code belongs to a specific major category
 * @param cipCode The CIP code to check
 * @param category The major category to match against
 * @returns True if the CIP code belongs to the category
 */
export function isInCategory(cipCode: string | null | undefined, category: MajorCategory): boolean {
  return getMajorCategory(cipCode) === category;
}

/**
 * Get all available major categories
 * @returns Array of all major category names
 */
export function getAllMajorCategories(): MajorCategory[] {
  return ['STEM', 'Business', 'Health', 'Education', 'Humanities', 'Social Sciences', 'Arts', 'Other'];
}
