import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { HttpError } from "../lib/http";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: "Not found" });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.flatten(),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (
    err instanceof Prisma.PrismaClientInitializationError ||
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientUnknownRequestError
  ) {
    return res.status(503).json({
      error: "Database request failed.",
      message: err.message,
    });
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
}
