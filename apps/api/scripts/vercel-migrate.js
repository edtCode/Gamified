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
const { execSync } = require("child_process");

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
try {
  execSync("prisma migrate deploy", { stdio: "inherit" });
  console.log("[vercel-migrate] Migrations applied.");
} catch (err) {
  console.error("[vercel-migrate] `prisma migrate deploy` failed.");
  // Fail the build: deploying app code against an un-migrated database would
  // surface as 500s at runtime, which is worse than a visible build failure.
  process.exit(1);
}
