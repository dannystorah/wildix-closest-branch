/**
 * services/locator.ts - Find closest location and get drive time
 * 
 * Main orchestration service that:
 * 1. Geocodes input postcode to coordinates
 * 2. Loads all pre-defined locations
 * 3. Finds the closest location
 * 4. Retrieves drive time from Google Maps
 */

import { geocodePostcode } from "./geocoding.js";
import { getDriveTimes } from "./distance.js";
import { loadLocations } from "../utils/locations-loader.js";
import { calculateHaversineDistance, metersToKilometers, secondsToMinutes } from "../utils/distance-calc.js";
import { Location, WebhookResponse } from "../types/index.js";

interface LocatorResult {
  closestLocation: Location;
  driveTimeMinutes: number;
  directDistanceKm: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

/**
 * Main function: Find closest location to a postcode and get drive time
 */
export async function findClosestLocation(postcode: string): Promise<LocatorResult> {
  console.log(`[Locator] Processing postcode: ${postcode}`);

  try {
    // Step 1: Geocode the input postcode
    console.log("[Locator] Step 1: Geocoding input postcode");
    const userCoords = await geocodePostcode(postcode);

    // Step 2: Load all predefined locations
    console.log("[Locator] Step 2: Loading and geocoding predefined locations");
    const locations = await loadLocations();

    if (locations.length === 0) {
      throw new Error("No locations configured");
    }

    // Step 3: Calculate straight-line distance to each location (for quick filtering)
    console.log("[Locator] Step 3: Calculating distances to all locations");
    const locationsWithDistance = locations.map((location) => {
      const distance = calculateHaversineDistance(
        userCoords.lat,
        userCoords.lng,
        location.latitude,
        location.longitude
      );
      return { location, distance };
    });

    // Sort by distance to find closest
    locationsWithDistance.sort((a, b) => a.distance - b.distance);
    const closestLocation = locationsWithDistance[0].location;

    console.log(`[Locator] Step 4: Closest location is ${closestLocation.name} (${closestLocation.id})`);

    // Step 4: Get actual drive time from Google Maps API
    console.log("[Locator] Step 5: Getting drive time from Google Maps");
    const originCoords = `${userCoords.lat},${userCoords.lng}`;
    const destinationCoords = `${closestLocation.latitude},${closestLocation.longitude}`;

    const driveTimes = await getDriveTimes(originCoords, [destinationCoords]);
    const driveTimeResult = driveTimes[0];

    if (driveTimeResult.duration.value === Infinity) {
      throw new Error("Could not calculate drive time");
    }

    const driveTimeMinutes = secondsToMinutes(driveTimeResult.duration.value);
    const directDistanceKm = metersToKilometers(driveTimeResult.distance.value);

    console.log(
      `[Locator] Success: ${closestLocation.name}, Drive time: ${driveTimeMinutes}min, Distance: ${directDistanceKm}km`
    );

    return {
      closestLocation,
      driveTimeMinutes,
      directDistanceKm,
      coordinates: {
        lat: userCoords.lat,
        lng: userCoords.lng,
      },
    };
  } catch (error) {
    console.error("[Locator] Error:", error);
    throw error;
  }
}

/**
 * Format result for webhook response
 */
export function formatWebhookResponse(result: LocatorResult): WebhookResponse {
  return {
    success: true,
    data: {
      closestLocation: {
        id: result.closestLocation.id,
        name: result.closestLocation.name,
        address: result.closestLocation.address,
        phone: result.closestLocation.phone,
      } as any,
      driveTimeMinutes: result.driveTimeMinutes,
      directDistanceKm: result.directDistanceKm,
      coordinates: result.coordinates,
    },
  };
}

/**
 * Format error response
 */
export function formatErrorResponse(error: Error | string): WebhookResponse {
  const message = error instanceof Error ? error.message : String(error);
  return {
    success: false,
    error: message,
  };
}
