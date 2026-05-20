# Webhook Parsing Enhancement Summary

## What Changed

The webhook handler has been updated to accept postcodes in **multiple flexible formats**, matching the robust parsing from the original `index.js` prototype. This ensures compatibility with how Wildix may send webhook data.

## Supported Input Formats

### 1. JSON Body (Recommended)
```bash
curl -X POST http://localhost:3000/webhook/postcode \
  -H "Content-Type: application/json" \
  -d '{"postcode": "SW1A 1AA"}'
```

### 2. Form-Encoded Data
```bash
curl -X POST http://localhost:3000/webhook/postcode \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "postcode=SW1A1AA"
```

### 3. Query String Parameter
```bash
curl -X POST http://localhost:3000/webhook/postcode?postcode=SW1A1AA
```

### 4. Custom Headers
```bash
curl -X POST http://localhost:3000/webhook/postcode \
  -H "x-postcode: SW1A1AA" \
  -H "postcode: SW1A1AA"
```

### 5. Raw Text Body
```bash
curl -X POST http://localhost:3000/webhook/postcode \
  -H "Content-Type: text/plain" \
  -d "SW1A1AA"
```

## Implementation Details

### Modified Files

**1. `/src/middleware/validation.ts`**
- Added `extractPostcodeFromRequest(req)` - Intelligently extracts postcode from any location
- Enhanced `normalizePostcode()` - Preserves spaces and handles case normalization
- Enhanced `isValidUKPostcode()` - More flexible UK postcode validation
- Added `tryParseJson()` - Safe JSON parsing utility

**2. `/src/index.ts`**
- Added `express.text({ type: () => true })` middleware on `/webhook` routes
- Captures raw text bodies before JSON/form parsing
- Allows proper handling of multiple content types

**3. `/src/routes/webhook.ts`**
- Updated `POST /webhook/postcode` to use `extractPostcodeFromRequest()`
- Added `GET /webhook/debug` endpoint for troubleshooting
- Added `POST /webhook/debug` endpoint for troubleshooting
- Improved error messages with format hints

**4. `/README.md`**
- Documented all 5 input formats with examples
- Added debug endpoint documentation
- Updated Wildix integration section
- Added troubleshooting guidance

## How It Works

The `extractPostcodeFromRequest()` function tries multiple locations in this order:

1. **Raw text body** (if not JSON/form)
   - Tries JSON parsing first
   - Then checks for form-encoded `postcode=XXX`
   - Then treats entire body as postcode string

2. **Parsed JSON body** - `body.postcode`

3. **Query string** - `?postcode=XXX`

4. **Headers**
   - `x-postcode` header
   - `postcode` header

5. **Returns** the first valid, normalized UK postcode found

## Postcode Validation

Validates UK postcodes in formats:
- `SW1A1AA` (no space)
- `SW1A 1AA` (with space)
- Alphanumeric, 6-7 characters
- Case-insensitive

## Debug Endpoint

For troubleshooting, use the `/webhook/debug` endpoint:

```bash
curl http://localhost:3000/webhook/debug
```

Returns:
```json
{
  "method": "GET",
  "headers": { ... },
  "bodyType": "string",
  "body": "SW1A1AA",
  "bodyParsed": null,
  "detectedPostcode": "SW1A 1AA"
}
```

This shows exactly what was received and what postcode was detected.

## Benefits

- ✅ Works with Wildix regardless of webhook format it sends
- ✅ Backward compatible with JSON-only implementations
- ✅ Form-encoded data from HTML forms handled automatically
- ✅ Query strings, headers, and raw text all supported
- ✅ Clear debug endpoint for troubleshooting
- ✅ Comprehensive logging for monitoring
