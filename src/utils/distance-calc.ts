/**
 * utils/distance-calc.ts - Distance calculation utilities
 */

/**
 * Haversine formula to calculate straight-line distance between two coordinates
 * Returns distance in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert seconds to minutes, rounded up
 */
export function secondsToMinutes(seconds: number): number {
  return Math.ceil(seconds / 60);
}

/**
 * Convert meters to kilometers, rounded to 1 decimal place
 */
export function metersToKilometers(meters: number): number {
  return Math.round((meters / 1000) * 10) / 10;
}
