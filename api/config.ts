// ─────────────────────────────────────────────
//  Dayton Relo — API Configuration
//  Values are pulled from .env (copy .env.example)
// ─────────────────────────────────────────────

export const API_CONFIG = {
  // NOTE: Claude API key and Twilio credentials have been moved to Supabase Vault.
  // They are no longer needed here — the app calls Edge Functions instead.
  // See: supabase/functions/daytonbot/index.ts
  //      supabase/functions/notify-lead/index.ts

  simplyRETS: {
    baseURL:   "https://api.simplyrets.com",
    // SimplyRETS sandbox creds work out-of-the-box for testing.
    // Replace with production creds from https://simplyrets.com/accounts
    user:      process.env.EXPO_PUBLIC_SIMPLYRETS_USER     ?? "simplyrets",
    password:  process.env.EXPO_PUBLIC_SIMPLYRETS_PASSWORD ?? "simplyrets",
    // Dayton-area MLS area filter (used by default in queries)
    defaultCities: ["Dayton", "Beavercreek", "Fairborn", "Kettering", "Centerville", "Miamisburg"],
  },

  crm: {
    // Zapier-compatible POST endpoint — paste your webhook URL in .env
    webhookURL: process.env.EXPO_PUBLIC_CRM_WEBHOOK_URL ?? "",
    appVersion: "1.0.0",
  },

  chat: {
    intercomAppId: process.env.EXPO_PUBLIC_INTERCOM_APP_ID ?? "",
    tidioKey:      process.env.EXPO_PUBLIC_TIDIO_KEY        ?? "",
  },

  fred: {
    // Free API key from https://fred.stlouisfed.org/docs/api/api_key.html
    // Powers the live mortgage rate widget. Falls back to estimates if blank.
    apiKey: process.env.EXPO_PUBLIC_FRED_API_KEY ?? "",
  },

  trestle: {
    // CoreLogic Trestle — RESO Web API (MLS feed via DABR membership)
    // Get credentials from DABR: https://www.dabr.com
    // OAuth2 client credentials — replace placeholders with real values
    clientId:     process.env.EXPO_PUBLIC_TRESTLE_CLIENT_ID     ?? "",
    clientSecret: process.env.EXPO_PUBLIC_TRESTLE_CLIENT_SECRET ?? "",
    baseURL:      process.env.EXPO_PUBLIC_TRESTLE_BASE_URL       ?? "https://api-prod.corelogic.com/trestle",
    tokenURL:     process.env.EXPO_PUBLIC_TRESTLE_TOKEN_URL      ?? "https://api-prod.corelogic.com/trestle/oidc/connect/token",
    defaultCities: ["Dayton", "Beavercreek", "Fairborn", "Kettering", "Centerville", "Miamisburg", "Springboro", "Oakwood"],
  },
} as const;
