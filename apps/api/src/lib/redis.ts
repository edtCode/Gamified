import Redis from "ioredis";
import { config } from "./config";

// A single shared Redis connection. If Redis is unavailable, the app keeps
// running — leaderboard.ts falls back to computing rankings directly from
// Postgres, so caching is a performance optimization, not a hard dependency.
export const redis = new Redis(config.redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => (times > 5 ? null : Math.min(times * 200, 2000)),
});

let ready = false;

redis.on("ready", () => {
  ready = true;
  console.log("✅ Redis connected");
});
redis.on("error", (err) => {
  if (ready) console.warn("⚠️  Redis error:", err.message);
  ready = false;
});
redis.on("end", () => {
  ready = false;
});

export function redisReady(): boolean {
  return ready;
}

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
  } catch (err) {
    console.warn(
      "⚠️  Redis unavailable — leaderboard will read straight from Postgres.",
      (err as Error).message
    );
  }
}
