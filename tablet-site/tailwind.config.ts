import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(0 0% 100% / 0.10)",
        input: "hsl(0 0% 100% / 0.10)",
        ring: "hsl(0 0% 100% / 0.20)",
        background: "hsl(214 50% 8%)",
        foreground: "hsl(0 0% 100%)",
        primary: {
          DEFAULT: "hsl(217 67% 55%)",
          foreground: "hsl(0 0% 100%)",
        },
        secondary: {
          DEFAULT: "hsl(0 0% 100% / 0.10)",
          foreground: "hsl(0 0% 100%)",
        },
        muted: {
          DEFAULT: "hsl(0 0% 100% / 0.08)",
          foreground: "hsl(0 0% 100% / 0.65)",
        },
        accent: {
          DEFAULT: "hsl(173 76% 31%)",
          foreground: "hsl(0 0% 100%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 100% / 0.08)",
          foreground: "hsl(0 0% 100%)",
        },
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.75rem",
      },
    },
  },
  plugins: [],
} satisfies Config;