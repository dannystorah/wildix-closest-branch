/**
 * tests/distance.test.ts - Test distance calculations
 */

import { calculateHaversineDistance, metersToKilometers } from "../utils/distance-calc.js";

console.log("========================================");
console.log("Testing Distance Calculations");
console.log("========================================\n");

// Test cases with known distances
const testCases = [
  {
    name: "London to Paris (approx 345 km)",
    from: { lat: 51.5074, lng: -0.1278 },
    to: { lat: 48.8566, lng: 2.3522 },
    expectedKm: 345,
    tolerance: 10,
  },
  {
    name: "New York to Los Angeles (approx 4000 km)",
    from: { lat: 40.7128, lng: -74.006 },
    to: { lat: 34.0522, lng: -118.2437 },
    expectedKm: 4000,
    tolerance: 50,
  },
  {
    name: "Same location (0 km)",
    from: { lat: 51.5, lng: 0.1 },
    to: { lat: 51.5, lng: 0.1 },
    expectedKm: 0,
    tolerance: 0.1,
  },
  {
    name: "1 km apart",
    from: { lat: 51.5, lng: 0.1 },
    to: { lat: 51.5091, lng: 0.1 },
    expectedKm: 1,
    tolerance: 0.1,
  },
];

console.log("Testing Haversine distance calculations:");
testCases.forEach(({ name, from, to, expectedKm, tolerance }) => {
  const distanceMeters = calculateHaversineDistance(from.lat, from.lng, to.lat, to.lng);
  const distanceKm = metersToKilometers(distanceMeters);
  const error = Math.abs(distanceKm - expectedKm);
  const success = error <= tolerance;

  console.log(`  ${name}`);
  console.log(`    Calculated: ${distanceKm.toFixed(2)} km (${distanceMeters.toFixed(0)} m)`);
  console.log(`    Expected: ${expectedKm} km (±${tolerance} km)`);
  console.log(`    Error: ${error.toFixed(2)} km [${success ? "✓" : "✗"}]\n`);
});

console.log("========================================");
console.log("Distance Calculation Tests Complete");
console.log("========================================\n");
