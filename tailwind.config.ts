import type { Config } from "tailwindcss";

// Tailwind v4 uses CSS @theme tokens in globals.css for design tokens.
// This file is kept for plugin registration and content path overrides.
const config: Config = {
  darkMode: "class",
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
      /* ── Responsive breakpoints ────────────────────────────── */
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },

      /* ── Spacing scale ────────────────────────────────────── */
      spacing: {
        "3xs": "0.125rem",
        "2xs": "0.25rem",
        xs: "0.5rem",
        sm: "0.75rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
        "3xl": "4rem",
        "4xl": "6rem",
      },

      /* ── Enhanced shadows ──────────────────────────────────── */
      boxShadow: {
        xs: "0 1px 2px rgba(0, 0, 0, 0.05)",
        sm: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
        md: "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)",
        "2xl": "0 25px 50px rgba(0, 0, 0, 0.15)",
        inner: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
      },

      /* ── Border radius ──────────────────────────────────── */
      borderRadius: {
        xs: "0.25rem",
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },

      /* ── Enhanced transitions ──────────────────────────────── */
      transitionDuration: {
        75: "75ms",
        100: "100ms",
        150: "150ms",
        200: "200ms",
        300: "300ms",
        500: "500ms",
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        "smooth-in": "cubic-bezier(0.4, 0, 1, 1)",
        "smooth-out": "cubic-bezier(0, 0, 0.2, 1)",
      },

      /* ── Typography improvements ──────────────────────────── */
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
      },

      /* ── Letter spacing for premium typography ────────────– */
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0em",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },

      /* ── Line height for better readability ────────────── */
      lineHeight: {
        tight: "1.25",
        snug: "1.375",
        normal: "1.5",
        relaxed: "1.625",
        loose: "2",
      },

      /* ── Custom animations ──────────────────────────────── */
      animation: {
        fadeIn: "fadeIn 300ms ease-out",
        slideInUp: "slideInUp 400ms ease-out",
        slideInDown: "slideInDown 400ms ease-out",
        slideInLeft: "slideInLeft 400ms ease-out",
        slideInRight: "slideInRight 400ms ease-out",
        scaleIn: "scaleIn 300ms ease-out",
      },

      /* ── Z-index scale ──────────────────────────────────– */
      zIndex: {
        0: "0",
        10: "10",
        20: "20",
        30: "30",
        40: "40",
        50: "50",
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },

      /* ── Opacity scale ──────────────────────────────────– */
      opacity: {
        0: "0",
        5: "0.05",
        10: "0.1",
        20: "0.2",
        30: "0.3",
        40: "0.4",
        50: "0.5",
        60: "0.6",
        70: "0.7",
        80: "0.8",
        90: "0.9",
        95: "0.95",
        100: "1",
      },

      /* ── Container queries for component-level responsiveness */
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          xs: "1rem",
          sm: "1.5rem",
          md: "2rem",
          lg: "2rem",
          xl: "2.5rem",
          "2xl": "3rem",
        },
      },
    },
  },
};

export default config;
