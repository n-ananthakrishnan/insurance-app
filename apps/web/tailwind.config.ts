import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f2f7fc",
          100: "#e4eef8",
          500: "#3b82b8",
          600: "#286b9f",
          700: "#20557f",
          800: "#1d4668",
          900: "#1c3b56",
        },
        accent: {
          50: "#fff8eb",
          100: "#ffefd1",
          500: "#e99a32",
          600: "#d47c1e",
          700: "#ae5d1b",
        },
        muted: {
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
        },
        navy: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#829ab1",
          500: "#627d98",
          600: "#486581",
          700: "#334e68",
          800: "#243b53",
          900: "#102a43",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        jp: ["Noto Sans JP", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
      },
      keyframes: {
        "accident-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
      animation: {
        "accident-pulse": "accident-pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
