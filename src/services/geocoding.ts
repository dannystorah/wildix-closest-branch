/**
 * services/geocoding.ts - Convert addresses and postcodes to coordinates
 */

import { googleApiRequest } from "../utils/api-client.js";
import { GeocodingResult } from "../types/index.js";

/**
 * Geocode any address (including postcodes) to latitude/longitude coordinates
 * Works for any address format: postcodes, full addresses, landmarks, etc.
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  try {
    console.log(`[Geocoding] Looking up address: ${address}`);

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



