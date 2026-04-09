// ─────────────────────────────────────────────────────────────────────────────
//  Dayton Relo — Analytics Helper (PostHog)
//
//  Usage:
//    import { track } from "../shared/analytics";
//    track("bah_calculated", { rank: "E-5", zip: "45431" });
//
//  All events are no-ops when the API key is not configured.
// ─────────────────────────────────────────────────────────────────────────────

import { usePostHog } from "posthog-react-native";

const API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? "";
const isConfigured = API_KEY.startsWith("phc_") && !API_KEY.includes("YOUR_");

// ── Typed event catalog ───────────────────────────────────────────────────────
//  Add new events here to keep tracking consistent across the app.
export type AnalyticsEvent =
  // Navigation
  | "screen_viewed"
  | "persona_selected"
  // DaytonBot chat
  | "chat_opened"
  | "chat_message_sent"
  | "chat_escalation_triggered"
  // Listings
  | "listing_viewed"
  | "property_saved"
  | "property_unsaved"
  // Calculators & tools
  | "bah_calculated"
  | "mortgage_calculated"
  | "rent_vs_buy_calculated"
  | "quiz_completed"
  // Lead / contact actions
  | "contact_agent_tapped"       // tapped call / email Chris
  | "va_lender_form_submitted"
  | "lead_submitted"
  // Auth
  | "signup_completed"
  | "login_completed"
  // Onboarding
  | "onboarding_started"
  | "onboarding_completed";

export type EventProperties = Record<string, string | number | boolean | null | undefined>;

// ── Standalone track helper (for use outside React components) ────────────────
//  In React components prefer the useAnalytics() hook below so PostHog
//  can auto-attach session / person context.
let _posthog: ReturnType<typeof usePostHog> | null = null;

export function _setPostHogInstance(ph: ReturnType<typeof usePostHog>) {
  _posthog = ph;
}

export function track(event: AnalyticsEvent, properties?: EventProperties) {
  if (!isConfigured) return;
  try {
    _posthog?.capture(event, properties);
  } catch {
    // Never let analytics crash the app
  }
}

export function identify(userId: string, traits?: EventProperties) {
  if (!isConfigured) return;
  try {
    _posthog?.identify(userId, traits);
  } catch {}
}

export function reset() {
  if (!isConfigured) return;
  try {
    _posthog?.reset();
  } catch {}
}

// ── React hook — preferred in components ─────────────────────────────────────
export function useAnalytics() {
  const posthog = usePostHog();

  function capture(event: AnalyticsEvent, properties?: EventProperties) {
    if (!isConfigured) return;
    try {
      posthog.capture(event, properties);
    } catch {}
  }

  return { capture };
}

export { isConfigured };
