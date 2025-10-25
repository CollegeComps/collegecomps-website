import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple geocoding API endpoint that converts US ZIP codes to latitude/longitude
 * Uses the free zippopotam.us API for geocoding
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zip = searchParams.get('zip');

    if (!zip) {
      return NextResponse.json(
        { error: 'ZIP code is required' },
        { status: 400 }
      );
    }

    // Validate ZIP code format (5 digits)
    if (!/^\d{5}$/.test(zip)) {
      return NextResponse.json(
        { error: 'Invalid ZIP code format. Must be 5 digits.' },
        { status: 400 }
      );
    }

    // Use zippopotam.us API - free, no API key required
    const response = await fetch(`http://api.zippopotam.us/us/${zip}`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!response.ok) {
      // If ZIP code not found, return error
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'ZIP code not found' },
          { status: 404 }
        );
      }
      throw new Error('Geocoding service error');
    }

    const data = await response.json();
    
    // Extract latitude and longitude from response
    // The API returns data in this format:
    // { "places": [{ "latitude": "40.7128", "longitude": "-74.0060" }] }
    if (!data.places || data.places.length === 0) {
      return NextResponse.json(
        { error: 'Location data not available for this ZIP code' },
        { status: 404 }
      );
    }

    const place = data.places[0];
    const latitude = parseFloat(place.latitude);
    const longitude = parseFloat(place.longitude);

    return NextResponse.json({
      zipCode: zip,
      latitude,
      longitude,
      city: place['place name'],
      state: place['state abbreviation'],
      country: data['country abbreviation']
    });

  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode ZIP code' },
      { status: 500 }
    );
  }
}
