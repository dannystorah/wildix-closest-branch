/**
 * utils/locations-loader.ts - Load locations from config file and geocode addresses
 */

import * as fs from "fs";
import * as path from "path";
import { Location, LocationInput, LocationsConfig } from "../types/index.js";
import { geocodeAddress } from "../services/geocoding.js";

const LOCATIONS_FILE = path.join(process.cwd(), "config", "locations.json");

let cachedLocations: Location[] | null = null;

/**
 * Load locations from config/locations.json and geocode addresses
 * Addresses are converted to coordinates on startup and cached
 */
export async function loadLocations(): Promise<Location[]> {
  if (cachedLocations) {
    return cachedLocations;
  }

  try {
    if (!fs.existsSync(LOCATIONS_FILE)) {
      console.error(
        `[Locations] File not found: ${LOCATIONS_FILE}`
      );
      throw new Error(
        `Locations config not found at ${LOCATIONS_FILE}. Please create config/locations.json`
      );
    }

    const fileContent = fs.readFileSync(LOCATIONS_FILE, "utf-8");
    const config = JSON.parse(fileContent);

    if (!config.locations || !Array.isArray(config.locations)) {
      throw new Error("locations.json must contain a 'locations' array");
    }

    if (config.locations.length === 0) {
      throw new Error("locations.json must contain at least one location");
    }

    console.log(`[Locations] Loading ${config.locations.length} locations...`);

    // Geocode each location's address to get coordinates
    const locationsWithCoords: Location[] = [];
    for (const inputLocation of config.locations as LocationInput[]) {
      try {
        console.log(`[Locations] Geocoding: ${inputLocation.name} (${inputLocation.address})`);
        
        const coords = await geocodeAddress(inputLocation.address);
        
        const location: Location = {
          ...inputLocation,
          latitude: coords.lat,
          longitude: coords.lng,
        };
        
        locationsWithCoords.push(location);
        console.log(`[Locations] ✓ ${inputLocation.name}: ${coords.lat}, ${coords.lng}`);
      } catch (error) {
        console.error(
          `[Locations] Failed to geocode ${inputLocation.name} (${inputLocation.address}):`,
          error
        );
        throw new Error(
          `Could not geocode location "${inputLocation.name}" with address "${inputLocation.address}". Check the address is valid.`
        );
      }
    }

    cachedLocations = locationsWithCoords;
    console.log(`[Locations] Successfully loaded and geocoded ${locationsWithCoords.length} locations`);
    return cachedLocations;
  } catch (error) {
    console.error("[Locations] Error loading locations:", error);
    throw error;
  }
}

/**
 * Get a single location by ID
 */
export function getLocationById(id: string): Location | undefined {
  if (!cachedLocations) {
    throw new Error("Locations not loaded. Call loadLocations() first.");
  }
  return cachedLocations.find((loc) => loc.id === id);
}

/**
 * Refresh location cache (will re-geocode on next load)
 */
export function refreshLocations(): void {
  cachedLocations = null;
}

