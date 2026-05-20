/**
 * types/index.ts - Shared TypeScript interfaces for the service
 */

export interface Location {
  id: string;
  name: string;
  postcode: string;
  latitude: number;
  longitude: number;
  phone?: string;
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
  };
  error?: string;
}

export interface GoogleMapsResponse {
  status: string;
  error_message?: string;
}
