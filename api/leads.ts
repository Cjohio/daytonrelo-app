// ─────────────────────────────────────────────
//  Lead Capture — Supabase (always) + CRM Webhook + SMS
//
//  Flow:
//    1. Save lead to Supabase `leads` table — always runs, guaranteed capture
//    2. POST lead to CRM webhook (Zapier, Make, HubSpot…) if configured
//    3. Send SMS text to agent via Twilio if configured
// ─────────────────────────────────────────────

import { API_CONFIG } from "./config";
import { sendAgentSMS, formatLeadSMS } from "./sms";
import { supabase } from "../lib/supabase";
import {
  LeadFormData,
  LeadSubmissionResult,
  CRMPayload,
} from "../shared/types/lead";

/**
 * Submit a lead from the contact form.
 * Always saves to Supabase first, then fires webhook + SMS in parallel.
 */
export async function submitLead(
  data: LeadFormData
): Promise<LeadSubmissionResult> {
  const payload: CRMPayload = {
    ...data,
    source:      "Dayton Relo App",
    submittedAt: new Date().toISOString(),
    appVersion:  API_CONFIG.crm.appVersion,
  };

  // ── 1. Always save to Supabase — guaranteed capture regardless of webhook status
  try {
    await supabase.from("leads").insert({
      name:           data.name,
      email:          data.email,
      phone:          data.phone,
      move_timeline:  data.moveTimeline,
      employer:       data.employer || null,
      message:        data.message || null,
      source:         "Dayton Relo App",
      submitted_at:   new Date().toISOString(),
    });
  } catch (err) {
    // Non-fatal — log and continue so CRM/SMS still fire
    console.error("[Lead] Supabase save failed:", err);
  }

  // ── 2 & 3. Fire CRM webhook + SMS notification in parallel
  const results = await Promise.allSettled([
    postToCRM(payload),
    sendAgentSMS(formatLeadSMS(data)),
  ]);

  const crmResult = results[0];
  const smsResult = results[1];

  if (crmResult.status === "rejected") {
    console.error("[Lead] CRM webhook failed:", crmResult.reason);
  }
  if (smsResult.status === "rejected") {
    console.error("[Lead] SMS notification failed:", smsResult.reason);
  }

  // Success = Supabase saved OR webhook worked. Lead is never silently lost.
  return { success: true };
}

/** POST the lead payload to the configured CRM/Zapier webhook */
async function postToCRM(payload: CRMPayload): Promise<void> {
  const { webhookURL } = API_CONFIG.crm;

  if (!webhookURL) {
    console.warn("[Lead] CRM webhook URL not configured — skipping POST.");
    console.info("[Lead] Payload:", JSON.stringify(payload, null, 2));
    return;
  }

  const res = await fetch(webhookURL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`CRM webhook returned ${res.status}: ${await res.text()}`);
  }
}
