import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151515",
        paper: "#f4f2ec",
        moss: "#2f2e2a",
        coral: "#252525",
        amber: "#e9e6dd",
        sky: "#4f4d48"
      },
      boxShadow: {
        panel: "0 18px 50px rgba(21, 21, 21, 0.08)",
        button: "0 12px 28px rgba(21, 21, 21, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
