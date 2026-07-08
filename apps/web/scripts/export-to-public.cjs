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
  const outDir = path.join(root, "out");
  const publicDir = path.join(root, "public");

  if (!(await exists(outDir))) {
    throw new Error("Next static export did not create an out directory.");
  }

  await fs.rm(publicDir, { recursive: true, force: true });
  await fs.mkdir(publicDir, { recursive: true });
  await fs.cp(outDir, publicDir, { recursive: true });

  console.log("Copied static export from out into public for Vercel output.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
