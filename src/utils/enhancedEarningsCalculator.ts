import { Institution, AcademicProgram } from '@/lib/database';

// Enhanced earnings projection system that considers multiple factors
export class EnhancedEarningsCalculator {
  
  // Base salary data by CIP major category with more realistic ranges
  private static baseSalaryByCIP: { [key: string]: { low: number; median: number; high: number; growth: number } } = {
    '01': { low: 35000, median: 42000, high: 55000, growth: 2.1 }, // Agriculture, Agriculture Operations, and Related Sciences
    '03': { low: 38000, median: 45000, high: 62000, growth: 2.3 }, // Natural Resources and Conservation
    '04': { low: 42000, median: 52000, high: 75000, growth: 2.8 }, // Architecture and Related Services
    '05': { low: 40000, median: 48000, high: 65000, growth: 2.4 }, // Area, Ethnic, Cultural, Gender, and Group Studies
    '09': { low: 35000, median: 43000, high: 65000, growth: 2.6 }, // Communication, Journalism, and Related Programs
    '10': { low: 45000, median: 55000, high: 75000, growth: 3.2 }, // Communications Technologies/Technicians and Support Services
    '11': { low: 65000, median: 85000, high: 130000, growth: 5.1 }, // Computer and Information Sciences and Support Services
    '12': { low: 25000, median: 35000, high: 50000, growth: 1.8 }, // Personal and Culinary Services
    '13': { low: 35000, median: 45000, high: 60000, growth: 1.9 }, // Education
    '14': { low: 68000, median: 82000, high: 125000, growth: 4.2 }, // Engineering
    '15': { low: 50000, median: 62000, high: 85000, growth: 3.4 }, // Engineering Technologies and Engineering-Related Fields
    '16': { low: 32000, median: 42000, high: 60000, growth: 2.1 }, // Foreign Languages, Literatures, and Linguistics
    '19': { low: 35000, median: 45000, high: 65000, growth: 2.2 }, // Family and Consumer Sciences/Human Sciences
    '22': { low: 45000, median: 55000, high: 85000, growth: 2.9 }, // Legal Professions and Studies
    '23': { low: 32000, median: 40000, high: 58000, growth: 2.0 }, // English Language and Literature/Letters
    '24': { low: 35000, median: 45000, high: 62000, growth: 2.1 }, // Liberal Arts and Sciences, General Studies and Humanities
    '25': { low: 38000, median: 48000, high: 65000, growth: 2.3 }, // Library Science
    '26': { low: 42000, median: 52000, high: 78000, growth: 3.8 }, // Biological and Biomedical Sciences
    '27': { low: 55000, median: 68000, high: 95000, growth: 4.5 }, // Mathematics and Statistics
    '30': { low: 40000, median: 50000, high: 72000, growth: 2.7 }, // Multi/Interdisciplinary Studies
    '31': { low: 30000, median: 38000, high: 55000, growth: 2.0 }, // Parks, Recreation, Leisure, and Fitness Studies
    '38': { low: 35000, median: 45000, high: 65000, growth: 2.2 }, // Philosophy and Religious Studies
    '39': { low: 35000, median: 45000, high: 65000, growth: 1.9 }, // Theology and Religious Vocations
    '40': { low: 45000, median: 58000, high: 85000, growth: 3.5 }, // Physical Sciences
    '42': { low: 38000, median: 48000, high: 72000, growth: 3.1 }, // Psychology
    '43': { low: 40000, median: 50000, high: 75000, growth: 2.8 }, // Homeland Security, Law Enforcement, Firefighting and Related Protective Services
    '44': { low: 35000, median: 45000, high: 65000, growth: 2.4 }, // Public Administration and Social Service Professions
    '45': { low: 38000, median: 48000, high: 70000, growth: 2.6 }, // Social Sciences
    '46': { low: 35000, median: 48000, high: 68000, growth: 2.9 }, // Construction Trades
    '47': { low: 38000, median: 52000, high: 72000, growth: 2.7 }, // Mechanic and Repair Technologies/Technicians
    '48': { low: 32000, median: 45000, high: 65000, growth: 2.4 }, // Precision Production
    '49': { low: 35000, median: 48000, high: 68000, growth: 2.5 }, // Transportation and Materials Moving
    '50': { low: 28000, median: 38000, high: 68000, growth: 2.8 }, // Visual and Performing Arts
    '51': { low: 48000, median: 62000, high: 95000, growth: 3.6 }, // Health Professions and Related Programs
    '52': { low: 45000, median: 58000, high: 95000, growth: 3.8 }, // Business, Management, Marketing, and Related Support Services
    '54': { low: 32000, median: 42000, high: 60000, growth: 2.1 }  // History
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
  private static getDegreeMultiplier(credentialLevel: number): number {
    switch (credentialLevel) {
      case 1: case 2: // Certificates under 2 years
        return 0.7;
      case 3: // Associate's degree
        return 0.8;
      case 4: // Awards 2-4 years
        return 0.85;
      case 5: // Bachelor's degree
        return 1.0;
      case 6: // Post-baccalaureate certificate
        return 1.05;
      case 7: // Master's degree
        return 1.25;
      case 8: // Post-master's certificate
        return 1.3;
      case 17: case 18: case 19: // Doctoral degrees
        return 1.4;
      case 20: case 21: // Professional certificates
        return 1.15;
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
    const degreeMultiplier = this.getDegreeMultiplier(program.credential_level || 5);
    const completionMultiplier = this.getCompletionRateMultiplier(program);
    
    // Combined multiplier
    const totalMultiplier = prestigeMultiplier * geoMultiplier * degreeMultiplier * completionMultiplier;
    
    // Calculate final salaries
    const startingSalary = Math.round(salaryData.median * totalMultiplier);
    const growthRate = salaryData.growth + (prestigeMultiplier - 1) * 0.5; // Better schools = better growth
    const midCareerSalary = Math.round(startingSalary * Math.pow(1 + growthRate/100, 15)); // 15 years
    
    console.log(`Enhanced Earnings Calculation:
      Institution: ${institution.name}
      Program: ${program.cip_title}
      Base Median: $${salaryData.median.toLocaleString()}
      Prestige Multiplier: ${prestigeMultiplier.toFixed(2)}
      Geographic Multiplier: ${geoMultiplier.toFixed(2)}  
      Degree Multiplier: ${degreeMultiplier.toFixed(2)}
      Completion Multiplier: ${completionMultiplier.toFixed(2)}
      Total Multiplier: ${totalMultiplier.toFixed(2)}
      Starting Salary: $${startingSalary.toLocaleString()}
      Growth Rate: ${growthRate.toFixed(1)}%
      Mid-Career Salary: $${midCareerSalary.toLocaleString()}`);
    
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
    const degreeMultiplier = this.getDegreeMultiplier(program.credential_level || 5);
    const completionMultiplier = this.getCompletionRateMultiplier(program);
    
    const totalMultiplier = prestigeMultiplier * geoMultiplier * degreeMultiplier * completionMultiplier;
    
    return {
      low: Math.round(salaryData.low * totalMultiplier),
      median: Math.round(salaryData.median * totalMultiplier),
      high: Math.round(salaryData.high * totalMultiplier)
    };
  }
}