import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17212b",
        paper: "#f6f4ee",
        moss: "#426b4f",
        coral: "#d95f43",
        amber: "#e3a23a",
        sky: "#2f80a7"
      },
      boxShadow: {
        panel: "0 18px 40px rgba(23, 33, 43, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
