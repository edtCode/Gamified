import { Badge } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { notify } from "./notifications";

// Criteria shapes stored in Badge.criteria (JSON):
//   { type: "TASKS_COMPLETED", count: number }
//   { type: "TRACK_COMPLETED", trackSlug: string }
//   { type: "LEVEL_REACHED",   level: number }
//   { type: "STREAK_REACHED",  days: number }
type Criteria =
  | { type: "TASKS_COMPLETED"; count: number }
  | { type: "TRACK_COMPLETED"; trackSlug: string }
  | { type: "LEVEL_REACHED"; level: number }
  | { type: "STREAK_REACHED"; days: number };

async function meets(userId: string, criteria: Criteria): Promise<boolean> {
  switch (criteria.type) {
    case "TASKS_COMPLETED": {
      const done = await prisma.userTask.count({
        where: { userId, status: "DONE" },
      });
      return done >= criteria.count;
    }
    case "LEVEL_REACHED": {
      const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
      return user.level >= criteria.level;
    }
    case "STREAK_REACHED": {
      const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
      return user.streakCount >= criteria.days;
    }
    case "TRACK_COMPLETED": {
      const track = await prisma.track.findUnique({
        where: { slug: criteria.trackSlug },
        include: { tasks: { select: { id: true } } },
      });
      if (!track || track.tasks.length === 0) return false;
      const doneCount = await prisma.userTask.count({
        where: {
          userId,
          status: "DONE",
          taskId: { in: track.tasks.map((t: any) => t.id) },
        },
      });
      return doneCount >= track.tasks.length;
    }
    default:
      return false;
  }
}

// Evaluate every badge the user hasn't earned yet; award those now satisfied.
// Returns the newly awarded badges (each also produces a notification).
export async function evaluateBadges(userId: string): Promise<Badge[]> {
  const [allBadges, earned] = await Promise.all([
    prisma.badge.findMany(),
    prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    }),
  ]);
  const earnedIds = new Set(earned.map((e: any) => e.badgeId));
  const newlyAwarded: Badge[] = [];

  for (const badge of allBadges) {
    if (earnedIds.has(badge.id)) continue;
    const criteria = badge.criteria as unknown as Criteria;
    if (await meets(userId, criteria)) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
      await notify(userId, "BADGE", `New badge unlocked: ${badge.icon} ${badge.name}`);
      newlyAwarded.push(badge);
    }
  }

  return newlyAwarded;
}
