// Dayton Relo — Design System Colors
// Matches website Tailwind tokens exactly (tailwind.config.ts)
export const Colors = {
  // Primary palette — mirrors website gold.DEFAULT / gold.light / gold.dark
  gold:        "#C9A84C",
  goldLight:   "#E2C97E",
  goldDark:    "#A07830",
  goldMuted:   "#D4B96A",

  // Neutrals — mirrors website charcoal / cream
  black:       "#1A1A1A",   // website: charcoal
  white:       "#FFFFFF",
  offWhite:    "#F8F6F0",   // website: cream
  gray:        "#6B6B6B",
  grayLight:   "#9CA3AF",   // website: gray-400 equivalent
  border:      "#E5E7EB",   // website: gray-200 equivalent
  surface:     "#F9FAFB",   // website: gray-50 equivalent

  // Semantic
  success:     "#2D7D46",
  warning:     "#C9A84C",   // reuse gold — on-brand
  error:       "#C0392B",
  info:        "#1A6B9A",
} as const;

export type ColorKey = keyof typeof Colors;
