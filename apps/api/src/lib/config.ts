import dotenv from "dotenv";
import path from "path";

// Load apps/api/.env first, then fall back to the repo-root .env.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.API_PORT ?? 4000),
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  databaseUrl: required("DATABASE_URL"),
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  jwtSecret: required("JWT_SECRET", "dev-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  allowedEmailDomains: (process.env.ALLOWED_EMAIL_DOMAINS ?? "example.edu")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean),
  isProd: process.env.NODE_ENV === "production",
};
