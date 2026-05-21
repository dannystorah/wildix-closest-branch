/**
 * tests/maps-url.test.ts - Test Google Maps URL generation
 */

import { generateMapsUrl } from "../utils/maps-url.js";

console.log("========================================");
console.log("Testing Google Maps URL Generation");
console.log("========================================\n");

const testCases = [
  {
    name: "London coordinates",
    lat: 51.5074,
    lng: -0.1278,
    label: "London HQ",
  },
  {
    name: "New York coordinates",
    lat: 40.7128,
    lng: -74.006,
    label: "New York Office",
  },
  {
    name: "Coordinates with special characters",
    lat: 48.8566,
    lng: 2.3522,
    label: "Café & Restaurant",
  },
  {
    name: "Very precise coordinates",
    lat: 51.50735091,
    lng: -0.12775829,
    label: "Exact Location",
  },
];

console.log("Testing Maps URL generation:");
testCases.forEach(({ name, lat, lng, label }) => {
  const url = generateMapsUrl(lat, lng, label);
  const isValid = url.startsWith("https://maps.google.com");
  const hasCoords = url.includes(lat.toString()) && url.includes(lng.toString());

  console.log(`  ${name}`);
  console.log(`    URL: ${url}`);
  console.log(`    Valid URL: ${isValid ? "✓" : "✗"}`);
  console.log(`    Contains coords: ${hasCoords ? "✓" : "✗"}\n`);
});

console.log("========================================");
console.log("Maps URL Generation Tests Complete");
console.log("========================================\n");
