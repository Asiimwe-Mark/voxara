import type { Config } from "tailwindcss";

// Tailwind v4 uses CSS @theme tokens in globals.css for design tokens.
// darkMode is configured via @variant in globals.css — not in this file.
// The darkMode: ["class"] option from v3 has no effect in v4.
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./emails/**/*.{js,ts,jsx,tsx,mdx}",
    "./remotion/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
    },
  },
};

export default config;
