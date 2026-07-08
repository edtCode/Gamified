import { prisma } from "../lib/prisma";
import { notify } from "./notifications";

// Local badge shape used for typing during build. Avoid importing the generated
// `Badge` model type directly from `@prisma/client` because `prisma generate`
// may not run prior to `tsc` on certain build systems (e.g., Vercel).
type BadgeRecord = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  criteria: any;
  createdAt: Date;
};

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

type BadgeSnapshot = {
  taskCount: number;
  userLevel: number;
  streakCount: number;
  trackTaskIds: Map<string, string[]>;
};

async function buildSnapshot(userId: string, criteriaList: Criteria[]): Promise<BadgeSnapshot> {
  const trackSlugs = Array.from(
    new Set(
      criteriaList
        .filter((criteria): criteria is { type: "TRACK_COMPLETED"; trackSlug: string } => criteria.type === "TRACK_COMPLETED")
        .map((criteria) => criteria.trackSlug)
    )
  );

  const [taskCount, user, tracks] = await Promise.all([
    prisma.userTask.count({ where: { userId, status: "DONE" } }),
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { level: true, streakCount: true },
    }),
    trackSlugs.length
      ? prisma.track.findMany({
          where: { slug: { in: trackSlugs } },
          select: { slug: true, tasks: { select: { id: true } } },
        })
      : Promise.resolve([]),
  ]);

  return {
    taskCount,
    userLevel: user.level,
    streakCount: user.streakCount,
    trackTaskIds: new Map(tracks.map((track: any) => [track.slug, track.tasks.map((task: any) => task.id)])),
  };
}

async function meets(userId: string, criteria: Criteria, snapshot: BadgeSnapshot): Promise<boolean> {
  switch (criteria.type) {
    case "TASKS_COMPLETED": {
      return snapshot.taskCount >= criteria.count;
    }
    case "LEVEL_REACHED": {
      return snapshot.userLevel >= criteria.level;
    }
    case "STREAK_REACHED": {
      return snapshot.streakCount >= criteria.days;
    }
    case "TRACK_COMPLETED": {
      const taskIds = snapshot.trackTaskIds.get(criteria.trackSlug);
      if (!taskIds?.length) return false;
      const doneCount = await prisma.userTask.count({
        where: {
          userId,
          status: "DONE",
          taskId: { in: taskIds },
        },
      });
      return doneCount >= taskIds.length;
    }
    default:
      return false;
  }
}

// Evaluate every badge the user hasn't earned yet; award those now satisfied.
// Returns the newly awarded badges (each also produces a notification).
export async function evaluateBadges(userId: string): Promise<BadgeRecord[]> {
  const [allBadges, earned] = await Promise.all([
    prisma.badge.findMany(),
    prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    }),
  ]);
  const earnedIds = new Set(earned.map((e: any) => e.badgeId));
  const pending = allBadges.filter((badge: any) => !earnedIds.has(badge.id));
  const criteriaList = pending.map((badge: any) => badge.criteria as unknown as Criteria);
  const snapshot = await buildSnapshot(userId, criteriaList);
  const newlyAwarded: BadgeRecord[] = [];

  for (const badge of pending) {
    const criteria = badge.criteria as unknown as Criteria;
    if (await meets(userId, criteria, snapshot)) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
      await notify(userId, "BADGE", `New badge unlocked: ${badge.icon} ${badge.name}`);
      newlyAwarded.push(badge);
    }
  }

  return newlyAwarded;
}
