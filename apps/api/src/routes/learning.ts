import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler, HttpError } from "../lib/http";
import { requireAuth } from "../middleware/auth";
import { awardXp } from "../services/xp";
import { touchStreak } from "../services/streak";
import { evaluateBadges } from "../services/badges";
import { invalidateLeaderboard } from "../services/leaderboard";
import { notify } from "../services/notifications";
import { publicUser } from "./users";

export const learningRouter = Router();

// GET /tracks — all tracks (ordered) with task counts.
learningRouter.get(
  "/tracks",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const tracks = await prisma.track.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { tasks: true } } },
    });
    res.json({
      tracks: tracks.map((t: any) => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
        description: t.description,
        order: t.order,
        taskCount: t._count.tasks,
      })),
    });
  })
);

// GET /tracks/:slug/tasks — tasks in a track, each flagged with the user's
// completion state and whether it is unlocked at their level.
learningRouter.get(
  "/tracks/:slug/tasks",
  requireAuth,
  asyncHandler(async (req, res) => {
    const track = await prisma.track.findUnique({
      where: { slug: req.params.slug },
      include: { tasks: { orderBy: { order: "asc" } } },
    });
    if (!track) throw new HttpError(404, "Track not found.");

    const me = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.sub } });
    const done = await prisma.userTask.findMany({
      where: { userId: me.id, taskId: { in: track.tasks.map((t) => t.id) } },
      select: { taskId: true, completedAt: true },
    });
    const doneMap = new Map(done.map((d) => [d.taskId, d.completedAt]));

    res.json({
      track: { id: track.id, slug: track.slug, name: track.name, description: track.description },
      tasks: track.tasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        xpReward: t.xpReward,
        order: t.order,
        levelRequired: t.levelRequired,
        completed: doneMap.has(t.id),
        completedAt: doneMap.get(t.id) ?? null,
        locked: me.level < t.levelRequired,
      })),
    });
  })
);

// GET /me/tasks — the current user's completed tasks.
learningRouter.get(
  "/me/tasks",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userTasks = await prisma.userTask.findMany({
      where: { userId: req.user!.sub },
      orderBy: { completedAt: "desc" },
      include: { task: { include: { track: { select: { slug: true, name: true } } } } },
    });
    res.json({
      tasks: userTasks.map((ut: any) => ({
        id: ut.task.id,
        title: ut.task.title,
        xpReward: ut.task.xpReward,
        track: ut.task.track,
        completedAt: ut.completedAt,
      })),
    });
  })
);

// POST /me/tasks/:taskId/complete — the core gamification action.
learningRouter.post(
  "/me/tasks/:taskId/complete",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.sub;
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) throw new HttpError(404, "Task not found.");

    const me = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (me.level < task.levelRequired) {
      throw new HttpError(
        403,
        `This task unlocks at level ${task.levelRequired}. You are level ${me.level}.`
      );
    }

    const already = await prisma.userTask.findUnique({
      where: { userId_taskId: { userId, taskId: task.id } },
    });
    if (already) throw new HttpError(409, "Task already completed.");

    await prisma.userTask.create({
      data: { userId, taskId: task.id, status: "DONE" },
    });

    // Streak first (badge criteria may depend on it), then XP + level.
    const streak = await touchStreak(userId);
    const award = await awardXp(userId, task.xpReward);

    if (award.leveledUp) {
      await notify(
        userId,
        "LEVEL_UP",
        `Level up! You reached level ${award.level} — ${award.newLevelTitle} 🎉`
      );
    }
    if (streak.changed && streak.streakCount > 1) {
      await notify(userId, "STREAK", `🔥 ${streak.streakCount}-day streak! Keep it going.`);
    }

    const newBadges = await evaluateBadges(userId);
    await invalidateLeaderboard(me.collegeId, me.batch);

    res.json({
      xpGained: task.xpReward,
      leveledUp: award.leveledUp,
      newLevel: award.level,
      newLevelTitle: award.newLevelTitle,
      streakCount: streak.streakCount,
      newBadges: newBadges.map((b: any) => ({
        slug: b.slug,
        name: b.name,
        icon: b.icon,
        description: b.description,
      })),
      user: await publicUser(userId),
    });
  })
);
