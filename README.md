# Wildix Closest Location Service

A standalone Node.js service that receives UK postcodes via webhook and returns the closest pre-defined store/branch location with current drive time information from Google Maps API.

## How It Works

```
Customer sends postcode → Service geocodes it → Finds closest location → Gets drive time → Returns result
```

## Quick Start (5 Steps)

### Step 1: Clone the Repository

```bash
git clone <this-repo>
cd wildix-closest-branch
```

### Step 2: Configure Your Store Locations

Copy the example file and add your actual store/branch locations:

```bash
cp locations.example.json config/locations.json
```

Edit `config/locations.json` and add your locations:

```json
{
  "locations": [
    {
      "id": "store_001",
      "name": "Your Store Name",
      "postcode": "SW1A 1AA",
      "latitude": 51.5007,
      "longitude": -0.1246,
      "phone": "+44 20 XXXX XXXX"
    }
  ]
}
```

**To get latitude/longitude:**
- Use Google Maps: right-click on location → coordinates appear
- Or use: https://www.latlong.net/

### Step 3: Setup Environment Variables

Copy the environment template and add your Google Maps API key:

```bash
cp .env.example .env
```

Edit `.env` and add your Google Maps API key:

```
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
```

**To get a Google Maps API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable these APIs:
   - Geocoding API
   - Distance Matrix API
4. Create an API key (under Credentials)
5. Paste it in `.env`

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Start the Service

```bash
npm start
```

You should see:
```
[Server] Starting Wildix Closest Location service
[Server] Listening on port 3000
[Server] Ready to receive webhook requests at POST /webhook/postcode
```

## API Endpoints

### POST /webhook/postcode

Receive a UK postcode and get the closest location with drive time.

**Flexible input formats** - The service accepts postcodes in multiple formats:

1. **JSON body:**
```bash
curl -X POST http://localhost:3000/webhook/postcode \
  -H "Content-Type: application/json" \
  -d '{"postcode": "SW1A 1AA"}'
```

2. **Form-encoded:**
```bash
curl -X POST http://localhost:3000/webhook/postcode \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "postcode=SW1A1AA"
```

3. **Query string:**
```bash
curl -X POST http://localhost:3000/webhook/postcode?postcode=SW1A1AA
```

4. **Custom headers:**
```bash
curl -X POST http://localhost:3000/webhook/postcode \
  -H "x-postcode: SW1A1AA"
```

5. **Raw text:**
```bash
curl -X POST http://localhost:3000/webhook/postcode \
  -H "Content-Type: text/plain" \
  -d "SW1A1AA"
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "closestLocation": {
      "id": "store_001",
      "name": "London HQ",
      "postcode": "SW1A 1AA",
      "phone": "+44 20 7946 0958"
    },
    "driveTimeMinutes": 15,
    "directDistanceKm": 2.3,
    "coordinates": {
      "lat": 51.5007,
      "lng": -0.1246
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid UK postcode format"
}
```

### GET /webhook/debug

Debug endpoint to see what's arriving in webhook requests. Useful for troubleshooting format issues.

**Request:**
```bash
curl http://localhost:3000/webhook/debug
```

**Response:**
```json
{
  "method": "GET",
  "url": "/webhook/debug",
  "headers": { ... },
  "query": { ... },
  "bodyType": "string",
  "body": "SW1A1AA",
  "bodyParsed": null,
  "detectedPostcode": "SW1A 1AA"
}
```

### GET /webhook/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "wildix-closest-location"
}
```

### GET /

Service information.

```json
{
  "service": "wildix-closest-location",
  "version": "1.0.0",
  "description": "Find closest store/branch location by UK postcode with drive time",
  "endpoints": {
    "webhook": "POST /webhook/postcode",
    "debug": "GET /webhook/debug",
    "health": "GET /webhook/health"
  }
}
```

## Integrating with Wildix

When Wildix needs to find the closest location for a customer, the webhook endpoint accepts postcodes in **multiple formats**:

1. **Configure the Wildix webhook** - Choose any format that works with your system:
   - **JSON format (recommended):**
     - Endpoint: `http://your-server:3000/webhook/postcode`
     - Method: `POST`
     - Content-Type: `application/json`
     - Body: `{"postcode": "<customer_postcode>"}`
   
   - **Form-encoded format:**
     - Content-Type: `application/x-www-form-urlencoded`
     - Body: `postcode=<customer_postcode>`
   
   - **Query string format:**
     - URL: `http://your-server:3000/webhook/postcode?postcode=<customer_postcode>`
     - Method: `POST` or `GET`
   
   - **Header format:**
     - Header: `x-postcode: <customer_postcode>`
   
   - **Raw text format:**
     - Content-Type: `text/plain`
     - Body: `<customer_postcode>`

2. **Parse the response** to get:
   - `closestLocation`: name, address, phone of the closest store
   - `driveTimeMinutes`: estimated drive time
   - `directDistanceKm`: straight-line distance
   - `coordinates`: GPS coordinates of the customer's postcode

3. **Troubleshooting** - If you're unsure what format is arriving:
   - Use the debug endpoint: `GET /webhook/debug` or `POST /webhook/debug`
   - It will show you exactly what was received and what postcode was detected

## Customizing Locations

Edit `config/locations.json` to add, remove, or update locations. The service will automatically reload the locations on restart.

**Required fields:**
- `id`: Unique identifier (e.g., "store_001")
- `name`: Store/branch name
- `postcode`: UK postcode
- `latitude`: Location latitude
- `longitude`: Location longitude

**Optional fields:**
- `phone`: Store phone number

## Development

Run with live reload:

```bash
npm run dev
```

## Troubleshooting

**"GOOGLE_MAPS_API_KEY environment variable is not set"**
- Make sure `.env` file exists with your API key

**"Locations config not found at config/locations.json"**
- Copy `locations.example.json` to `config/locations.json`
- Add your store locations

**"Invalid UK postcode format"**
- Postcode must be alphanumeric, 6-7 characters (without spaces)
- Valid examples: "SW1A1AA", "M11AD", "EH13AA"

**"No results found for postcode"**
- Verify the postcode is a valid UK postcode
- Check your Google Maps API key has Geocoding API enabled

**"Cannot calculate distance"**
- Verify your store locations have correct latitude/longitude
- Check your Google Maps API key has Distance Matrix API enabled

## Deployment

### Docker (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t wildix-closest-location .
docker run -p 3000:3000 --env-file .env wildix-closest-location
```

### Traditional Server

1. Install Node.js 18+
2. Clone repo
3. Configure locations and .env
4. `npm install && npm run build`
5. Use `pm2` or similar to keep the service running
6. Ensure firewall allows port 3000

## License

MIT

## Support

For issues or questions, contact your Wildix administrator.
