/**
 * School Categorization System
 * Identifies schools by prestigious categories and special designations
 */

export type SchoolCategory = 
  | 'ivy-league'
  | 'public-flagship'
  | 'elite-private'
  | 'hbcu'
  | 'military'
  | 'service-academy';

export interface CategoryBadge {
  category: SchoolCategory;
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

// Ivy League Schools (8 schools)
const IVY_LEAGUE_UNITIDS = new Set([
  166027, // Harvard University
  190150, // Princeton University
  216279, // Columbia University in the City of New York
  182670, // Brown University
  130794, // Cornell University
  164924, // Dartmouth College
  215062, // University of Pennsylvania
  198419, // Yale University
]);

// Public Flagship Universities (major state research universities)
const PUBLIC_FLAGSHIP_UNITIDS = new Set([
  100751, // University of Alabama
  110635, // University of Arizona
  106397, // University of Arkansas
  110592, // Arizona State University
  110404, // University of California-Berkeley
  110662, // University of California-Los Angeles
  110644, // University of California-San Diego
  110671, // University of California-Davis
  110653, // University of California-Irvine
  110617, // University of California-Santa Barbara
  126614, // University of Colorado Boulder
  129020, // University of Connecticut
  130943, // University of Delaware
  133951, // University of Florida
  139755, // University of Georgia
  145600, // University of Hawaii at Manoa
  145637, // University of Idaho
  145813, // Boise State University
  149222, // University of Illinois Urbana-Champaign
  150066, // Indiana University-Bloomington
  153603, // Purdue University-Main Campus
  153658, // University of Iowa
  155317, // Iowa State University
  155399, // University of Kansas
  157085, // University of Kentucky
  159391, // Louisiana State University and Agricultural & Mechanical College
  161217, // University of Maine
  163286, // University of Maryland-College Park
  166683, // University of Massachusetts-Amherst
  168148, // University of Michigan-Ann Arbor
  171100, // Michigan State University
  174066, // University of Minnesota-Twin Cities
  176017, // University of Mississippi
  176080, // Mississippi State University
  178396, // University of Missouri-Columbia
  180461, // University of Montana
  181464, // University of Nebraska-Lincoln
  182290, // University of Nevada-Reno
  183044, // University of New Hampshire-Main Campus
  186131, // Rutgers University-New Brunswick
  187985, // University of New Mexico-Main Campus
  190415, // SUNY at Binghamton
  196097, // University of North Carolina at Chapel Hill
  197027, // North Carolina State University at Raleigh
  200280, // University of North Dakota
  204024, // Ohio State University-Main Campus
  206084, // University of Oklahoma-Norman Campus
  206525, // Oklahoma State University-Main Campus
  209542, // University of Oregon
  211440, // Oregon State University
  214777, // Pennsylvania State University-Main Campus
  217484, // University of Rhode Island
  218663, // University of South Carolina-Columbia
  220862, // University of South Dakota
  221999, // University of Tennessee-Knoxville
  228778, // University of Texas at Austin
  230764, // Texas A & M University-College Station
  230038, // University of Houston
  230728, // Texas Tech University
  230959, // University of North Texas
  230959, // University of Texas at Arlington
  230594, // University of Utah
  232186, // University of Vermont
  234076, // University of Virginia-Main Campus
  236948, // University of Washington-Seattle Campus
  238032, // Washington State University
  237011, // West Virginia University
  240444, // University of Wisconsin-Madison
  240727, // University of Wyoming
]);

// Elite Private Universities (top research universities, excluding Ivy)
const ELITE_PRIVATE_UNITIDS = new Set([
  110404, // Stanford University
  110635, // California Institute of Technology
  147767, // University of Chicago
  130794, // Northwestern University
  164739, // Duke University
  198419, // Johns Hopkins University
  166683, // Massachusetts Institute of Technology
  147767, // Emory University
  164988, // Vanderbilt University
  130794, // Rice University
  147767, // Carnegie Mellon University
  215062, // University of Southern California
  240444, // Wake Forest University
]);

// Service Academies
const SERVICE_ACADEMY_UNITIDS = new Set([
  163286, // United States Naval Academy
  197027, // United States Military Academy
  128106, // United States Air Force Academy
  110547, // United States Coast Guard Academy
  196060, // United States Merchant Marine Academy
]);

/**
 * Categorizes a school based on its characteristics
 */
export function categorizeSchool(institution: {
  unitid: number;
  historically_black?: number;
  control_public_private?: number;
  name?: string;
}): SchoolCategory[] {
  const categories: SchoolCategory[] = [];

  // Check Ivy League
  if (IVY_LEAGUE_UNITIDS.has(institution.unitid)) {
    categories.push('ivy-league');
  }

  // Check Service Academies
  if (SERVICE_ACADEMY_UNITIDS.has(institution.unitid)) {
    categories.push('service-academy');
  }
  // Check military schools (by name pattern)
  else if (institution.name?.toLowerCase().includes('military academy') ||
           institution.name?.toLowerCase().includes('naval academy') ||
           institution.name?.toLowerCase().includes('air force academy')) {
    categories.push('military');
  }

  // Check Public Flagship
  if (PUBLIC_FLAGSHIP_UNITIDS.has(institution.unitid) && 
      institution.control_public_private === 1) {
    categories.push('public-flagship');
  }

  // Check Elite Private
  if (ELITE_PRIVATE_UNITIDS.has(institution.unitid) && 
      institution.control_public_private !== 1) {
    categories.push('elite-private');
  }

  // Check HBCU
  if (institution.historically_black === 1) {
    categories.push('hbcu');
  }

  return categories;
}

/**
 * Gets badge display properties for a category
 */
export function getCategoryBadge(category: SchoolCategory): CategoryBadge {
  const badges: Record<SchoolCategory, CategoryBadge> = {
    'ivy-league': {
      category: 'ivy-league',
      label: 'Ivy League',
      color: 'text-blue-800',
      bgColor: 'bg-blue-100',
      description: 'Member of the prestigious Ivy League'
    },
    'public-flagship': {
      category: 'public-flagship',
      label: 'Public Flagship',
      color: 'text-blue-800',
      bgColor: 'bg-blue-100',
      description: 'Premier public research university'
    },
    'elite-private': {
      category: 'elite-private',
      label: 'Elite Private',
      color: 'text-indigo-800',
      bgColor: 'bg-indigo-100',
      description: 'Top-tier private research university'
    },
    'hbcu': {
      category: 'hbcu',
      label: 'HBCU',
      color: 'text-green-800',
      bgColor: 'bg-green-100',
      description: 'Historically Black College or University'
    },
    'military': {
      category: 'military',
      label: 'Military',
      color: 'text-red-800',
      bgColor: 'bg-red-100',
      description: 'Military academy or institution'
    },
    'service-academy': {
      category: 'service-academy',
      label: 'Service Academy',
      color: 'text-yellow-800',
      bgColor: 'bg-yellow-100',
      description: 'U.S. Federal Service Academy'
    }
  };

  return badges[category];
}

/**
 * Gets all badges for an institution
 */
export function getSchoolBadges(institution: {
  unitid: number;
  historically_black?: number;
  control_public_private?: number;
  name?: string;
}): CategoryBadge[] {
  const categories = categorizeSchool(institution);
  return categories.map(cat => getCategoryBadge(cat));
}
