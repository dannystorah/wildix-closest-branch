/**
 * services/distance.ts - Get drive times from Google Distance Matrix API
 */

import { googleApiRequest } from "../utils/api-client.js";
import { DistanceMatrixResult } from "../types/index.js";
import { metersToKilometers, secondsToMinutes } from "../utils/distance-calc.js";

/**
 * Get drive time and distance between two locations
 * origin and destination should be "lat,lng" format
 */
export async function getDriveTime(
  origin: string,
  destination: string
): Promise<DistanceMatrixResult> {
  try {
    console.log(`[Distance] Calculating drive time from ${origin} to ${destination}`);

    const response = await googleApiRequest("maps/api/distancematrix/json", {
      origins: origin,
      destinations: destination,
      mode: "driving",
    });

    if (response.status !== "OK") {
      throw new Error(`Distance Matrix API error: ${response.error_message}`);
    }

    if (!response.rows || response.rows.length === 0) {
      throw new Error("No results from Distance Matrix API");
    }

    const row = response.rows[0];
    if (!row.elements || row.elements.length === 0) {
      throw new Error("No distance elements found");
    }

    const element = row.elements[0];

    if (element.status !== "OK") {
      throw new Error(`Cannot calculate distance: ${element.status}`);
    }

    const result: DistanceMatrixResult = {
      distance: {
        value: element.distance.value, // meters
        text: element.distance.text,
      },
      duration: {
        value: element.duration.value, // seconds
        text: element.duration.text,
      },
    };

    console.log(
      `[Distance] Result: ${result.distance.text}, ${result.duration.text}`
    );

    return result;
  } catch (error) {
    console.error("[Distance] Error:", error);
    throw error;
  }
}

/**
 * Get drive times from origin to multiple destinations
 * Returns array of drive times in same order as destinations
 */
export async function getDriveTimes(
  origin: string,
  destinations: string[]
): Promise<DistanceMatrixResult[]> {
  try {
    if (destinations.length === 0) {
      throw new Error("No destinations provided");
    }

    console.log(
      `[Distance] Calculating drive times to ${destinations.length} location(s)`
    );

    const response = await googleApiRequest("maps/api/distancematrix/json", {
      origins: origin,
      destinations: destinations.join("|"),
      mode: "driving",
    });

    if (response.status !== "OK") {
      throw new Error(`Distance Matrix API error: ${response.error_message}`);
    }

    if (!response.rows || response.rows.length === 0) {
      throw new Error("No results from Distance Matrix API");
    }

    const row = response.rows[0];
    const results: DistanceMatrixResult[] = [];

    row.elements.forEach((element: any, index: number) => {
      if (element.status === "OK") {
        results.push({
          distance: {
            value: element.distance.value,
            text: element.distance.text,
          },
          duration: {
            value: element.duration.value,
            text: element.duration.text,
          },
        });
      } else {
        console.warn(
          `[Distance] Warning: Could not calculate distance to destination ${index}: ${element.status}`
        );
        results.push({
          distance: { value: Infinity, text: "N/A" },
          duration: { value: Infinity, text: "N/A" },
        });
      }
    });

    return results;
  } catch (error) {
    console.error("[Distance] Error:", error);
    throw error;
  }
}
