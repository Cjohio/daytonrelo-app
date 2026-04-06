// ─────────────────────────────────────────────
//  Dayton Relo — API Configuration
//  Values are pulled from .env (copy .env.example)
// ─────────────────────────────────────────────

export const API_CONFIG = {
  claude: {
    // Get your key at https://console.anthropic.com
    apiKey: process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? "",
  },

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

  sms: {
    // Twilio credentials — https://console.twilio.com
    twilioAccountSid:  process.env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID  ?? "",
    twilioAuthToken:   process.env.EXPO_PUBLIC_TWILIO_AUTH_TOKEN    ?? "",
    twilioFromNumber:  process.env.EXPO_PUBLIC_TWILIO_FROM_NUMBER   ?? "",
    // Agent's phone receives SMS for every lead submission
    agentPhone:        process.env.EXPO_PUBLIC_AGENT_PHONE          ?? "",
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
} as const;
