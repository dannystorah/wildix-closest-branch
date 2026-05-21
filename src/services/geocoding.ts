/**
 * services/geocoding.ts - Convert addresses and postcodes to coordinates
 * Supports both real Google Maps API and mock mode for testing
 */

import { googleApiRequest } from "../utils/api-client.js";
import { mockGeocode, isMockMode } from "../utils/mock-google-api.js";
import { GeocodingResult } from "../types/index.js";

/**
 * Geocode any address (including postcodes) to latitude/longitude coordinates
 * Works for any address format: postcodes, full addresses, landmarks, etc.
 * Uses mock data if MOCK_GOOGLE_API=true environment variable is set
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  try {
    console.log(`[Geocoding] Looking up address: ${address}`);

    // Use mock API if in test mode
    if (isMockMode()) {
      return await mockGeocode(address);
    }

    const response = await googleApiRequest("maps/api/geocode/json", {
      address: address,
      region: "uk", // Bias results to UK region
      components: "country:GB",
    });

    if (!response.results || response.results.length === 0) {
      throw new Error(`No results found for address: ${address}`);
    }

    const result = response.results[0];
    const location = result.geometry.location;

    console.log(
      `[Geocoding] Found: ${result.formatted_address} (${location.lat}, ${location.lng})`
    );

    return {
      lat: location.lat,
      lng: location.lng,
    };
  } catch (error) {
    console.error("[Geocoding] Error:", error);
    throw error;
  }
}

/**
 * Geocode a UK postcode to latitude/longitude coordinates
 * Alias for geocodeAddress for backwards compatibility
 */
export async function geocodePostcode(postcode: string): Promise<GeocodingResult> {
  return geocodeAddress(postcode);
}


