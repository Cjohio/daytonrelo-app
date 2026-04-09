// ─────────────────────────────────────────────
//  Claude AI Chat — Dayton Relo Bot
//  API key now lives in Supabase Vault (server-side only).
//  This file proxies through the `daytonbot` Edge Function — no key in bundle.
// ─────────────────────────────────────────────

import { supabase } from "../lib/supabase";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ── Keywords that trigger an SMS escalation to Chris ─────────────────────────
const ESCALATION_KEYWORDS = [
  "schedule", "showing", "tour", "appointment", "visit",
  "call me", "talk to chris", "speak with", "contact chris",
  "make an offer", "offer", "pre-approval", "pre-approved",
  "ready to buy", "want to buy", "want to see",
];

export function shouldEscalateToChris(message: string): boolean {
  const lower = message.toLowerCase();
  return ESCALATION_KEYWORDS.some((kw) => lower.includes(kw));
}

// ── Proxy chat messages through the daytonbot Edge Function ───────────────────

export async function sendChatMessage(
  messages: ChatMessage[]
): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ text: string; error?: string }>(
    "daytonbot",
    { body: { messages } }
  );

  if (error) {
    console.error("[DaytonBot] Edge Function error:", error);
    throw new Error(`DaytonBot error: ${error.message}`);
  }

  if (data?.error) {
    // Structured error from the function (e.g. rate limit)
    throw new Error(data.error);
  }

  return data?.text ?? "Sorry, I didn't get a response. Try again!";
}
