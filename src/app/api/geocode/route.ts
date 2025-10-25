import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zip = searchParams.get('zip');

    if (!zip || !/^\d{5}$/.test(zip)) {
      return NextResponse.json(
        { error: 'Valid 5-digit ZIP code required' },
        { status: 400 }
      );
    }

    const response = await fetch(`http://api.zippopotam.us/us/${zip}`);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'ZIP code not found' },
        { status: 404 }
      );
    }

    const data = await response.json();
    
    if (!data.places || data.places.length === 0) {
      return NextResponse.json(
        { error: 'Location data not available' },
        { status: 404 }
      );
    }

    const place = data.places[0];
    
    return NextResponse.json({
      zipCode: zip,
      latitude: parseFloat(place.latitude),
      longitude: parseFloat(place.longitude),
      city: place['place name'],
      state: place['state abbreviation']
    });

  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode ZIP code' },
      { status: 500 }
    );
  }
}
