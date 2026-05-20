/**
 * middleware/validation.ts - Input validation middleware
 */

/**
 * Validate UK postcode format
 * Simple check for basic UK postcode pattern
 * Full validation: ANAAN NAA, where A=letter, N=number
 * But we accept a simpler pattern for robustness
 */
export function isValidUKPostcode(postcode: string): boolean {
  if (!postcode || typeof postcode !== "string") {
    return false;
  }

  // Remove spaces and convert to uppercase
  const normalized = postcode.trim().toUpperCase().replace(/\s+/g, "");

  // UK postcodes are alphanumeric, 6-7 characters (after removing spaces)
  // Basic validation - just check it's alphanumeric and reasonable length
  const pattern = /^[A-Z0-9]{6,7}$/;

  return pattern.test(normalized);
}

/**
 * Normalize UK postcode for geocoding
 * Adds back space before final 2 digits if missing
 */
export function normalizePostcode(postcode: string): string {
  const cleaned = postcode.trim().toUpperCase().replace(/\s+/g, "");

  // Standard UK postcode format: ANAAN NAA
  // We'll add space before last 3 characters if it's long enough
  if (cleaned.length >= 6) {
    return `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}`;
  }

  return cleaned;
}
