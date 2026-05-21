/**
 * utils/mock-google-api.ts - Mock Google Maps API responses for testing
 * 
 * This allows testing the service without needing a real Google Maps API key.
 * Simulates realistic responses for geocoding and distance matrix endpoints.
 */

import { GeocodingResult } from "../types/index.js";

// Mock UK postcode/address database for testing
const MOCK_LOCATIONS: Record<string, GeocodingResult> = {
  // Common London postcodes
  "SW1A1AA": { lat: 51.5007, lng: -0.1246 }, // Westminster, London
  "SW1A 1AA": { lat: 51.5007, lng: -0.1246 },
  "EC1A1BB": { lat: 51.5185, lng: -0.0928 }, // London EC1
  "EC1A 1BB": { lat: 51.5185, lng: -0.0928 },
  "M11AD": { lat: 53.4808, lng: -2.2426 }, // Manchester
  "M1 1AD": { lat: 53.4808, lng: -2.2426 },
  "B33 8TH": { lat: 52.5086, lng: -1.8845 }, // Birmingham
  "EH88DX": { lat: 55.9533, lng: -3.1883 }, // Edinburgh
  "EH8 8DX": { lat: 55.9533, lng: -3.1883 },
  "CF103EZ": { lat: 51.4816, lng: -3.1791 }, // Cardiff
  "CF10 3EZ": { lat: 51.4816, lng: -3.1791 },

  // Common addresses
  "123 Main Street, London, UK": { lat: 51.5074, lng: -0.1278 },
  "10 Downing Street, London, UK": { lat: 51.5033, lng: -0.1276 },
  "Tower of London, London, UK": { lat: 51.5055, lng: -0.0754 },
  "Piccadilly Circus, London, UK": { lat: 51.5101, lng: -0.1338 },
};

// Mock distance matrix responses (in seconds)
const MOCK_DISTANCES: Record<string, number> = {
  "SW1A1AA->SW1A1AA": 0,
  "M11AD->SW1A1AA": 3300, // ~55 mins
  "B338TH->SW1A1AA": 6600, // ~110 mins
  "EH88DX->SW1A1AA": 18000, // ~300 mins
};

/**
 * Mock geocoding API - converts addresses/postcodes to coordinates
 */
export async function mockGeocode(address: string): Promise<GeocodingResult> {
  console.log("[Mock] Geocoding:", address);

  // Normalize address for lookup
  const normalized = address
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/,/g, "");

  // Check exact match
  if (MOCK_LOCATIONS[normalized]) {
    const result = MOCK_LOCATIONS[normalized];
    console.log("[Mock] Found:", result);
    return result;
  }

  // Check case-insensitive match
  for (const [key, value] of Object.entries(MOCK_LOCATIONS)) {
    if (key.toUpperCase().replace(/\s+/g, "") === normalized) {
      console.log("[Mock] Found:", value);
      return value;
    }
  }

  // Default: return a random UK location for unknown addresses
  // In real testing, this would fail, but for demo we'll return a plausible coordinate
  console.warn("[Mock] Address not in database, returning mock London coordinates");
  return { lat: 51.5074 + Math.random() * 0.1, lng: -0.1278 + Math.random() * 0.1 };
}

/**
 * Mock distance matrix API - returns driving time in seconds
 */
export async function mockDistanceMatrix(
  origins: Array<{ lat: number; lng: number }>,
  destinations: Array<{ lat: number; lng: number }> & { name?: string }[]
): Promise<Array<number>> {
  console.log("[Mock] Distance Matrix: calculating for", origins.length, "origins");

  const results: number[] = [];

  for (const destination of destinations) {
    // For testing purposes, simulate realistic driving times
    // In real scenarios, this would calculate based on actual coordinates

    // Calculate simple distance-based estimate
    const latDiff = Math.abs((origins[0]?.lat || 0) - destination.lat);
    const lngDiff = Math.abs((origins[0]?.lng || 0) - destination.lng);
    const distance = Math.sqrt(latDiff ** 2 + lngDiff ** 2) * 111; // rough km conversion

    // Estimate: ~60 km/hour driving
    const estimatedSeconds = (distance / 60) * 3600;

    results.push(Math.round(estimatedSeconds));
    console.log("[Mock] Distance to", destination.name, ":", Math.round(estimatedSeconds / 60), "mins");
  }

  return results;
}

/**
 * Check if mock mode is enabled
 */
export function isMockMode(): boolean {
  return process.env.MOCK_GOOGLE_API === "true";
}
