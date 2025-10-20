import { Institution } from './database';

export interface UserStats {
  gpa?: number;
  sat?: number;
  act?: number;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface RecommendationResult {
  institution: Institution;
  distance?: number;
  category: 'safety' | 'match' | 'reach';
  confidenceScore: number;
}

/**
 * Calculates the Haversine distance between two geographic points
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Converts ACT score to equivalent SAT score for comparison
 * Based on College Board concordance tables
 */
export function convertActToSat(act: number): number {
  const concordance: { [key: number]: number } = {
    36: 1590, 35: 1540, 34: 1500, 33: 1460, 32: 1430,
    31: 1400, 30: 1370, 29: 1340, 28: 1310, 27: 1280,
    26: 1240, 25: 1210, 24: 1180, 23: 1140, 22: 1110,
    21: 1080, 20: 1040, 19: 1010, 18: 970, 17: 930,
    16: 890, 15: 850, 14: 800, 13: 760, 12: 710,
    11: 670, 10: 630, 9: 590
  };
  return concordance[Math.round(act)] || act * 40; // Rough approximation for non-standard scores
}

/**
 * Converts SAT score to equivalent ACT score for comparison
 */
export function convertSatToAct(sat: number): number {
  if (sat >= 1570) return 36;
  if (sat >= 1520) return 35;
  if (sat >= 1480) return 34;
  if (sat >= 1440) return 33;
  if (sat >= 1410) return 32;
  if (sat >= 1380) return 31;
  if (sat >= 1350) return 30;
  if (sat >= 1320) return 29;
  if (sat >= 1290) return 28;
  if (sat >= 1260) return 27;
  if (sat >= 1230) return 26;
  if (sat >= 1200) return 25;
  if (sat >= 1160) return 24;
  if (sat >= 1130) return 23;
  if (sat >= 1100) return 22;
  if (sat >= 1060) return 21;
  if (sat >= 1030) return 20;
  if (sat >= 990) return 19;
  if (sat >= 950) return 18;
  if (sat >= 910) return 17;
  if (sat >= 870) return 16;
  if (sat >= 830) return 15;
  if (sat >= 780) return 14;
  if (sat >= 730) return 13;
  if (sat >= 690) return 12;
  if (sat >= 650) return 11;
  return 10;
}

/**
 * Calculates recommendation category based on user stats vs institution data
 * Returns 'safety', 'match', or 'reach' with a confidence score
 */
export function categorizeInstitution(
  institution: Institution,
  userStats: UserStats
): { category: 'safety' | 'match' | 'reach'; confidenceScore: number } {
  let score = 0;
  let factors = 0;

  // Convert user's test scores to both SAT and ACT for comparison
  let userSat = userStats.sat;
  let userAct = userStats.act;
  
  if (!userSat && userAct) {
    userSat = convertActToSat(userAct);
  }
  if (!userAct && userSat) {
    userAct = convertSatToAct(userSat);
  }

  // Compare SAT scores if available
  if (userSat && institution.average_sat) {
    factors++;
    const satDiff = userSat - institution.average_sat;
    if (satDiff >= 100) score += 2; // Significantly above average - safety
    else if (satDiff >= 50) score += 1.5;
    else if (satDiff >= 0) score += 1; // At or slightly above average - match
    else if (satDiff >= -50) score += 0.5;
    else score += 0; // Below average - reach
  }

  // Compare ACT scores if available
  if (userAct && institution.average_act) {
    factors++;
    const actDiff = userAct - institution.average_act;
    if (actDiff >= 3) score += 2; // Significantly above average - safety
    else if (actDiff >= 2) score += 1.5;
    else if (actDiff >= 0) score += 1; // At or slightly above average - match
    else if (actDiff >= -1) score += 0.5;
    else score += 0; // Below average - reach
  }

  // Factor in acceptance rate (if available)
  if (institution.acceptance_rate) {
    factors++;
    if (institution.acceptance_rate >= 0.7) score += 2; // High acceptance - easier to get in
    else if (institution.acceptance_rate >= 0.5) score += 1.5;
    else if (institution.acceptance_rate >= 0.3) score += 1;
    else if (institution.acceptance_rate >= 0.15) score += 0.5;
    else score += 0; // Very selective
  }

  // Calculate average score and confidence
  if (factors === 0) {
    // No data available - default to match with low confidence
    return { category: 'match', confidenceScore: 0.2 };
  }

  const avgScore = score / factors;
  const confidenceScore = Math.min(factors / 3, 1); // More factors = higher confidence

  // Categorize based on average score
  if (avgScore >= 1.5) {
    return { category: 'safety', confidenceScore };
  } else if (avgScore >= 0.8) {
    return { category: 'match', confidenceScore };
  } else {
    return { category: 'reach', confidenceScore };
  }
}

/**
 * Filters and categorizes institutions based on proximity and user stats
 */
export function generateRecommendations(
  institutions: Institution[],
  userStats: UserStats,
  maxDistance: number = 50 // miles
): RecommendationResult[] {
  if (!userStats.latitude || !userStats.longitude) {
    return [];
  }

  const recommendations: RecommendationResult[] = [];

  for (const institution of institutions) {
    // Skip if no location data
    if (!institution.latitude || !institution.longitude) continue;

    // Calculate distance
    const distance = calculateDistance(
      userStats.latitude,
      userStats.longitude,
      institution.latitude,
      institution.longitude
    );

    // Skip if outside radius
    if (distance > maxDistance) continue;

    // Categorize institution
    const { category, confidenceScore } = categorizeInstitution(institution, userStats);

    recommendations.push({
      institution,
      distance,
      category,
      confidenceScore
    });
  }

  // Sort by category (safety first, then match, then reach) and then by distance
  const categoryOrder = { safety: 0, match: 1, reach: 2 };
  return recommendations.sort((a, b) => {
    if (categoryOrder[a.category] !== categoryOrder[b.category]) {
      return categoryOrder[a.category] - categoryOrder[b.category];
    }
    return (a.distance || 0) - (b.distance || 0);
  });
}

/**
 * Groups recommendations by category
 */
export function groupRecommendationsByCategory(
  recommendations: RecommendationResult[]
): {
  safety: RecommendationResult[];
  match: RecommendationResult[];
  reach: RecommendationResult[];
} {
  return {
    safety: recommendations.filter(r => r.category === 'safety'),
    match: recommendations.filter(r => r.category === 'match'),
    reach: recommendations.filter(r => r.category === 'reach')
  };
}
