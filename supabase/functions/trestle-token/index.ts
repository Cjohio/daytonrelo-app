// ─────────────────────────────────────────────────────────────────────────────
//  trestle-token — Supabase Edge Function
//
//  Client-side proxy for the Trestle / CoreLogic OAuth2 client_credentials flow.
//  Keeps TRESTLE_CLIENT_SECRET server-side instead of shipping it in the mobile
//  bundle (EXPO_PUBLIC_* variables are public).
//
//  Secrets (Supabase → Project Settings → Edge Function Secrets):
//    TRESTLE_CLIENT_ID
//    TRESTLE_CLIENT_SECRET
//    TRESTLE_TOKEN_URL     (e.g. https://api-prod.corelogic.com/trestle/oidc/connect/token)
//
//  Request:  POST /functions/v1/trestle-token   (no body required)
//  Response: { access_token: string, expires_in: number, token_type: "Bearer" }
//
//  Notes:
//    - verify_jwt is false; the function is rate-limited by client IP to keep
//      anonymous listing browsing working while still preventing abuse.
//    - Token is cached in-instance for reuse across warm invocations (up to
//      expires_in minus 60 s safety margin).
// ─────────────────────────────────────────────────────────────────────────────

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CLIENT_ID     = Deno.env.get("TRESTLE_CLIENT_ID")     ?? "";
const CLIENT_SECRET = Deno.env.get("TRESTLE_CLIENT_SECRET") ?? "";
const TOKEN_URL     = Deno.env.get("TRESTLE_TOKEN_URL")
  ?? "https://api-prod.corelogic.com/trestle/oidc/connect/token";

const SUPABASE_URL      = Deno.env.get("SUPABASE_URL")              ?? "";
const SERVICE_ROLE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const CORS_HEADERS: HeadersInit = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── In-instance token cache ─────────────────────────────────────────────────
interface CachedToken { token: string; expiresAt: number; }
let _cache: CachedToken | null = null;

// ── Rate limit: 60 req / 5 min per IP ────────────────────────────────────────
const RATE_WINDOW_SEC = 5 * 60;
const RATE_MAX        = 60;

async function isAllowed(ip: string): Promise<boolean> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return true; // fail-open if misconfigured
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const { data, error } = await admin.rpc("rate_limit_hit", {
    p_scope: "trestle-token",
    p_key:   ip,
    p_window_seconds: RATE_WINDOW_SEC,
    p_max:   RATE_MAX,
  });
  if (error || !data) {
    console.error("[trestle-token] rate_limit_hit error:", error);
    return true; // fail-open so outages of rate-limiter don't break listings
  }
  const row = Array.isArray(data) ? data[0] : data;
  return !!row?.allowed;
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("cf-connecting-ip") ?? req.headers.get("x-real-ip") ?? "unknown";
}

async function fetchTokenFresh(): Promise<CachedToken> {
  const body = new URLSearchParams({
    grant_type:    "client_credentials",
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope:         "api",
  });

  const res = await fetch(TOKEN_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Trestle token error ${res.status}: ${text}`);
  }

  const json = await res.json() as { access_token: string; expires_in: number };
  return {
    token:     json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status:  405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  // ── Rate limit
  const ip = clientIp(req);
  const allowed = await isAllowed(ip);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status:  429,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json", "Retry-After": String(RATE_WINDOW_SEC) },
    });
  }

  // ── Config check
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("[trestle-token] missing TRESTLE_CLIENT_ID / TRESTLE_CLIENT_SECRET");
    return new Response(JSON.stringify({ error: "misconfigured" }), {
      status:  500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  // ── Serve from cache if still fresh (>60 s left)
  const now = Date.now();
  if (_cache && _cache.expiresAt - now > 60_000) {
    return new Response(JSON.stringify({
      access_token: _cache.token,
      expires_in:   Math.max(60, Math.floor((_cache.expiresAt - now) / 1000)),
      token_type:   "Bearer",
      cached:       true,
    }), {
      status:  200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  // ── Fetch a fresh token from Trestle
  try {
    _cache = await fetchTokenFresh();
  } catch (err) {
    console.error("[trestle-token] fetchTokenFresh failed:", err);
    return new Response(JSON.stringify({ error: "token_fetch_failed" }), {
      status:  502,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({
    access_token: _cache.token,
    expires_in:   Math.max(60, Math.floor((_cache.expiresAt - Date.now()) / 1000)),
    token_type:   "Bearer",
    cached:       false,
  }), {
    status:  200,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});
