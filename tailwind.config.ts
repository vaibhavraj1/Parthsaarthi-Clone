import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        iim: {
          maroon: "#800000",
          navy: "#0a2540",
          blue: "#1e3a8a",
          gold: "#c59b27",
          darkGold: "#9b7818",
          slate: "#1e293b",
          light: "#f8fafc",
          border: "#e2e8f0"
        }
      }
    },
  },
  plugins: [],
};
export default config;
