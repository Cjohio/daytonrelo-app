// ─────────────────────────────────────────────
//  daytonbot — Supabase Edge Function
//  Proxies DaytonBot chat through Claude claude-haiku-4-5 with per-IP rate limiting.
//  Logs each chat message to user_events for the Mission Control dashboard.
//
//  Secrets required (set in Supabase Dashboard → Edge Functions → Secrets):
//    CLAUDE_API_KEY   — from console.anthropic.com
//
//  Rate limit: 20 messages / IP / hour (enforced via chat_rate_limits table)
// ─────────────────────────────────────────────

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT_PER_HOUR = 20;

const SYSTEM_PROMPT = `You are DaytonBot — the friendly AI assistant for Dayton Relo, a real estate platform run by Chris Jurgens, a licensed Ohio real estate agent specializing in military and corporate relocation to Dayton, Ohio.

Your job is to help people relocating to Dayton feel confident about their move. Be warm, helpful, and concise — this is a mobile chat, so keep responses short (2–4 sentences max unless detail is needed).

ABOUT CHRIS:
Chris Jurgens is a licensed Ohio Realtor specializing in VA loans, PCS relocations to WPAFB, and corporate moves for L3Harris, Kettering Health, and other major Dayton employers. His email is chris@cjohio.com.

KEY DAYTON STATS:
- Median home price: $265,000
- Average 3BR rent: $1,450/mo
- Cost of Living Index: 82 (US avg = 100) — very affordable
- Average days on market: 18 days

NEIGHBORHOODS (with WPAFB drive time, avg 3BR rent, avg home price, school grade):
- Fairborn: 3 min, $1,300/mo, $180K, B-
- Riverside: 5 min, $1,250/mo, $175K, B
- Beavercreek: 10 min, $1,700/mo, $265K, A  ← most popular for officers
- Huber Heights: 13 min, $1,400/mo, $210K, B-
- Xenia: 20 min, $1,350/mo, $175K, B-
- Kettering: 22 min, $1,400/mo, $259K, A-
- Oakwood: 35 min, $1,600/mo, $310K, A+ ← most prestigious suburb
- Centerville: 30 min, $1,550/mo, $295K, A
- Springboro: 40 min, $1,800/mo, $320K, A
- Miamisburg: 25 min, $1,350/mo, $230K, B+
- Tipp City: 30 min, $1,700/mo, $290K, A-
- Englewood: 20 min, $1,300/mo, $195K, B
- Vandalia: 18 min, $1,350/mo, $205K, B+
- West Carrollton: 22 min, $1,250/mo, $185K, B-
- Troy: 35 min, $1,450/mo, $240K, B+
- Piqua: 45 min, $1,300/mo, $195K, B
- Moraine: 25 min, $1,200/mo, $175K, C+

BAH RATES (WPAFB area, 2024-2025):
- E-5 with dependents: ~$1,440/mo
- E-7 with dependents: ~$1,620/mo
- O-3 with dependents: ~$1,788/mo
- Without dependents rates are roughly 15–20% lower

VA LOAN BENEFITS:
- 0% down payment for eligible veterans and active duty
- No private mortgage insurance (PMI)
- Competitive interest rates (usually below conventional)
- Reusable benefit — can use multiple times
- VA funding fee applies (0–3.3% depending on usage and service)

MAJOR EMPLOYERS:
- Wright-Patterson AFB — largest single-site employer in Ohio, thousands of civilian roles
- L3Harris Technologies — defense/aerospace, Beavercreek & Greenville
- Kettering Health — 14-hospital system across Dayton metro
- Premier Health / Miami Valley Hospital — major regional healthcare network
- University of Dayton — research university with strong industry partnerships
- CareSource — national Medicaid managed care org, HQ in downtown Dayton

COMMUTE TIPS:
- L3Harris / WPAFB employees → Beavercreek, Fairborn, Huber Heights
- Kettering Health / Premier Health employees → Kettering, Centerville, Oakwood
- Downtown Dayton → Oakwood, Kettering, Yellow Springs

DAYTON HIGHLIGHTS:
- Birthplace of aviation (Wright Brothers) — National Air Force Museum is free and world-class
- Top craft beer city per capita in the Midwest
- 300+ miles of connected bike/hiking trails
- Very strong food and live music scene
- Dave Chappelle lives in Yellow Springs

WHEN TO HAND OFF TO CHRIS:
If the user wants to schedule a showing, get pre-approved, make an offer, or has a very specific question you can't answer confidently, let them know you're connecting them with Chris and that he'll be in touch. Do not make up specific listing prices or availability.

IMPORTANT:
- Never invent specific MLS listings or prices for specific homes
- Always recommend Chris for anything transactional (offers, showings, pre-approval)
- If you don't know something, say so and offer to have Chris follow up
- Never claim to be human if asked directly`;

/** Extract user_id from the verified JWT Authorization header */
function getUserIdFromJwt(req: Request): string | null {
  try {
    const auth  = req.headers.get("authorization") ?? "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const supabaseUrl    = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, serviceRoleKey);

    // ── Rate limiting by client IP ────────────────────────────────────────────
    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

    const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();
    const { count } = await db
      .from("chat_rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("client_ip", clientIP)
      .gte("created_at", oneHourAgo);

    if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded — try again in an hour." }),
        { status: 429, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Log rate limit entry (fire-and-forget)
    db.from("chat_rate_limits").insert({ client_ip: clientIP });

    // ── Parse body ────────────────────────────────────────────────────────────
    const { messages } = await req.json() as {
      messages: { role: "user" | "assistant"; content: string }[];
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // ── Log to user_events for Mission Control dashboard (fire-and-forget) ───
    const userId = getUserIdFromJwt(req);
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    if (userId && lastUserMsg) {
      db.from("user_events").insert({
        user_id:    userId,
        event_type: "chat_message",
        properties: {
          message_count: messages.length,
          preview:       lastUserMsg.content.slice(0, 120),
        },
      });
    }

    // ── Claude API call ───────────────────────────────────────────────────────
    const apiKey = Deno.env.get("CLAUDE_API_KEY") ?? "";
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          text: "DaytonBot isn't fully configured yet — reach Chris directly on the Contact tab!",
        }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key":         apiKey,
        "anthropic-version": "2023-06-01",
        "content-type":      "application/json",
      },
      body: JSON.stringify({
        model:      "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system:     SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      throw new Error(`Claude API error ${claudeRes.status}: ${errText}`);
    }

    const data = await claudeRes.json() as {
      content: { type: string; text: string }[];
    };

    const text =
      data.content?.[0]?.text ??
      "Sorry, I didn't get a response. Try again!";

    return new Response(JSON.stringify({ text }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[daytonbot] Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
