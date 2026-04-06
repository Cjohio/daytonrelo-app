// ─────────────────────────────────────────────
//  SMS Notifications via Twilio
//  Sends a text to the agent on every lead.
//  Docs: https://www.twilio.com/docs/sms
// ─────────────────────────────────────────────

import { API_CONFIG } from "./config";

const { twilioAccountSid, twilioAuthToken, twilioFromNumber, agentPhone } =
  API_CONFIG.sms;

/**
 * Send an SMS to the agent's phone number.
 * Falls back to console.warn if Twilio is not configured.
 */
export async function sendAgentSMS(message: string): Promise<void> {
  if (!twilioAccountSid || !twilioAuthToken || !agentPhone) {
    console.warn("[SMS] Twilio not configured — skipping SMS notification.");
    console.info("[SMS] Would have sent:", message);
    return;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
  const credentials = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

  const body = new URLSearchParams({
    To:   agentPhone,
    From: twilioFromNumber,
    Body: message,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization:  `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`[SMS] Twilio send failed (${res.status}): ${errText}`);
  }

  console.info("[SMS] Agent notification sent successfully.");
}

/** Format a lead into a readable SMS message */
export function formatLeadSMS(data: {
  name: string;
  email: string;
  phone: string;
  employer: string;
  moveTimeline: string;
  message?: string;
}): string {
  const lines = [
    `🏠 New Dayton Relo Lead`,
    `──────────────────`,
    `Name:      ${data.name}`,
    `Email:     ${data.email}`,
    `Phone:     ${data.phone}`,
    `Employer:  ${data.employer || "Not specified"}`,
    `Timeline:  ${data.moveTimeline}`,
  ];
  if (data.message) lines.push(`Note: ${data.message}`);
  return lines.join("\n");
}
