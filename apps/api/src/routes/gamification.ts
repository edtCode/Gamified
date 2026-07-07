import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/http";
import { requireAuth } from "../middleware/auth";
import { getBatchLeaderboard } from "../services/leaderboard";

export const gamificationRouter = Router();

// GET /badges — the full badge catalog.
gamificationRouter.get(
  "/badges",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const badges = await prisma.badge.findMany({ orderBy: { createdAt: "asc" } });
    res.json({
      badges: badges.map((b: any) => ({
        slug: b.slug,
        name: b.name,
        description: b.description,
        icon: b.icon,
      })),
    });
  })
);

// GET /me/badges — badges the current user has earned.
gamificationRouter.get(
  "/me/badges",
  requireAuth,
  asyncHandler(async (req, res) => {
    const earned = await prisma.userBadge.findMany({
      where: { userId: req.user!.sub },
      orderBy: { awardedAt: "desc" },
      include: { badge: true },
    });
    res.json({
      badges: earned.map((ub: any) => ({
        slug: ub.badge.slug,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        awardedAt: ub.awardedAt,
      })),
    });
  })
);

// GET /leaderboard?scope=batch — batch-wise ranking for the user's college.
gamificationRouter.get(
  "/leaderboard",
  requireAuth,
  asyncHandler(async (req, res) => {
    const me = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.sub } });
    const rows = await getBatchLeaderboard(me.collegeId, me.batch, me.id);
    res.json({ scope: "batch", batch: me.batch, leaderboard: rows });
  })
);
