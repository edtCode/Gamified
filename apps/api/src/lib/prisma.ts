import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient across warm serverless invocations. On Vercel each
// cold start creates a fresh module scope, but warm invocations share globals —
// caching here prevents opening a new DB connection pool on every request.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["warn", "error"],
  });

globalForPrisma.prisma = prisma;
