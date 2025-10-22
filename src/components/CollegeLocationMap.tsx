'use client';

import { MapPinIcon } from '@heroicons/react/24/outline';

interface CollegeLocationMapProps {
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export function CollegeLocationMap({
  name,
  latitude,
  longitude,
  address,
  city,
  state,
  zip_code
}: CollegeLocationMapProps) {
  
  // If no location data, don't render
  if (!latitude || !longitude) {
    return null;
  }

  // Construct Google Maps embed URL
  const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}&hl=en&z=14&output=embed`;
  
  // Construct full address for display
  const fullAddress = [address, city, state, zip_code].filter(Boolean).join(', ');

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-4">
        <MapPinIcon className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Location</h2>
      </div>
      
      {fullAddress && (
        <p className="text-gray-700 mb-4">{fullAddress}</p>
      )}
      
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio */}
        <iframe
          src={mapUrl}
          className="absolute top-0 left-0 w-full h-full rounded-lg border border-gray-200"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Location map for ${name}`}
        />
      </div>
      
      <div className="mt-4 text-center">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Open in Google Maps →
        </a>
      </div>
    </div>
  );
}
