/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#080b12",
        surface: "#0f1420",
        card: "#131928",
        border: "#1e2a3a",
        accent: "#dc143c",
        "accent-light": "#ff2952",
        "accent-dim": "rgba(220,20,60,0.15)",
        muted: "#4a5568",
        "muted-fg": "#8892a4",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.4)",
        glow: "0 0 20px rgba(220,20,60,0.3)",
        "glow-sm": "0 0 10px rgba(220,20,60,0.2)",
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(220,20,60,0.3)" },
          "50%": { boxShadow: "0 0 24px rgba(220,20,60,0.7)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
}
