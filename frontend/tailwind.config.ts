import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#152033",
        mist: "#eef3f7",
        paper: "#fcfaf5",
        accent: "#ff8a5b",
        accentSoft: "#ffd8ca",
        success: "#2e6f58",
        warning: "#8f5d2a",
      },
      boxShadow: {
        card: "0 24px 60px rgba(21, 32, 51, 0.12)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["Avenir Next", "Trebuchet MS", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
