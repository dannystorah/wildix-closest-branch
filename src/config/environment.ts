/**
 * config/environment.ts - Environment variables & configuration
 *
 * Loads and validates environment variables from .env file
 */

import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (!value && !defaultValue) {
    console.error(`Environment variable ${name} is not set`);
    process.exit(1);
  }
  return value || defaultValue || "";
}

export const config = {
  GOOGLE_MAPS_API_KEY: getEnvVar("GOOGLE_MAPS_API_KEY"),
  PORT: parseInt(getEnvVar("PORT", "3000")),
  NODE_ENV: getEnvVar("NODE_ENV", "development"),
  LOG_LEVEL: getEnvVar("LOG_LEVEL", "info"),
};
