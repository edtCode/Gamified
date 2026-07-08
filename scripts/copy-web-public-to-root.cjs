const fs = require("node:fs/promises");
const path = require("node:path");

async function exists(dir) {
  try {
    const stat = await fs.stat(dir);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function main() {
  const root = process.cwd();
  const webPublic = path.join(root, "apps", "web", "public");
  const rootPublic = path.join(root, "public");

  await fs.rm(rootPublic, { recursive: true, force: true });
  await fs.mkdir(rootPublic, { recursive: true });

  if (await exists(webPublic)) {
    await fs.cp(webPublic, rootPublic, { recursive: true });
    console.log("Copied apps/web/public into root public for Vercel output.");
    return;
  }

  await fs.writeFile(
    path.join(rootPublic, ".vercel-output-placeholder"),
    "Created by build so Vercel outputDirectory=public is never missing.\n"
  );
  console.log("Created root public fallback for Vercel output.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
