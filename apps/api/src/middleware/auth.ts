import { NextFunction, Request, Response } from "express";
import { verifyToken, JwtPayload } from "../lib/jwt";
import { HttpError } from "../lib/http";

// Augment Express Request with the authenticated user payload.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing or malformed Authorization header");
  }
  const token = header.slice("Bearer ".length).trim();
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
}
