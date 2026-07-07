import { prisma } from "../lib/prisma";
import { redis, redisReady } from "../lib/redis";

export interface LeaderboardRow {
  rank: number;
  userId: string;
  name: string;
  level: number;
  xp: number;
  isCurrentUser?: boolean;
}

function key(collegeId: string, batch: string): string {
  return `lb:${collegeId}:${batch}`;
}

// Invalidate the cached leaderboard for a user's batch after their XP changes.
export async function invalidateLeaderboard(collegeId: string, batch: string): Promise<void> {
  if (!redisReady()) return;
  try {
    await redis.del(key(collegeId, batch));
  } catch {
    /* cache is best-effort */
  }
}

// Compute the batch leaderboard from Postgres (source of truth).
async function computeFromDb(collegeId: string, batch: string): Promise<LeaderboardRow[]> {
  const users = await prisma.user.findMany({
    where: { collegeId, batch },
    orderBy: [{ xp: "desc" }, { createdAt: "asc" }],
    select: { id: true, name: true, level: true, xp: true },
  });
  return users.map((u: any, i: number) => ({
    rank: i + 1,
    userId: u.id,
    name: u.name,
    level: u.level,
    xp: u.xp,
  }));
}

// Batch-wise leaderboard, cached in Redis for 30s. Falls back to Postgres when
// Redis is down. `currentUserId` flags the requesting user's own row.
export async function getBatchLeaderboard(
  collegeId: string,
  batch: string,
  currentUserId?: string
): Promise<LeaderboardRow[]> {
  let rows: LeaderboardRow[] | null = null;

  if (redisReady()) {
    try {
      const cached = await redis.get(key(collegeId, batch));
      if (cached) rows = JSON.parse(cached) as LeaderboardRow[];
    } catch {
      /* ignore and recompute */
    }
  }

  if (!rows) {
    rows = await computeFromDb(collegeId, batch);
    if (redisReady()) {
      try {
        await redis.set(key(collegeId, batch), JSON.stringify(rows), "EX", 30);
      } catch {
        /* best-effort */
      }
    }
  }

  return rows.map((r: LeaderboardRow) => ({ ...r, isCurrentUser: r.userId === currentUserId }));
}
