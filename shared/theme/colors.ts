// Dayton Relo — Design System Colors
// Luxury real estate brand: black + white + gold
export const Colors = {
  // Primary palette
  gold:        "#C9A84C",
  goldLight:   "#E8C96A",
  goldDark:    "#A8863A",
  goldMuted:   "#D4B96A",

  // Neutrals
  black:       "#0A0A0A",
  white:       "#FAFAFA",
  offWhite:    "#F5F5F0",
  gray:        "#6B6B6B",
  grayLight:   "#CCCCCC",
  border:      "#E5E5E5",
  surface:     "#F8F8F8",

  // Semantic
  success:     "#2D7D46",
  warning:     "#C9A84C",   // reuse gold for warnings — on-brand
  error:       "#C0392B",
  info:        "#1A6B9A",
} as const;

export type ColorKey = keyof typeof Colors;
