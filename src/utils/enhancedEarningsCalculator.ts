import { Institution, AcademicProgram } from '@/lib/database';

// ─── Credential-level → typical program length (years) ───────────────────────
// Used to auto-populate "Program Length" when a specific program is selected.
// NOTE: Urban Institute IPEDS data uses non-standard award_level codes.
//   4 = Associate's, 7 = Bachelor's, 9 = Master's/Graduate,
//   22 = Extended Bachelor's, 23 = Extended Master's
export const CREDENTIAL_PROGRAM_LENGTH: Record<number, number> = {
  4:  2,   // Associate's degree
  7:  4,   // Bachelor's degree
  8:  1,   // Post-baccalaureate certificate
  9:  2,   // Master's degree
  17: 5,   // Doctoral degree - research/scholarship
  18: 4,   // Doctoral degree - professional practice (MD/JD)
  19: 5,   // Doctoral degree - other
  22: 5,   // Extended Bachelor's (5-year program)
  23: 3,   // Extended Master's
  24: 5,   // Doctoral degree
  30: 1,   // Occupational award < 1 year
  31: 2,   // Occupational award 1 to < 4 years
  32: 1,   // Occupational certificate
  33: 1,   // Academic certificate
};

// ─── Credential-level → typical career length (years of earning) ──────────────
// Earnings horizon decreases for advanced degrees because graduates start later.
export const CREDENTIAL_CAREER_LENGTH: Record<number, number> = {
  4:  40, // Associate's
  7:  40, // Bachelor's
  8:  38, // Post-bac certificate
  9:  37, // Master's (start 1-2 yrs later than bachelor's)
  17: 30, // Doctoral - research/scholarship
  18: 32, // Doctoral - professional practice (MD/JD)
  19: 30, // Doctoral - other
  22: 38, // Extended bachelor's (5 yr)
  23: 35, // Extended master's
  24: 32, // Doctoral degree
  30: 40, // Occupational cert < 1 yr
  31: 40,
  32: 40,
  33: 38,
};

// Enhanced earnings projection system that considers multiple factors
export class EnhancedEarningsCalculator {

  // Base salary data by CIP major category (BLS Occupational Outlook Handbook, 2024)
  // Indexed by 2-digit CIP prefix. growth = avg annual wage growth %.
  private static baseSalaryByCIP: { [key: string]: { low: number; median: number; high: number; growth: number } } = {
    // Source: BLS Occupational Outlook Handbook 2024-2025, IPEDS Graduate Outcomes
    '01': { low: 36000, median: 44000, high: 62000, growth: 2.2 }, // Agriculture & Related Sciences
    '03': { low: 39000, median: 48000, high: 68000, growth: 2.3 }, // Natural Resources & Conservation
    '04': { low: 44000, median: 57000, high: 82000, growth: 2.9 }, // Architecture & Related Services
    '05': { low: 38000, median: 47000, high: 66000, growth: 2.3 }, // Area, Ethnic, Cultural, Gender Studies
    '09': { low: 36000, median: 46000, high: 70000, growth: 2.7 }, // Communication, Journalism & Related Programs
    '10': { low: 46000, median: 57000, high: 80000, growth: 3.3 }, // Communications Technologies/Technicians
    '11': { low: 65000, median: 92000, high: 145000, growth: 5.3 }, // Computer & Information Sciences (BLS: software devs median $130K+)
    '12': { low: 26000, median: 36000, high: 54000, growth: 1.9 }, // Personal & Culinary Services
    '13': { low: 38000, median: 48000, high: 65000, growth: 2.0 }, // Education (BLS: teachers $60-70K median)
    '14': { low: 70000, median: 88000, high: 135000, growth: 4.3 }, // Engineering (BLS: engineers $95K+ median)
    '15': { low: 52000, median: 65000, high: 92000, growth: 3.5 }, // Engineering Technologies
    '16': { low: 33000, median: 44000, high: 65000, growth: 2.2 }, // Foreign Languages & Linguistics
    '18': { low: 28000, median: 38000, high: 55000, growth: 1.8 }, // Military Technologies
    '19': { low: 36000, median: 47000, high: 68000, growth: 2.3 }, // Family & Consumer Sciences/Human Sciences
    '20': { low: 30000, median: 40000, high: 58000, growth: 2.0 }, // Vocational/Technical Programs
    '21': { low: 32000, median: 42000, high: 60000, growth: 2.0 }, // Technology Education
    '22': { low: 58000, median: 82000, high: 145000, growth: 3.1 }, // Legal Professions (lawyers $130K+ median)
    '23': { low: 33000, median: 42000, high: 62000, growth: 2.1 }, // English Language & Literature
    '24': { low: 36000, median: 46000, high: 65000, growth: 2.2 }, // Liberal Arts & General Studies
    '25': { low: 40000, median: 52000, high: 72000, growth: 2.4 }, // Library Science
    '26': { low: 44000, median: 56000, high: 85000, growth: 4.0 }, // Biological & Biomedical Sciences
    '27': { low: 58000, median: 75000, high: 110000, growth: 4.7 }, // Mathematics & Statistics
    '28': { low: 42000, median: 55000, high: 78000, growth: 2.5 }, // Military Science
    '29': { low: 42000, median: 54000, high: 78000, growth: 2.5 }, // Military Technologies (reserve)
    '30': { low: 42000, median: 52000, high: 75000, growth: 2.8 }, // Multi/Interdisciplinary Studies
    '31': { low: 32000, median: 42000, high: 62000, growth: 2.1 }, // Parks, Recreation, Leisure & Fitness
    '32': { low: 30000, median: 38000, high: 52000, growth: 2.0 }, // Basic Skills Programs
    '33': { low: 30000, median: 38000, high: 52000, growth: 2.0 }, // Citizenship Activities
    '34': { low: 30000, median: 38000, high: 52000, growth: 2.0 }, // Health-Related Knowledge and Skills
    '35': { low: 30000, median: 38000, high: 52000, growth: 2.0 }, // Interpersonal and Social Skills
    '36': { low: 30000, median: 38000, high: 52000, growth: 2.0 }, // Leisure and Recreational Activities
    '37': { low: 30000, median: 38000, high: 52000, growth: 2.0 }, // Personal Awareness and Self-Improvement
    '38': { low: 36000, median: 46000, high: 68000, growth: 2.3 }, // Philosophy & Religious Studies
    '39': { low: 34000, median: 44000, high: 62000, growth: 2.0 }, // Theology & Religious Vocations
    '40': { low: 48000, median: 62000, high: 92000, growth: 3.6 }, // Physical Sciences (physicists, chemists)
    '41': { low: 40000, median: 52000, high: 75000, growth: 3.2 }, // Science Technologies/Technicians
    '42': { low: 40000, median: 52000, high: 80000, growth: 3.2 }, // Psychology (BLS: $82K+ with graduate degree)
    '43': { low: 42000, median: 54000, high: 80000, growth: 2.9 }, // Homeland Security, Law Enforcement, Firefighting
    '44': { low: 36000, median: 48000, high: 72000, growth: 2.5 }, // Public Administration & Social Service
    '45': { low: 40000, median: 52000, high: 78000, growth: 2.7 }, // Social Sciences
    '46': { low: 36000, median: 52000, high: 76000, growth: 3.0 }, // Construction Trades
    '47': { low: 40000, median: 55000, high: 78000, growth: 2.8 }, // Mechanic & Repair Technologies
    '48': { low: 34000, median: 48000, high: 70000, growth: 2.5 }, // Precision Production
    '49': { low: 36000, median: 52000, high: 74000, growth: 2.6 }, // Transportation & Materials Moving
    '50': { low: 30000, median: 42000, high: 75000, growth: 2.9 }, // Visual & Performing Arts
    '51': { low: 50000, median: 68000, high: 110000, growth: 3.8 }, // Health Professions (nurses $80K+, doctors $200K+)
    '52': { low: 46000, median: 62000, high: 105000, growth: 3.9 }, // Business, Management & Marketing
    '54': { low: 33000, median: 44000, high: 65000, growth: 2.2 }, // History
  };

  // Institution prestige multipliers based on selectivity and rankings
  private static getInstitutionPrestigeMultiplier(institution: Institution): number {
    const name = institution.name.toLowerCase();
    
    // Ivy League and top-tier universities
    if (name.includes('harvard') || name.includes('stanford') || name.includes('mit') || 
        name.includes('yale') || name.includes('princeton') || name.includes('columbia') ||
        name.includes('university of chicago') || name.includes('northwestern') ||
        name.includes('duke') || name.includes('cornell') || name.includes('dartmouth') ||
        name.includes('brown') || name.includes('university of pennsylvania')) {
      return 1.35;
    }

    // Top public universities and highly ranked privates
    if (name.includes('university of california') || name.includes('university of michigan') ||
        name.includes('university of virginia') || name.includes('georgia institute of technology') ||
        name.includes('carnegie mellon') || name.includes('rice university') ||
        name.includes('vanderbilt') || name.includes('emory') || name.includes('georgetown') ||
        name.includes('washington university') || name.includes('johns hopkins')) {
      return 1.25;
    }

    // Strong regional universities and state flagships  
    if (name.includes('university of texas') || name.includes('university of florida') ||
        name.includes('university of washington') || name.includes('university of wisconsin') ||
        name.includes('ohio state') || name.includes('penn state') || name.includes('purdue') ||
        name.includes('university of illinois') || name.includes('university of minnesota') ||
        name.includes('university of maryland') || name.includes('virginia tech')) {
      return 1.15;
    }

    // Community colleges and for-profit institutions
    if (name.includes('community college') || name.includes('junior college') ||
        institution.control_public_private === 3) { // 3 = Private for-profit
      return 0.85;
    }

    // Private nonprofit institutions (generally higher alumni networks)
    if (institution.control_public_private === 2) { // 2 = Private nonprofit
      return 1.08;
    }

    // Default for other public institutions
    return 1.0;
  }

  // Geographic cost of living and opportunity multipliers
  private static getGeographicMultiplier(institution: Institution): number {
    const state = institution.state?.toLowerCase();
    
    // High cost, high opportunity states
    if (state === 'ca' || state === 'ny' || state === 'ma' || state === 'ct' || 
        state === 'nj' || state === 'md' || state === 'dc' || state === 'wa') {
      return 1.25;
    }
    
    // Medium-high states
    if (state === 'tx' || state === 'fl' || state === 'il' || state === 'va' || 
        state === 'co' || state === 'nc' || state === 'ga' || state === 'az') {
      return 1.1;
    }
    
    // Lower cost states typically have lower salaries
    if (state === 'ms' || state === 'wv' || state === 'ar' || state === 'ky' ||
        state === 'al' || state === 'la' || state === 'nm' || state === 'ok') {
      return 0.9;
    }
    
    return 1.0; // Default for other states
  }

  // Degree level multipliers
  // Urban Institute IPEDS credential level codes:
  //   4 = Associate's, 7 = Bachelor's, 9 = Master's/Graduate,
  //   22 = Extended Bachelor's, 23 = Extended Master's
  private static getDegreeMultiplier(credentialLevel: number): number {
    switch (credentialLevel) {
      case 30: case 32: // Occupational certificates (< 1 year)
        return 0.7;
      case 31: // Occupational award 1–4 years
        return 0.8;
      case 4: // Associate's degree
        return 0.85;
      case 33: // Academic certificate
        return 0.9;
      case 7: // Bachelor's degree
      case 22: // Extended Bachelor's (5-year program)
        return 1.0;
      case 8: // Post-baccalaureate certificate
        return 1.1;
      case 9: // Master's/Graduate degree
      case 23: // Extended Master's
        return 1.25;
      case 24: // Doctoral degree (generic)
      case 17: case 18: case 19: // Doctoral sub-types
        return 1.4;
      default:
        return 1.0;
    }
  }

  // Program completion rate impact (higher completion rates correlate with better outcomes)
  private static getCompletionRateMultiplier(program: AcademicProgram): number {
    const completions = program.total_completions || program.completions || 0;
    
    // Programs with more graduates typically have better industry connections
    if (completions > 100) return 1.1;
    if (completions > 50) return 1.05;
    if (completions > 20) return 1.0;
    if (completions > 5) return 0.95;
    return 0.9; // Very small programs may have limited networking
  }

  public static calculateEnhancedEarnings(
    institution: Institution,
    program: AcademicProgram
  ): { startingSalary: number; midCareerSalary: number; growthRate: number } {
    
    // Get base salary data
    const cipMajor = program.cipcode?.split('.')[0]?.padStart(2, '0') || '52';
    const salaryData = this.baseSalaryByCIP[cipMajor] || this.baseSalaryByCIP['52'];
    
    // Calculate multipliers
    const prestigeMultiplier = this.getInstitutionPrestigeMultiplier(institution);
    const geoMultiplier = this.getGeographicMultiplier(institution);
    const degreeMultiplier = this.getDegreeMultiplier(program.credential_level || 7);
    const completionMultiplier = this.getCompletionRateMultiplier(program);
    
    // Combined multiplier
    const totalMultiplier = prestigeMultiplier * geoMultiplier * degreeMultiplier * completionMultiplier;
    
    // Calculate final salaries
    const startingSalary = Math.round(salaryData.median * totalMultiplier);
    const growthRate = salaryData.growth + (prestigeMultiplier - 1) * 0.5; // Better schools = better growth
    const midCareerSalary = Math.round(startingSalary * Math.pow(1 + growthRate/100, 15)); // 15 years
    
    return {
      startingSalary,
      midCareerSalary,
      growthRate: Math.round(growthRate * 10) / 10 // Round to 1 decimal
    };
  }

  // Get salary range for a program (for display purposes)
  public static getSalaryRange(
    institution: Institution,
    program: AcademicProgram
  ): { low: number; median: number; high: number } {

    const cipMajor = program.cipcode?.split('.')[0]?.padStart(2, '0') || '52';
    const salaryData = this.baseSalaryByCIP[cipMajor] || this.baseSalaryByCIP['52'];

    const prestigeMultiplier = this.getInstitutionPrestigeMultiplier(institution);
    const geoMultiplier = this.getGeographicMultiplier(institution);
    const degreeMultiplier = this.getDegreeMultiplier(program.credential_level || 7);
    const completionMultiplier = this.getCompletionRateMultiplier(program);

    const totalMultiplier = prestigeMultiplier * geoMultiplier * degreeMultiplier * completionMultiplier;

    return {
      low: Math.round(salaryData.low * totalMultiplier),
      median: Math.round(salaryData.median * totalMultiplier),
      high: Math.round(salaryData.high * totalMultiplier)
    };
  }

  /**
   * Estimate salary from CIP code + credential level alone (no institution required).
   * Used when a degree is selected before an institution, or as a fallback.
   */
  public static estimateSalaryFromCip(
    cipcode: string,
    credentialLevel: number = 5
  ): { startingSalary: number; midCareerSalary: number; growthRate: number } {
    const cipMajor = cipcode?.split('.')[0]?.padStart(2, '0') || '52';
    const salaryData = this.baseSalaryByCIP[cipMajor] || this.baseSalaryByCIP['52'];
    const degreeMultiplier = this.getDegreeMultiplier(credentialLevel);

    const startingSalary = Math.round(salaryData.median * degreeMultiplier);
    const growthRate = salaryData.growth;
    const midCareerSalary = Math.round(startingSalary * Math.pow(1 + growthRate / 100, 15));

    return { startingSalary, midCareerSalary, growthRate };
  }
}