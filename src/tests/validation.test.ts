/**
 * tests/validation.test.ts - Test postcode validation and extraction
 */

import { isValidUKPostcode, normalizePostcode, extractPostcodeFromRequest } from "../middleware/validation.js";

console.log("========================================");
console.log("Testing UK Postcode Validation");
console.log("========================================\n");

// Test valid postcodes
const validPostcodes = [
  "SW1A 1AA",
  "SW1A1AA",
  "M1 1AD",
  "EH8 8DX",
  "B33 8TH",
  "CR2 6XH",
  "EC1A 1BB",
];

console.log("Testing VALID postcodes:");
validPostcodes.forEach((postcode) => {
  const result = isValidUKPostcode(postcode);
  const normalized = normalizePostcode(postcode);
  console.log(`  ${postcode} -> ${normalized} [${result ? "✓" : "✗"}]`);
});

// Test invalid postcodes
const invalidPostcodes = [
  "INVALID",
  "123456",
  "A",
  "",
  "SW1A 1AA 1AA",
  "12345",
];

console.log("\nTesting INVALID postcodes:");
invalidPostcodes.forEach((postcode) => {
  const result = isValidUKPostcode(postcode);
  console.log(`  "${postcode}" -> ${result ? "✗ (Should be invalid)" : "✓ (Correctly rejected)"}`);
});

// Test postcode extraction from various formats
console.log("\nTesting postcode extraction from request formats:");

const testRequests = [
  {
    name: "JSON body",
    body: { postcode: "SW1A 1AA" },
    expected: "SW1A 1AA",
  },
  {
    name: "JSON string body",
    body: '{"postcode": "M1 1AD"}',
    expected: "M1 1AD",
  },
  {
    name: "Form-encoded body",
    body: "postcode=EH8+8DX",
    expected: "EH8 8DX",
  },
  {
    name: "Raw text body",
    body: "B33 8TH",
    expected: "B33 8TH",
  },
  {
    name: "Query string",
    query: { postcode: "EC1A 1BB" },
    expected: "EC1A 1BB",
  },
  {
    name: "Custom header",
    headers: { "x-postcode": "CR2 6XH" },
    expected: "CR2 6XH",
  },
];

testRequests.forEach(({ name, body, query, headers, expected }) => {
  const req: any = { body, query: query || {}, headers: headers || {} };
  const extracted = extractPostcodeFromRequest(req);
  const success = extracted === expected;
  console.log(`  ${name}: "${extracted}" [${success ? "✓" : "✗"}]`);
});

console.log("\n========================================");
console.log("Validation Tests Complete");
console.log("========================================\n");
