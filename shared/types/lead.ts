// Lead capture — type definitions

export type MoveTimeline =
  | "immediately"
  | "1-3months"
  | "3-6months"
  | "6-12months"
  | "just-browsing";

export const MOVE_TIMELINE_LABELS: Record<MoveTimeline, string> = {
  "immediately":  "ASAP",
  "1-3months":    "1–3 Months",
  "3-6months":    "3–6 Months",
  "6-12months":   "6–12 Months",
  "just-browsing":"Just Browsing",
};

export type RelocationType = "military" | "corporate" | "personal" | "unknown";

export interface LeadFormData {
  name:          string;
  email:         string;
  phone:         string;
  moveTimeline:  MoveTimeline;
  employer:      string;          // e.g. "Wright-Patterson AFB" or "L3Harris"
  relocationType?: RelocationType;
  message?:      string;
}

export interface LeadSubmissionResult {
  success:  boolean;
  leadId?:  string;
  error?:   string;
}

export interface CRMPayload extends LeadFormData {
  source:       string;
  submittedAt:  string;
  appVersion:   string;
}
