import dotenv from "dotenv";
import path from "path";

// Load apps/api/.env first, then fall back to the repo-root .env.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

export const config = {
  port: Number(process.env.API_PORT ?? 4000),
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  hasDatabaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  jwtSecret: process.env.JWT_SECRET ?? "dev-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  allowedEmailDomains: (process.env.ALLOWED_EMAIL_DOMAINS ?? "example.edu")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean),
  isProd: process.env.NODE_ENV === "production",
  // When true, new signups are marked verified immediately and can log in
  // without an email round-trip. Enable this in environments that have no email
  // provider wired up (e.g. the current Vercel deploy); disable once real
  // verification emails are being sent.
  autoVerifyEmail:
    (process.env.AUTO_VERIFY_EMAIL ?? (process.env.NODE_ENV === "production" ? "true" : "false"))
      .toLowerCase() === "true",
};
