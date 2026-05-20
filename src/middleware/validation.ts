/**
 * middleware/validation.ts - Input validation and parsing middleware
 */

/**
 * Parse JSON safely, returning null on error
 */
function tryParseJson(text: string): any {
  if (!text || typeof text !== "string") return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Normalize UK postcode
 * Removes extra spaces and converts to uppercase
 */
export function normalizePostcode(postcode: string): string {
  return String(postcode || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

/**
 * Validate UK postcode format
 * Accepts postcodes with or without spaces: "SW1A1AA" or "SW1A 1AA"
 */
export function isValidUKPostcode(postcode: string): boolean {
  if (!postcode || typeof postcode !== "string") {
    return false;
  }

  const normalized = normalizePostcode(postcode);

  // UK postcodes are alphanumeric, 6-7 characters plus optional space
  // Pattern: letters and numbers only
  const pattern = /^[A-Z0-9]{1,4}\s?[A-Z0-9]{1,3}$/;

  return pattern.test(normalized);
}

/**
 * Extract postcode from various request formats
 * Handles multiple incoming formats from Wildix webhook
 */
export function extractPostcodeFromRequest(req: any): string {
  const candidates: string[] = [];

  // Debug logging
  console.log("[Parser] Request method:", req.method);
  console.log("[Parser] Request headers:", Object.keys(req.headers));
  console.log("[Parser] Request body type:", typeof req.body);
  console.log("[Parser] Request body value:", req.body);

  // === Try parsing raw text body (might be JSON string or form data) ===
  if (typeof req.body === "string") {
    // Try as JSON first
    const parsed = tryParseJson(req.body);
    if (parsed && typeof parsed === "object" && parsed.postcode) {
      candidates.push(parsed.postcode);
    }

    const trimmed = req.body.trim();

    // Try as form-encoded: "postcode=SW1A1AA"
    if (trimmed.startsWith("postcode=")) {
      const formValue = decodeURIComponent(
        trimmed.replace(/^postcode=/, "").replace(/\+/g, " ")
      );
      candidates.push(formValue);
    }

    // Try as raw postcode string (not JSON, not form-encoded)
    if (
      trimmed &&
      !trimmed.startsWith("{") &&
      !trimmed.startsWith("[") &&
      !trimmed.includes(":")
    ) {
      candidates.push(trimmed);
    }
  }

  // === Try parsed JSON body ===
  if (req.body && typeof req.body === "object" && req.body.postcode) {
    candidates.push(req.body.postcode);
  }

  // === Try query string ===
  if (req.query?.postcode) {
    candidates.push(req.query.postcode);
  }

  // === Try custom headers ===
  if (req.headers["x-postcode"]) {
    candidates.push(req.headers["x-postcode"]);
  }
  if (req.headers["postcode"]) {
    candidates.push(req.headers["postcode"]);
  }

  // === Find first valid candidate ===
  for (const candidate of candidates) {
    const normalized = normalizePostcode(candidate);
    if (normalized && isValidUKPostcode(normalized)) {
      console.log("[Parser] Extracted postcode:", normalized);
      return normalized;
    }
  }

  console.log("[Parser] No valid postcode found in candidates:", candidates);
  return "";
}

