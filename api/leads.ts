// ─────────────────────────────────────────────
//  Lead Capture — CRM Webhook + SMS Notification
//
//  Flow:
//    1. POST lead to configurable CRM webhook
//       (Zapier, Make, HubSpot, Follow Up Boss…)
//    2. Send SMS text to agent via Twilio
// ─────────────────────────────────────────────

import { API_CONFIG } from "./config";
import { sendAgentSMS, formatLeadSMS } from "./sms";
import {
  LeadFormData,
  LeadSubmissionResult,
  CRMPayload,
} from "../shared/types/lead";

/**
 * Submit a lead from the contact form.
 * Runs both the CRM webhook and SMS in parallel.
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

  const results = await Promise.allSettled([
    postToCRM(payload),
    sendAgentSMS(formatLeadSMS(data)),
  ]);

  const crmResult  = results[0];
  const smsResult  = results[1];

  if (crmResult.status === "rejected") {
    console.error("[Lead] CRM webhook failed:", crmResult.reason);
  }
  if (smsResult.status === "rejected") {
    console.error("[Lead] SMS notification failed:", smsResult.reason);
  }

  // We consider the submission successful as long as at least the CRM post worked.
  // If CRM is not configured, we still succeed (dev mode).
  const webhookConfigured = !!API_CONFIG.crm.webhookURL;
  const success = webhookConfigured
    ? crmResult.status === "fulfilled"
    : true;

  return {
    success,
    error: success ? undefined : "CRM webhook failed — please try again.",
  };
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
