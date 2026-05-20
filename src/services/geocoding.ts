/**
 * services/geocoding.ts - Convert UK postcodes to coordinates
 */

import { googleApiRequest } from "../utils/api-client.js";
import { GeocodingResult } from "../types/index.js";

/**
 * Geocode a UK postcode to latitude/longitude coordinates
 */
export async function geocodePostcode(postcode: string): Promise<GeocodingResult> {
  try {
    console.log(`[Geocoding] Looking up postcode: ${postcode}`);

    const response = await googleApiRequest("maps/api/geocode/json", {
      address: postcode,
      region: "uk", // Bias results to UK region
      components: "country:GB",
    });

    if (!response.results || response.results.length === 0) {
      throw new Error(`No results found for postcode: ${postcode}`);
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
