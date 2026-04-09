/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4 preset required
  presets: [require("nativewind/preset")],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./shared/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — Dayton Relo luxury design system
        gold: {
          DEFAULT: "#C9A84C",
          light:   "#E8C96A",
          dark:    "#A8863A",
          muted:   "#D4B96A",
        },
        brand: {
          black:   "#0A0A0A",
          white:   "#FAFAFA",
          gray:    "#6B6B6B",
          border:  "#E5E5E5",
          surface: "#F8F8F8",
        },
      },
      fontFamily: {
        heading: ["Georgia", "serif"],
        body:    ["System", "sans-serif"],
      },
    },
  },
  plugins: [],
};
