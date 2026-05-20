/**
 * utils/api-client.ts - HTTP client utilities for Google Maps API
 */

import { config } from "../config/environment.js";

/**
 * Fetches data from a given URL and parses it as JSON.
 * Handles network errors and non-OK HTTP statuses.
 */
export async function fetchJson<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorBody}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error(`[API] Error fetching from ${url}:`, error);
    throw error;
  }
}

/**
 * Makes a request to a Google Maps API endpoint.
 * Automatically injects API key and handles errors.
 */
export async function googleApiRequest(
  endpoint: string,
  queryParams: Record<string, string | number> = {}
): Promise<any> {
  try {
    // Construct the full URL
    const url = new URL(`https://maps.googleapis.com/${endpoint}`);

    // Automatically append API key
    url.searchParams.append("key", config.GOOGLE_MAPS_API_KEY);

    // Add user-provided query parameters
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });

    console.log(`[API] Requesting: ${endpoint}`);

    // Fetch data from the API
    const response: any = await fetchJson(url.toString());

    // Check if the API request was successful
    if (response.status && response.status.toUpperCase() !== "OK") {
      throw new Error(`Google Maps API error: ${response.error_message || response.status}`);
    }

    return response;
  } catch (error) {
    console.error(`[API] Google Maps request failed:`, error);
    throw error;
  }
}
