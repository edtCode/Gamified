import express from "express";
import cors from "cors";
import { config } from "./lib/config";
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import { learningRouter } from "./routes/learning";
import { gamificationRouter } from "./routes/gamification";
import { socialRouter } from "./routes/social";
import { notificationsRouter } from "./routes/notifications";
import { v2Router } from "./routes/v2stubs";
import { notFound, errorHandler } from "./middleware/error";

// Allow the configured web origin plus any localhost/127.0.0.1 origin (any port).
// A single hardcoded origin causes "Failed to fetch" in the browser whenever the
// app is opened via 127.0.0.1 instead of localhost (or vice-versa), since the
// returned Access-Control-Allow-Origin wouldn't match the page's origin.
export function isAllowedOrigin(origin: string): boolean {
  if (origin === config.webOrigin) return true;
  try {
    const { hostname } = new URL(origin);
    // Allow localhost, 127.0.0.1, ::1, and all vercel.app deployments
    return ["localhost", "127.0.0.1", "::1"].includes(hostname) || hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

export function createApp() {
  const app = express();

  app.use(
    cors({
      // `origin` may be undefined for same-origin, curl, or mobile clients — allow those.
      origin(origin, callback) {
        if (!origin || isAllowedOrigin(origin)) return callback(null, true);
        callback(new Error(`Origin not allowed by CORS: ${origin}`));
      },
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true, service: "gamified-api" }));

  app.use("/auth", authRouter);
  app.use("/users", usersRouter);
  // Learning + gamification share the top-level namespace (/tracks, /me/*, etc.)
  app.use("/", learningRouter);
  app.use("/", gamificationRouter);
  app.use("/", socialRouter);
  app.use("/notifications", notificationsRouter);
  app.use("/", v2Router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
