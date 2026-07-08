// Runs `prisma migrate deploy` at build time, but ONLY when it's both safe and
// meaningful to do so:
//
//   * VERCEL is set              -> we're building on Vercel, not a laptop.
//   * DATABASE_URL is set        -> there's actually a database to migrate.
//
// This keeps a plain local `npm install` (or CI without a DB) from trying to
// reach a database and failing. `migrate deploy` only applies already-committed
// migrations in prisma/migrations/ — it never generates schema on the fly and
// is safe to run on every deploy (already-applied migrations are skipped).
const { spawnSync } = require("child_process");
const path = require("path");

const apiRoot = path.resolve(__dirname, "..");
const maxAttempts = Number(process.env.PRISMA_MIGRATE_ATTEMPTS ?? 6);
const retryDelayMs = Number(process.env.PRISMA_MIGRATE_RETRY_MS ?? 12_000);

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

if (!process.env.VERCEL) {
  console.log("[vercel-migrate] Not on Vercel — skipping `prisma migrate deploy`.");
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.warn(
    "[vercel-migrate] DATABASE_URL is not set — skipping migrations. " +
      "Set it in the Vercel project settings so signin/signup have a database."
  );
  process.exit(0);
}

if (!process.env.DIRECT_URL) {
  console.warn(
    "[vercel-migrate] DIRECT_URL is not set — using DATABASE_URL for migrations. " +
      "For pooled providers like Supabase, set DIRECT_URL to the direct database connection string."
  );
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

console.log("[vercel-migrate] Applying database migrations (prisma migrate deploy)...");
for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
    cwd: apiRoot,
    encoding: "utf8",
    env: process.env,
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.status === 0) {
    console.log("[vercel-migrate] Migrations applied.");
    process.exit(0);
  }

  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  const lockTimedOut = output.includes("P1002") || output.includes("pg_advisory_lock");
  if (!lockTimedOut || attempt === maxAttempts) {
    console.error("[vercel-migrate] `prisma migrate deploy` failed.");
    // Fail the build: deploying app code against an un-migrated database would
    // surface as 500s at runtime, which is worse than a visible build failure.
    process.exit(result.status ?? 1);
  }

  console.warn(
    `[vercel-migrate] Migration lock is busy; retrying in ${Math.round(retryDelayMs / 1000)}s ` +
      `(${attempt}/${maxAttempts})...`
  );
  sleep(retryDelayMs);
}
