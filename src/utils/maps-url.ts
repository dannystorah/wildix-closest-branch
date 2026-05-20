/**
 * utils/maps-url.ts - Generate Google Maps URLs for locations
 */

/**
 * Generate a Google Maps URL for a location
 * Returns a shareable link that can be used in SMS or voice messages
 */
export function generateMapsUrl(latitude: number, longitude: number, locationName: string): string {
  // Format: https://maps.google.com/?q=latitude,longitude
  // Google Maps recognizes this format and opens to the location
  const baseUrl = "https://maps.google.com";
  const query = `${latitude},${longitude}`;
  
  // Create URL with query parameter
  const url = new URL(baseUrl);
  url.searchParams.append("q", query);
  
  return url.toString();
}

/**
 * Generate a shortened description of the maps URL
 * Useful for voice agents to read out
 */
export function generateMapsUrlDescription(locationName: string): string {
  return `maps.google.com/${locationName.replace(/\s+/g, "")}`;
}
