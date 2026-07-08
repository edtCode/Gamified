import type { IncomingMessage, ServerResponse } from "http";
import type { Express } from "express";
import { createApp } from "../src/app";

// Vercel serverless entrypoint. It reuses the same Express app that runs
// locally (createApp), so every REST route (/auth, /users, /tracks, ...) works
// identically in production. Real-time features (Socket.IO) are not started
// here — serverless functions can't hold long-lived connections — but the
// entire REST surface, including signin/signup, does.
let app: Express | undefined;

function getApp() {
  if (!app) {
    app = createApp();
  }
  return app;
}

function sendStartupError(res: ServerResponse, err: unknown) {
  const message = err instanceof Error ? err.message : "Unknown startup error";
  console.error("API startup failed:", err);

  res.statusCode = 500;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(
    JSON.stringify({
      error: "API server failed to start.",
      message,
      hint: "Check the Vercel environment variables, especially DATABASE_URL, DIRECT_URL, and JWT_SECRET.",
    })
  );
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // The frontend calls `/api/auth/...` in production; Vercel forwards the full
  // path here, but the Express routes are mounted without the `/api` prefix.
  // Strip it so `/api/auth/signup` matches the existing `/auth/signup` route.
  if (req.url) {
    req.url = req.url.replace(/^\/api(?=\/|$)/, "") || "/";
  }

  try {
    return (getApp() as unknown as (r: IncomingMessage, s: ServerResponse) => void)(req, res);
  } catch (err) {
    return sendStartupError(res, err);
  }
}
