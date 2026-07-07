import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler, HttpError } from "../lib/http";
import { requireAuth } from "../middleware/auth";
import { resolveLevel } from "../services/xp";

export const usersRouter = Router();

// Serialize a user for API responses (never leak passwordHash / verifyToken),
// enriched with derived level progress and counts.
export async function publicUser(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      college: { select: { id: true, name: true, emailDomain: true } },
      _count: { select: { userBadges: true, userTasks: true } },
    },
  });
  const levelInfo = await resolveLevel(user.xp);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    batch: user.batch,
    role: user.role,
    xp: user.xp,
    level: levelInfo.level,
    levelTitle: levelInfo.title,
    nextLevelXp: levelInfo.nextLevelXp,
    currentLevelMinXp: levelInfo.currentLevelMinXp,
    xpIntoLevel: levelInfo.xpIntoLevel,
    xpForThisLevel: levelInfo.xpForThisLevel,
    streakCount: user.streakCount,
    lastActiveOn: user.lastActiveOn,
    emailVerified: user.emailVerified,
    college: user.college,
    badgeCount: user._count.userBadges,
    tasksCompleted: user._count.userTasks,
    createdAt: user.createdAt,
  };
}

// GET /users/me
usersRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: await publicUser(req.user!.sub) });
  })
);

const patchSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  batch: z.string().regex(/^\d{4}$/).optional(),
});

// PATCH /users/me — update editable profile fields.
usersRouter.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = patchSchema.parse(req.body);
    await prisma.user.update({ where: { id: req.user!.sub }, data });
    res.json({ user: await publicUser(req.user!.sub) });
  })
);

// GET /users/:id — public profile of another user (same-college only).
usersRouter.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const me = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.sub } });
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target || target.collegeId !== me.collegeId) {
      throw new HttpError(404, "User not found.");
    }
    res.json({ user: await publicUser(target.id) });
  })
);
