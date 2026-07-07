import { prisma } from "../lib/prisma";

// Truncate a Date to a UTC day boundary so comparisons ignore time-of-day.
function dayStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function diffInDays(a: Date, b: Date): number {
  return Math.round((dayStart(a).getTime() - dayStart(b).getTime()) / 86_400_000);
}

export interface StreakResult {
  streakCount: number;
  changed: boolean; // true only on the first activity of a new day
}

// Record activity "today" and update the daily streak:
//   - first ever activity      → streak = 1
//   - already active today      → unchanged
//   - active yesterday          → streak + 1
//   - gap of 2+ days            → streak reset to 1
export async function touchStreak(userId: string): Promise<StreakResult> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const now = new Date();

  if (!user.lastActiveOn) {
    await prisma.user.update({
      where: { id: userId },
      data: { streakCount: 1, lastActiveOn: now },
    });
    return { streakCount: 1, changed: true };
  }

  const gap = diffInDays(now, user.lastActiveOn);
  if (gap === 0) {
    return { streakCount: user.streakCount, changed: false };
  }

  const nextStreak = gap === 1 ? user.streakCount + 1 : 1;
  await prisma.user.update({
    where: { id: userId },
    data: { streakCount: nextStreak, lastActiveOn: now },
  });
  return { streakCount: nextStreak, changed: true };
}
