/**
 * utils/locations-loader.ts - Load locations from config file
 */

import * as fs from "fs";
import * as path from "path";
import { Location, LocationsConfig } from "../types/index.js";

const LOCATIONS_FILE = path.join(process.cwd(), "config", "locations.json");

let cachedLocations: Location[] | null = null;

/**
 * Load locations from config/locations.json
 * Caches the result to avoid repeated file reads
 */
export function loadLocations(): Location[] {
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
    const config: LocationsConfig = JSON.parse(fileContent);

    if (!config.locations || !Array.isArray(config.locations)) {
      throw new Error("locations.json must contain a 'locations' array");
    }

    if (config.locations.length === 0) {
      throw new Error("locations.json must contain at least one location");
    }

    cachedLocations = config.locations;
    console.log(`[Locations] Loaded ${config.locations.length} locations`);
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
  const locations = loadLocations();
  return locations.find((loc) => loc.id === id);
}

/**
 * Refresh location cache (useful if config file is updated)
 */
export function refreshLocations(): void {
  cachedLocations = null;
}
