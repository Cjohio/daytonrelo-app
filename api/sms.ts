// ─────────────────────────────────────────────
//  SMS Notifications — via Supabase Edge Function
//  Twilio credentials now live in Supabase Vault (server-side only).
//  This file no longer touches Twilio directly — no secrets in the bundle.
// ─────────────────────────────────────────────

import { supabase } from "../lib/supabase";
import { LeadFormData } from "../shared/types/lead";

/**
 * Notify the agent about a new lead via SMS.
 * Delegates to the `notify-lead` Supabase Edge Function which holds
 * Twilio credentials securely in Supabase Vault.
 */
export async function sendAgentSMS(data: LeadFormData): Promise<void> {
  const { error } = await supabase.functions.invoke("notify-lead", {
    body: {
      name:         data.name,
      email:        data.email,
      phone:        data.phone,
      employer:     data.employer || undefined,
      moveTimeline: data.moveTimeline,
      message:      data.message  || undefined,
    },
  });

  if (error) {
    // Non-fatal — log so it can be traced, but don't crash the lead flow
    console.error("[SMS] Edge Function call failed:", error);
    throw new Error(`[SMS] notify-lead failed: ${error.message}`);
  }

  console.info("[SMS] Agent notification dispatched via Edge Function.");
}
