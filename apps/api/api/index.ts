import type { IncomingMessage, ServerResponse } from "http";
import { createApp } from "../src/app";

// Vercel serverless entrypoint. It reuses the same Express app that runs
// locally (createApp), so every REST route (/auth, /users, /tracks, ...) works
// identically in production. Real-time features (Socket.IO) are not started
// here — serverless functions can't hold long-lived connections — but the
// entire REST surface, including signin/signup, does.
const app = createApp();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // The frontend calls `/api/auth/...` in production; Vercel forwards the full
  // path here, but the Express routes are mounted without the `/api` prefix.
  // Strip it so `/api/auth/signup` matches the existing `/auth/signup` route.
  if (req.url) {
    req.url = req.url.replace(/^\/api(?=\/|$)/, "") || "/";
  }
  return (app as unknown as (r: IncomingMessage, s: ServerResponse) => void)(req, res);
}
