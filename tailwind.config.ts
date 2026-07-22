import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F5F0",
        "paper-dim": "#EFEBE2",
        ink: "#1C1B1A",
        "ink-soft": "#4A4740",
        muted: "#8A8578",
        wire: "#2B4570",
        "wire-dark": "#1D2F4D",
        signal: "#C1432A",
        line: "#DCD7C9",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
