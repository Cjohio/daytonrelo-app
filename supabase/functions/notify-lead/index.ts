// ─────────────────────────────────────────────
//  notify-lead — Supabase Edge Function
//  Sends a lead notification email to Chris via Resend.
//
//  Secrets required (Supabase Dashboard → Edge Functions → notify-lead → Secrets):
//    RESEND_API_KEY   — from resend.com/api-keys
//    AGENT_EMAIL      — where to deliver leads (e.g. chris@cjohio.com)
//
//  Setup steps:
//    1. Sign up at resend.com (free — 3,000 emails/month)
//    2. Go to Domains → Add domain → enter "daytonrelo.com"
//    3. Add the DNS records Resend provides in Vercel (Settings → Domains → DNS)
//    4. Create an API key at resend.com/api-keys → copy it
//    5. Set RESEND_API_KEY + AGENT_EMAIL in Supabase secrets
//
//  Rate limiting (see migration create_edge_rate_limits):
//    - Per-IP:    5 requests / 10 minutes
//    - Per-email: 3 requests / 60 minutes
//  Either limit hitting triggers a 429. `verify_jwt` remains false so anon
//  users can submit the lead form without signing in.
// ─────────────────────────────────────────────

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")              ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Per-IP limit protects against script/bot abuse from one source.
const IP_WINDOW_SEC  = 10 * 60;
const IP_MAX         = 5;
// Per-email limit protects against a single bad actor using many IPs.
const EMAIL_WINDOW_SEC = 60 * 60;
const EMAIL_MAX        = 3;

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("cf-connecting-ip") ?? req.headers.get("x-real-ip") ?? "unknown";
}

function isValidEmail(s: string): boolean {
  // Intentionally permissive — just catches obvious garbage.
  return typeof s === "string" && s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

async function hitLimit(
  admin: ReturnType<typeof createClient>,
  scope: string,
  key: string,
  windowSec: number,
  max: number,
): Promise<boolean> {
  const { data, error } = await admin.rpc("rate_limit_hit", {
    p_scope: scope,
    p_key:   key,
    p_window_seconds: windowSec,
    p_max:   max,
  });
  if (error || !data) {
    console.error(`[notify-lead] rate_limit_hit(${scope}) error:`, error);
    return true; // fail-open if the limiter itself is broken
  }
  const row = Array.isArray(data) ? data[0] : data;
  return !!row?.allowed;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
      status:  405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    // ── Parse + validate payload (before hitting the limiter so we don't
    // ── burn budget on bad requests)
    let body: {
      name:         string;
      email:        string;
      phone:        string;
      employer?:    string;
      moveTimeline: string;
      message?:     string;
    };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), {
        status:  400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (!body?.name || !body?.email || !body?.phone || !body?.moveTimeline) {
      return new Response(JSON.stringify({ ok: false, error: "missing_fields" }), {
        status:  400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }
    if (body.name.length    > 200) body.name    = body.name.slice(0, 200);
    if (body.phone.length   > 32)  body.phone   = body.phone.slice(0, 32);
    if (body.moveTimeline.length > 200) body.moveTimeline = body.moveTimeline.slice(0, 200);
    if (body.employer && body.employer.length > 200) body.employer = body.employer.slice(0, 200);
    if (body.message  && body.message.length  > 2000) body.message  = body.message.slice(0, 2000);

    if (!isValidEmail(body.email)) {
      return new Response(JSON.stringify({ ok: false, error: "invalid_email" }), {
        status:  400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // ── Rate limit by IP + email
    const ip    = clientIp(req);
    const email = body.email.toLowerCase();

    let ipOk = true, emailOk = true;
    if (SUPABASE_URL && SERVICE_ROLE_KEY) {
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      });
      ipOk    = await hitLimit(admin, "notify-lead-ip",    ip,    IP_WINDOW_SEC,    IP_MAX);
      emailOk = await hitLimit(admin, "notify-lead-email", email, EMAIL_WINDOW_SEC, EMAIL_MAX);
    } else {
      console.warn("[notify-lead] SUPABASE_URL / SERVICE_ROLE_KEY missing — rate limiter disabled.");
    }

    if (!ipOk || !emailOk) {
      console.warn(`[notify-lead] rate_limited ip=${ip} email=${email} ipOk=${ipOk} emailOk=${emailOk}`);
      return new Response(JSON.stringify({ ok: false, error: "rate_limited" }), {
        status:  429,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
          "Retry-After":  String(!ipOk ? IP_WINDOW_SEC : EMAIL_WINDOW_SEC),
        },
      });
    }

    // ── Send via Resend
    const apiKey     = Deno.env.get("RESEND_API_KEY") ?? "";
    const agentEmail = Deno.env.get("AGENT_EMAIL")    ?? "chris@cjohio.com";

    if (!apiKey) {
      console.warn("[notify-lead] RESEND_API_KEY not configured — skipping email.");
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const now       = new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" });
    const callLink  = `tel:${body.phone.replace(/\D/g, "")}`;
    const textLink  = `sms:${body.phone.replace(/\D/g, "")}`;
    const emailLink = `mailto:${body.email}`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#1A1A1A;border-radius:16px;overflow:hidden;border:2px solid #C9A84C;">

        <!-- Header -->
        <tr>
          <td style="background:#C9A84C;padding:20px 28px;">
            <p style="margin:0;color:#1A1A1A;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">Dayton Relo</p>
            <h1 style="margin:4px 0 0;color:#1A1A1A;font-size:22px;font-weight:900;">🏠 New Lead</h1>
          </td>
        </tr>

        <!-- Lead details -->
        <tr>
          <td style="padding:24px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:16px;">
                  <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Name</p>
                  <p style="margin:0;color:#fff;font-size:18px;font-weight:800;">${body.name}</p>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom:16px;border-top:1px solid #333;padding-top:16px;">
                  <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Phone</p>
                  <p style="margin:0;color:#C9A84C;font-size:16px;font-weight:700;">${body.phone}</p>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom:16px;border-top:1px solid #333;padding-top:16px;">
                  <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Email</p>
                  <p style="margin:0;color:#C9A84C;font-size:15px;font-weight:600;">${body.email}</p>
                </td>
              </tr>
              ${body.employer ? `
              <tr>
                <td style="padding-bottom:16px;border-top:1px solid #333;padding-top:16px;">
                  <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Employer</p>
                  <p style="margin:0;color:#fff;font-size:15px;">${body.employer}</p>
                </td>
              </tr>` : ""}
              <tr>
                <td style="padding-bottom:16px;border-top:1px solid #333;padding-top:16px;">
                  <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Move Timeline</p>
                  <p style="margin:0;color:#fff;font-size:15px;font-weight:600;">${body.moveTimeline}</p>
                </td>
              </tr>
              ${body.message ? `
              <tr>
                <td style="border-top:1px solid #333;padding-top:16px;">
                  <p style="margin:0 0 8px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Message</p>
                  <p style="margin:0;color:#ddd;font-size:14px;line-height:1.6;background:#111;padding:12px;border-radius:8px;border-left:3px solid #C9A84C;">${body.message}</p>
                </td>
              </tr>` : ""}
            </table>
          </td>
        </tr>

        <!-- Action buttons -->
        <tr>
          <td style="padding:0 28px 28px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:8px;">
                  <a href="${callLink}" style="display:inline-block;background:#C9A84C;color:#1A1A1A;font-weight:800;font-size:14px;padding:12px 20px;border-radius:8px;text-decoration:none;">📞 Call</a>
                </td>
                <td style="padding-right:8px;">
                  <a href="${textLink}" style="display:inline-block;background:#C9A84C;color:#1A1A1A;font-weight:800;font-size:14px;padding:12px 20px;border-radius:8px;text-decoration:none;">💬 Text</a>
                </td>
                <td>
                  <a href="${emailLink}" style="display:inline-block;background:transparent;color:#C9A84C;font-weight:700;font-size:14px;padding:11px 20px;border-radius:8px;text-decoration:none;border:1.5px solid #C9A84C;">✉️ Email</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#111;padding:14px 28px;border-top:1px solid #333;">
            <p style="margin:0;color:#555;font-size:11px;">Submitted ${now} · Dayton Relo App</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        from:    "Dayton Relo <onboarding@resend.dev>",  // TODO: switch to leads@daytonrelo.com once domain verified in Resend
        to:      [agentEmail],
        reply_to: body.email,
        subject: `🏠 New Lead: ${body.name} — ${body.moveTimeline}`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      throw new Error(`Resend error ${resendRes.status}: ${errText}`);
    }

    console.info("[notify-lead] Email sent via Resend.");
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
