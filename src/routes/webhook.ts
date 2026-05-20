/**
 * routes/webhook.ts - Webhook endpoint for postcode requests
 */

import { Router, Request, Response } from "express";
import { findClosestLocation, formatWebhookResponse, formatErrorResponse } from "../services/locator.js";
import { isValidUKPostcode, normalizePostcode } from "../middleware/validation.js";
import { WebhookRequest, WebhookResponse } from "../types/index.js";

const router = Router();

/**
 * POST /webhook/postcode
 * 
 * Accept a UK postcode and return the closest predefined location with drive time
 * 
 * Request body:
 * {
 *   "postcode": "SW1A 1AA"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "closestLocation": { ... },
 *     "driveTimeMinutes": 15,
 *     "directDistanceKm": 2.3,
 *     "coordinates": { "lat": 51.5, "lng": -0.12 }
 *   }
 * }
 */
router.post("/postcode", async (req: Request, res: Response) => {
  try {
    console.log("[Webhook] POST /webhook/postcode");
    console.log("[Webhook] Request body:", JSON.stringify(req.body));

    // Extract and validate postcode
    const body = req.body as Partial<WebhookRequest>;
    const postcode = body.postcode;

    if (!postcode || typeof postcode !== "string") {
      const response: WebhookResponse = formatErrorResponse("Missing required field: postcode");
      return res.status(400).json(response);
    }

    // Validate postcode format
    if (!isValidUKPostcode(postcode)) {
      const response: WebhookResponse = formatErrorResponse("Invalid UK postcode format");
      return res.status(400).json(response);
    }

    // Normalize postcode for geocoding
    const normalizedPostcode = normalizePostcode(postcode);
    console.log(`[Webhook] Normalized postcode: ${normalizedPostcode}`);

    // Find closest location and get drive time
    const result = await findClosestLocation(normalizedPostcode);

    // Format successful response
    const response = formatWebhookResponse(result);
    console.log("[Webhook] Response:", JSON.stringify(response));

    return res.json(response);
  } catch (error) {
    console.error("[Webhook] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    const response = formatErrorResponse(errorMessage);

    return res.status(500).json(response);
  }
});

/**
 * GET /health
 * Simple health check endpoint
 */
router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "wildix-closest-location" });
});

export default router;
