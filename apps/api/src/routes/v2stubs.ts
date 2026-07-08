import { Router } from "express";
import crypto from "crypto";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { redis, redisReady } from "../lib/redis";
import { getIo } from "../sockets/registry";

export const v2Router = Router();

// --- Roadmap engine: return tracks with tasks (already modelled in Prisma)
v2Router.get("/roadmap", requireAuth, async (req, res, next) => {
  try {
    const tracks = await prisma.track.findMany({
      orderBy: { order: "asc" },
      include: { tasks: { orderBy: { order: "asc" } } },
    });
    res.json({ tracks });
  } catch (err) {
    next(err);
  }
});

// --- Simple Rooms API using Redis (no DB migration required)
// Rooms are stored in Redis sets/hashes under keys: `rooms` (set of ids),
// `room:<id>` (hash with metadata), `room:<id>:members` (set of user ids).

v2Router.get("/rooms", requireAuth, async (req, res) => {
  if (!redisReady()) return res.json({ rooms: [] });
  const userId = req.user!.sub;
  const ids = (await redis.smembers("rooms")) || [];
  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.hgetall(`room:${id}`);
    pipeline.scard(`room:${id}:members`);
    pipeline.sismember(`room:${id}:members`, userId);
  }
  const results = await pipeline.exec();
  const rooms = ids.map((id, index) => {
    const base = index * 3;
    const meta = (results?.[base]?.[1] ?? {}) as Record<string, string>;
    const members = Number(results?.[base + 1]?.[1] ?? 0);
    // Tell the client whether the current user is already a member, so the UI
    // can show a "Joined" state instead of an always-clickable "Join" button.
    const joined = Number(results?.[base + 2]?.[1] ?? 0) === 1;
    return { id, name: meta.name ?? "", creatorId: meta.creatorId ?? null, members, joined };
  });
  res.json({ rooms });
});

v2Router.post("/rooms", requireAuth, async (req, res, next) => {
  try {
    const name = (req.body?.name ?? "") as string;
    if (!name) return res.status(400).json({ error: "name is required" });
    if (!redisReady()) return res.status(503).json({ error: "Redis unavailable" });
    const id = crypto.randomBytes(8).toString("hex");
    await redis.sadd("rooms", id);
    await redis.hset(`room:${id}`, { name, creatorId: req.user!.sub });
    await redis.sadd(`room:${id}:members`, req.user!.sub);
    res.status(201).json({ id, name });
  } catch (err) {
    next(err);
  }
});

v2Router.post("/rooms/:id/join", requireAuth, async (req, res) => {
  const id = req.params.id;
  const userId = req.user!.sub;
  if (!redisReady()) return res.status(503).json({ error: "Redis unavailable" });
  const exists = await redis.sismember("rooms", id);
  if (!exists) return res.status(404).json({ error: "Room not found" });
  // sadd returns 1 if newly added, 0 if the user was already a member.
  const added = await redis.sadd(`room:${id}:members`, userId);
  const members = await redis.scard(`room:${id}:members`);

  // Emit Socket.IO event to notify all clients
  const io = getIo();
  if (io) {
    io.emit("room:member:joined", { roomId: id, userId, members });
  }

  res.json({ id, members, joined: true, alreadyMember: added === 0 });
});

v2Router.post("/rooms/:id/leave", requireAuth, async (req, res) => {
  const id = req.params.id;
  const userId = req.user!.sub;
  if (!redisReady()) return res.status(503).json({ error: "Redis unavailable" });
  const exists = await redis.sismember("rooms", id);
  if (!exists) return res.status(404).json({ error: "Room not found" });
  await redis.srem(`room:${id}:members`, userId);
  const members = await redis.scard(`room:${id}:members`);

  const io = getIo();
  if (io) {
    io.emit("room:member:left", { roomId: id, userId, members });
  }

  res.json({ id, members, joined: false });
});

// --- Pair matching: very small matcher (returns an eligible peer or mentor)
v2Router.get("/pair-matching", requireAuth, async (req, res, next) => {
  try {
    const me = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.sub } });
    // Prefer an available mentor (2+ levels above) in the same college.
    const mentor = await prisma.user.findFirst({
      where: { collegeId: me.collegeId, level: { gte: me.level + 2 }, id: { not: me.id } },
      orderBy: [{ level: "desc" }, { xp: "desc" }],
      select: { id: true, name: true, level: true, batch: true },
    });
    if (mentor) return res.json({ type: "mentor", user: mentor });

    // Otherwise pick a random peer within +-1 level.
    const peers = await prisma.user.findMany({
      where: { collegeId: me.collegeId, id: { not: me.id }, level: { gte: me.level - 1, lte: me.level + 1 } },
      orderBy: { xp: "desc" },
      take: 10,
      select: { id: true, name: true, level: true, batch: true },
    });
    if (peers.length === 0) return res.status(404).json({ error: "No matches available" });
    const pick = peers[Math.floor(Math.random() * peers.length)];
    res.json({ type: "peer", user: pick });
  } catch (err) {
    next(err);
  }
});

// --- Admin analytics (simple aggregates)
v2Router.get("/analytics", requireAuth, async (req, res) => {
  // only admins
  if (req.user!.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });
  const [userCount, totalXp, badgeCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.aggregate({ _sum: { xp: true } }).then((r: any) => r._sum.xp ?? 0),
    prisma.userBadge.count(),
  ]);
  const rooms = redisReady() ? (await redis.scard("rooms")) : 0;
  res.json({ users: userCount, totalXp, badgesAwarded: badgeCount, activeRooms: rooms });
});

// --- Placement readiness score: simple heuristic
v2Router.get("/placement-score", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.sub } });
    const tasksCompleted = await prisma.userTask.count({ where: { userId: user.id } });
    const badges = await prisma.userBadge.count({ where: { userId: user.id } });
    // score out of ~1000
    const score = Math.min(1000, user.xp + tasksCompleted * 100 + badges * 200 + (user.level - 1) * 150);
    res.json({ score, components: { xp: user.xp, tasksCompleted, badges, level: user.level } });
  } catch (err) {
    next(err);
  }
});
