import { prisma } from "../lib/prisma";

export interface LevelInfo {
  level: number;
  title: string;
  currentLevelMinXp: number;
  nextLevelXp: number | null; // null when at the max defined level
  xpIntoLevel: number;
  xpForThisLevel: number | null; // span of the current level, null at max
}

// Resolve the level (and progress bounds) for a given XP total from LevelDef.
export async function resolveLevel(xp: number): Promise<LevelInfo> {
  const levels = await prisma.levelDef.findMany({ orderBy: { level: "asc" } });
  if (levels.length === 0) {
    return {
      level: 1,
      title: "Novice",
      currentLevelMinXp: 0,
      nextLevelXp: null,
      xpIntoLevel: xp,
      xpForThisLevel: null,
    };
  }

  let current = levels[0];
  for (const def of levels) {
    if (xp >= def.minXp) current = def;
    else break;
  }
  const next = levels.find((l: any) => l.level === current.level + 1) ?? null;

  return {
    level: current.level,
    title: current.title,
    currentLevelMinXp: current.minXp,
    nextLevelXp: next?.minXp ?? null,
    xpIntoLevel: xp - current.minXp,
    xpForThisLevel: next ? next.minXp - current.minXp : null,
  };
}

export interface AwardResult {
  xp: number;
  level: number;
  leveledUp: boolean;
  previousLevel: number;
  newLevelTitle: string;
}

// Add XP to a user, recompute their level, and persist. Returns whether a
// level-up occurred so callers can fire notifications / badge checks.
export async function awardXp(userId: string, amount: number): Promise<AwardResult> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const previousLevel = user.level;
  const newXp = user.xp + amount;
  const info = await resolveLevel(newXp);

  await prisma.user.update({
    where: { id: userId },
    data: { xp: newXp, level: info.level },
  });

  return {
    xp: newXp,
    level: info.level,
    leveledUp: info.level > previousLevel,
    previousLevel,
    newLevelTitle: info.title,
  };
}
