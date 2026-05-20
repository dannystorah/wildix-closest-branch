#!/usr/bin/env node

/**
 * index.ts - Main Express server entry point
 *
 * This service receives UK postcodes via webhook and returns the closest
 * pre-defined location with drive time information from Google Maps API.
 */

import express from "express";
import { config } from "./config/environment.js";
import webhookRoutes from "./routes/webhook.js";

// ====================================
// Server Setup
// ====================================

const app = express();

// Middleware - capture raw text before JSON parsing
// This allows us to handle form-encoded and raw text payloads
app.use("/webhook", express.text({ type: () => true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[Express] ${req.method} ${req.path}`);
  next();
});

// ====================================
// Routes
// ====================================

// Mount webhook routes
app.use("/webhook", webhookRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    service: "wildix-closest-location",
    version: "1.0.0",
    description: "Find closest store/branch location by UK postcode with drive time",
    endpoints: {
      webhook: "POST /webhook/postcode",
      debug: "GET /webhook/debug",
      health: "GET /webhook/health",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Not found",
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[Express] Error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// ====================================
// Server Initialization
// ====================================

async function runServer() {
  try {
    app.listen(config.PORT, () => {
      console.log(`[Server] Starting Wildix Closest Location service`);
      console.log(`[Server] Listening on port ${config.PORT}`);
      console.log(`[Server] Environment: ${config.NODE_ENV}`);
      console.log(`[Server] Ready to receive webhook requests at POST /webhook/postcode`);
    });
  } catch (error) {
    console.error("[Server] Fatal error:", error);
    process.exit(1);
  }
}

runServer();


