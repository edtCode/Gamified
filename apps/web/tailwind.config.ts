import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#3C3F45",
        paper: "#EEF0F3",
        silver: "#B0B7C3",
        steelWhite: "#F7F8FA",
        moss: "#4B5058",
        coral: "#30343A",
        amber: "#DFE3E9",
        sky: "#6F7682"
      },
      boxShadow: {
        panel: "0 18px 50px rgba(60, 63, 69, 0.11)",
        button: "0 14px 30px rgba(60, 63, 69, 0.28), inset 0 1px 0 rgba(247, 248, 250, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
