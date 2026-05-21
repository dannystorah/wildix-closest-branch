/**
 * types/index.ts - Shared TypeScript interfaces for the service
 */

/**
 * LocationInput - What customers provide in locations.json
 * Only requires address, no need for manual coordinates
 */
export interface LocationInput {
  id: string;
  name: string;
  address: string;
  phone?: string;
}

/**
 * Location - Internal representation with geocoded coordinates
 * Populated at startup from LocationInput
 */
export interface Location extends LocationInput {
  latitude: number;
  longitude: number;
}

export interface LocationsConfig {
  locations: Location[];
}

export interface GeocodingResult {
  lat: number;
  lng: number;
}

export interface DistanceMatrixResult {
  distance: {
    value: number; // in meters
    text: string;
  };
  duration: {
    value: number; // in seconds
    text: string;
  };
}

export interface WebhookRequest {
  postcode: string;
}

export interface WebhookResponse {
  success: boolean;
  data?: {
    closestLocation: Location;
    driveTimeMinutes: number;
    directDistanceKm: number;
    coordinates: {
      lat: number;
      lng: number;
    };
    mapsUrl: string;
  };
  error?: string;
}

export interface GoogleMapsResponse {
  status: string;
  error_message?: string;
}
