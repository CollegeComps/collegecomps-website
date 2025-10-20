/**
 * Geographic utility functions for distance calculations and location-based filtering
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ZipCodeCoordinates extends Coordinates {
  zipCode: string;
}

/**
 * Calculate the distance between two points using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in miles
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get coordinates for a US zip code using ZipCodeBase API
 * Falls back to approximate center of US if API fails
 * 
 * Note: This is a simplified implementation. For production, consider:
 * - Using a dedicated geocoding service (Google Maps, Mapbox, etc.)
 * - Caching zip code coordinates in the database
 * - Using a local zip code database
 * 
 * @param zipCode 5-digit US zip code
 * @returns Promise<Coordinates | null>
 */
export async function getZipCodeCoordinates(
  zipCode: string
): Promise<Coordinates | null> {
  // Validate zip code format
  if (!zipCode || !/^\d{5}$/.test(zipCode)) {
    return null;
  }

  // For now, use a simple in-memory cache of common zip codes
  // TODO: Replace with proper geocoding API or database lookup
  const knownZipCodes = getKnownZipCodes();
  
  if (knownZipCodes.has(zipCode)) {
    return knownZipCodes.get(zipCode)!;
  }

  // If zip code not in cache, try to fetch from free API
  try {
    // Using zip-codes.com free API (no key required, but rate limited)
    const response = await fetch(
      `https://api.zippopotam.us/us/${zipCode}`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );

    if (response.ok) {
      const data = await response.json();
      if (data.places && data.places.length > 0) {
        const place = data.places[0];
        return {
          latitude: parseFloat(place.latitude),
          longitude: parseFloat(place.longitude),
        };
      }
    }
  } catch (error) {
    console.warn(`Failed to fetch coordinates for zip code ${zipCode}:`, error);
  }

  // Fallback: return null if we can't find coordinates
  return null;
}

/**
 * Known zip codes cache (major cities and common locations)
 * This reduces API calls for frequently searched locations
 */
function getKnownZipCodes(): Map<string, Coordinates> {
  return new Map([
    // Major US Cities
    ['10001', { latitude: 40.7506, longitude: -73.9971 }], // New York, NY
    ['10002', { latitude: 40.7156, longitude: -73.9866 }], // New York, NY
    ['90001', { latitude: 33.9731, longitude: -118.2479 }], // Los Angeles, CA
    ['90011', { latitude: 33.9990, longitude: -118.2584 }], // Los Angeles, CA
    ['60601', { latitude: 41.8855, longitude: -87.6178 }], // Chicago, IL
    ['60614', { latitude: 41.9212, longitude: -87.6534 }], // Chicago, IL
    ['77001', { latitude: 29.7499, longitude: -95.3576 }], // Houston, TX
    ['77002', { latitude: 29.7589, longitude: -95.3677 }], // Houston, TX
    ['85001', { latitude: 33.4487, longitude: -112.0740 }], // Phoenix, AZ
    ['85003', { latitude: 33.4500, longitude: -112.0667 }], // Phoenix, AZ
    ['19101', { latitude: 39.9500, longitude: -75.1667 }], // Philadelphia, PA
    ['19102', { latitude: 39.9523, longitude: -75.1638 }], // Philadelphia, PA
    ['78201', { latitude: 29.4252, longitude: -98.4946 }], // San Antonio, TX
    ['78202', { latitude: 29.4254, longitude: -98.4649 }], // San Antonio, TX
    ['92101', { latitude: 32.7157, longitude: -117.1611 }], // San Diego, CA
    ['92102', { latitude: 32.7083, longitude: -117.1286 }], // San Diego, CA
    ['75201', { latitude: 32.7767, longitude: -96.7970 }], // Dallas, TX
    ['75202', { latitude: 32.7816, longitude: -96.7990 }], // Dallas, TX
    ['95101', { latitude: 37.3337, longitude: -121.8907 }], // San Jose, CA
    ['95110', { latitude: 37.3394, longitude: -121.8903 }], // San Jose, CA
    ['78701', { latitude: 29.7604, longitude: -97.7457 }], // Austin, TX
    ['78702', { latitude: 29.7652, longitude: -97.7185 }], // Austin, TX
    ['32801', { latitude: 28.5421, longitude: -81.3765 }], // Orlando, FL
    ['32803', { latitude: 28.5383, longitude: -81.3792 }], // Orlando, FL
    ['33101', { latitude: 25.7753, longitude: -80.1890 }], // Miami, FL
    ['33125', { latitude: 25.7839, longitude: -80.2341 }], // Miami, FL
    ['02108', { latitude: 42.3585, longitude: -71.0636 }], // Boston, MA
    ['02109', { latitude: 42.3647, longitude: -71.0542 }], // Boston, MA
    ['98101', { latitude: 33.4255, longitude: -111.9400 }], // Seattle, WA
    ['98102', { latitude: 47.6278, longitude: -122.3233 }], // Seattle, WA
    ['80201', { latitude: 39.7505, longitude: -104.9987 }], // Denver, CO
    ['80202', { latitude: 39.7528, longitude: -104.9903 }], // Denver, CO
    ['20001', { latitude: 38.9072, longitude: -77.0132 }], // Washington, DC
    ['20002', { latitude: 38.9047, longitude: -76.9934 }], // Washington, DC
    ['30301', { latitude: 33.7490, longitude: -84.3880 }], // Atlanta, GA
    ['30303', { latitude: 33.7490, longitude: -84.3880 }], // Atlanta, GA
    ['37201', { latitude: 36.1627, longitude: -86.7816 }], // Nashville, TN
    ['37203', { latitude: 36.1540, longitude: -86.7903 }], // Nashville, TN
    ['97201', { latitude: 45.5152, longitude: -122.6784 }], // Portland, OR
    ['97204', { latitude: 45.5189, longitude: -122.6765 }], // Portland, OR
    ['89101', { latitude: 36.1716, longitude: -115.1391 }], // Las Vegas, NV
    ['89102', { latitude: 36.1540, longitude: -115.1708 }], // Las Vegas, NV
    ['63101', { latitude: 38.6270, longitude: -90.1994 }], // St. Louis, MO
    ['63103', { latitude: 38.6324, longitude: -90.2068 }], // St. Louis, MO
    ['55401', { latitude: 44.9778, longitude: -93.2650 }], // Minneapolis, MN
    ['55402', { latitude: 44.9833, longitude: -93.2716 }], // Minneapolis, MN
    ['33101', { latitude: 25.7753, longitude: -80.1890 }], // Miami, FL
    ['48201', { latitude: 42.3314, longitude: -83.0458 }], // Detroit, MI
    ['27601', { latitude: 35.7796, longitude: -78.6382 }], // Raleigh, NC
    ['28201', { latitude: 35.2271, longitude: -80.8431 }], // Charlotte, NC
    ['43201', { latitude: 39.9612, longitude: -82.9988 }], // Columbus, OH
    ['46201', { latitude: 39.7684, longitude: -86.1581 }], // Indianapolis, IN
    ['53201', { latitude: 43.0389, longitude: -87.9065 }], // Milwaukee, WI
    ['64101', { latitude: 39.0997, longitude: -94.5786 }], // Kansas City, MO
    ['68101', { latitude: 41.2565, longitude: -95.9345 }], // Omaha, NE
    ['73101', { latitude: 35.4676, longitude: -97.5164 }], // Oklahoma City, OK
    ['87101', { latitude: 35.0844, longitude: -106.6504 }], // Albuquerque, NM
    ['94101', { latitude: 37.7749, longitude: -122.4194 }], // San Francisco, CA
    ['94102', { latitude: 37.7799, longitude: -122.4177 }], // San Francisco, CA
    // College Towns
    ['02138', { latitude: 42.3736, longitude: -71.1097 }], // Cambridge, MA (Harvard)
    ['08544', { latitude: 40.3573, longitude: -74.6672 }], // Princeton, NJ
    ['14850', { latitude: 42.4430, longitude: -76.5019 }], // Ithaca, NY (Cornell)
    ['27701', { latitude: 35.9940, longitude: -78.8986 }], // Durham, NC (Duke)
    ['48104', { latitude: 42.2808, longitude: -83.7430 }], // Ann Arbor, MI
    ['02115', { latitude: 42.3398, longitude: -71.0892 }], // Boston, MA (BU/Northeastern)
    ['94305', { latitude: 37.4275, longitude: -122.1697 }], // Stanford, CA
    ['90095', { latitude: 34.0689, longitude: -118.4452 }], // Los Angeles, CA (UCLA)
    ['10027', { latitude: 40.8075, longitude: -73.9626 }], // New York, NY (Columbia)
    ['06520', { latitude: 41.3083, longitude: -72.9279 }], // New Haven, CT (Yale)
  ]);
}

/**
 * Filter institutions by proximity to a location
 * @param institutions Array of institutions with latitude/longitude
 * @param centerLat Center latitude
 * @param centerLon Center longitude
 * @param radiusMiles Maximum distance in miles
 * @returns Filtered institutions with distance property added
 */
export function filterByProximity<T extends { latitude?: number; longitude?: number }>(
  institutions: T[],
  centerLat: number,
  centerLon: number,
  radiusMiles: number
): Array<T & { distance_miles: number }> {
  return institutions
    .filter((inst) => inst.latitude != null && inst.longitude != null)
    .map((inst) => ({
      ...inst,
      distance_miles: haversineDistance(
        centerLat,
        centerLon,
        inst.latitude!,
        inst.longitude!
      ),
    }))
    .filter((inst) => inst.distance_miles <= radiusMiles)
    .sort((a, b) => a.distance_miles - b.distance_miles); // Sort by closest first
}

/**
 * Validate and normalize US zip code
 * @param zipCode Input zip code string
 * @returns Normalized 5-digit zip code or null if invalid
 */
export function normalizeZipCode(zipCode: string): string | null {
  if (!zipCode) return null;

  // Remove any whitespace
  const cleaned = zipCode.trim();

  // Extract first 5 digits from formats like "12345-6789" or "12345 6789"
  const match = cleaned.match(/^(\d{5})/);
  
  if (match) {
    return match[1];
  }

  return null;
}
