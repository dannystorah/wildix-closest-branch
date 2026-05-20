/**
 * routes/webhook.ts - Webhook endpoint for postcode requests
 */

import { Router, Request, Response } from "express";
import { findClosestLocation, formatWebhookResponse, formatErrorResponse } from "../services/locator.js";
import { isValidUKPostcode, normalizePostcode, extractPostcodeFromRequest } from "../middleware/validation.js";
import { WebhookRequest, WebhookResponse } from "../types/index.js";

const router = Router();

/**
 * POST /webhook/postcode
 *
 * Accept a UK postcode in multiple formats and return the closest predefined location with drive time
 *
 * Accepts postcode from:
 * - JSON body: { "postcode": "SW1A 1AA" }
 * - Form data: postcode=SW1A1AA
 * - Query string: ?postcode=SW1A1AA
 * - Headers: x-postcode or postcode
 * - Raw text: SW1A1AA
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

    // Extract postcode from any format
    const postcode = extractPostcodeFromRequest(req);

    if (!postcode) {
      const response: WebhookResponse = formatErrorResponse(
        "Missing or invalid postcode. Provide via JSON body, form data, query string, headers, or raw text."
      );
      return res.status(400).json(response);
    }

    console.log(`[Webhook] Processing postcode: ${postcode}`);

    // Find closest location and get drive time
    const result = await findClosestLocation(postcode);

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
 * GET /webhook/debug
 * Debug endpoint to inspect what's arriving in the webhook request
 * Useful for troubleshooting format issues
 */
router.get("/debug", (req: Request, res: Response) => {
  const debugInfo: any = {
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    query: req.query,
    bodyType: typeof req.body,
    body: req.body,
  };

  // Try to parse body if it's a string
  if (typeof req.body === "string") {
    try {
      debugInfo.bodyParsed = JSON.parse(req.body);
    } catch {
      debugInfo.bodyParsed = null;
    }
  }

  // Extract what we detected
  debugInfo.detectedPostcode = extractPostcodeFromRequest(req) || null;

  res.json(debugInfo);
});

/**
 * POST /webhook/debug
 * Debug endpoint for POST requests as well
 */
router.post("/debug", (req: Request, res: Response) => {
  const debugInfo: any = {
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    query: req.query,
    bodyType: typeof req.body,
    body: req.body,
  };

  // Try to parse body if it's a string
  if (typeof req.body === "string") {
    try {
      debugInfo.bodyParsed = JSON.parse(req.body);
    } catch {
      debugInfo.bodyParsed = null;
    }
  }

  // Extract what we detected
  debugInfo.detectedPostcode = extractPostcodeFromRequest(req) || null;

  res.json(debugInfo);
});

/**
 * GET /health
 * Simple health check endpoint
 */
router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "wildix-closest-location" });
});

export default router;

