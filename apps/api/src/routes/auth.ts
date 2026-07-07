import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { config } from "../lib/config";
import { signToken } from "../lib/jwt";
import { asyncHandler, HttpError } from "../lib/http";
import { requireAuth } from "../middleware/auth";
import { publicUser } from "./users";

export const authRouter = Router();

const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  batch: z.string().regex(/^\d{4}$/, "batch must be a 4-digit year, e.g. 2027"),
});

function emailDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

// POST /auth/signup — register with a college email; sends a verification link
// (printed to the console in dev).
authRouter.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const { name, email, password, batch } = signupSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase();
    const domain = emailDomain(normalizedEmail);

    if (!config.allowedEmailDomains.includes(domain)) {
      throw new HttpError(
        400,
        `Signup is restricted to college emails (${config.allowedEmailDomains.join(", ")}).`
      );
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) throw new HttpError(409, "An account with this email already exists.");

    // Find (or lazily create) the college for this email domain.
    const college = await prisma.college.upsert({
      where: { emailDomain: domain },
      update: {},
      create: { name: domain, emailDomain: domain },
    });

    const passwordHash = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(24).toString("hex");

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        batch,
        collegeId: college.id,
        verifyToken,
      },
    });

    const verifyUrl = `${config.webOrigin}/verify?token=${verifyToken}`;
    console.log(`\n🔗 Verify link for ${user.email}: ${verifyUrl}\n`);

    res.status(201).json({
      message: "Account created. Check your email to verify (dev: see API console).",
      // Exposed in non-prod only, to make local testing frictionless.
      ...(config.isProd ? {} : { devVerifyUrl: verifyUrl }),
    });
  })
);

// GET /auth/verify?token=... — activate the account and return an auth token.
authRouter.get(
  "/verify",
  asyncHandler(async (req, res) => {
    const token = z.string().min(1).parse(req.query.token);
    const user = await prisma.user.findUnique({ where: { verifyToken: token } });
    if (!user) throw new HttpError(400, "Invalid or already-used verification link.");

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verifyToken: null },
    });

    const authToken = signToken({ sub: updated.id, email: updated.email, role: updated.role });
    res.json({ token: authToken, user: await publicUser(updated.id) });
  })
);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /auth/login
authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new HttpError(401, "Invalid email or password.");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid email or password.");

    if (!user.emailVerified) {
      throw new HttpError(403, "Please verify your college email before logging in.");
    }

    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.json({ token, user: await publicUser(user.id) });
  })
);

// GET /auth/me — current profile from a valid token.
authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: await publicUser(req.user!.sub) });
  })
);
