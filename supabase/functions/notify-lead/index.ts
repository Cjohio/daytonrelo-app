// ─────────────────────────────────────────────
//  notify-lead — Supabase Edge Function
//  Sends an SMS to the agent via Twilio on every lead submission.
//
//  Secrets required (set in Supabase Dashboard → Edge Functions → Secrets):
//    TWILIO_ACCOUNT_SID   — from console.twilio.com
//    TWILIO_AUTH_TOKEN    — from console.twilio.com
//    TWILIO_FROM_NUMBER   — your Twilio phone number (e.g. +18554371813)
//    AGENT_PHONE          — Chris's cell (e.g. +19372413484)
// ─────────────────────────────────────────────

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const body = await req.json() as {
      name:          string;
      email:         string;
      phone:         string;
      employer?:     string;
      moveTimeline:  string;
      message?:      string;
    };

    // Credentials come from Supabase Vault — never shipped in the app bundle
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
    const authToken  = Deno.env.get("TWILIO_AUTH_TOKEN")  ?? "";
    const fromNumber = Deno.env.get("TWILIO_FROM_NUMBER") ?? "";
    const agentPhone = Deno.env.get("AGENT_PHONE")        ?? "";

    if (!accountSid || !authToken || !agentPhone) {
      console.warn("[notify-lead] Twilio not configured — skipping SMS.");
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const smsLines = [
      `🏠 New Dayton Relo Lead`,
      `──────────────────`,
      `Name:      ${body.name}`,
      `Email:     ${body.email}`,
      `Phone:     ${body.phone}`,
      `Employer:  ${body.employer || "Not specified"}`,
      `Timeline:  ${body.moveTimeline}`,
    ];
    if (body.message) smsLines.push(`Note: ${body.message}`);
    const smsBody = smsLines.join("\n");

    const url         = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const credentials = btoa(`${accountSid}:${authToken}`);

    const twilioRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization:  `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To:   agentPhone,
        From: fromNumber,
        Body: smsBody,
      }).toString(),
    });

    if (!twilioRes.ok) {
      const errText = await twilioRes.text();
      throw new Error(`Twilio error ${twilioRes.status}: ${errText}`);
    }

    console.info("[notify-lead] SMS sent successfully.");
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[notify-lead] Error:", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
