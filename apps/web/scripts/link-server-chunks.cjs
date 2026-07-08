const fs = require("node:fs/promises");
const path = require("node:path");

async function directoryExists(dir) {
  try {
    const stat = await fs.stat(dir);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function copyStaticExportToPublic(root) {
  const outDir = path.join(root, "out");
  const nextDir = path.join(root, ".next");
  const publicDir = path.join(root, "public");

  if (await directoryExists(outDir)) {
    await fs.rm(publicDir, { recursive: true, force: true });
    await fs.mkdir(publicDir, { recursive: true });
    await fs.cp(outDir, publicDir, { recursive: true });
    if (await directoryExists(nextDir)) {
      await fs.cp(nextDir, publicDir, { recursive: true, force: true });
    }
    console.log("Copied static export and Next manifests into public for Vercel output.");
    return;
  }

  await fs.mkdir(publicDir, { recursive: true });
  if (await directoryExists(nextDir)) {
    await fs.cp(nextDir, publicDir, { recursive: true, force: true });
    console.log("Copied Next manifests into public for Vercel output.");
    return;
  }

  await fs.writeFile(
    path.join(publicDir, ".vercel-output-placeholder"),
    "Created by build so Vercel outputDirectory=public is never missing.\n"
  );
  console.log("Created public directory fallback for Vercel output.");
}

async function main() {
  const root = process.cwd();
  const serverDir = path.join(root, ".next", "server");
  const chunksDir = path.join(serverDir, "chunks");

  try {
    const stat = await fs.stat(chunksDir);
    if (!stat.isDirectory()) {
      console.log("No server chunks directory found; nothing to link.");
      await copyStaticExportToPublic(root);
      return;
    }
  } catch {
    console.log("No server chunks directory found; nothing to link.");
    await copyStaticExportToPublic(root);
    return;
  }

  const entries = await fs.readdir(chunksDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".js")) continue;
    const targetPath = path.join(serverDir, entry.name);
    const sourcePath = path.join("chunks", entry.name);

    try {
      const existing = await fs.lstat(targetPath);
      if (existing.isSymbolicLink() || existing.isFile()) {
        await fs.unlink(targetPath);
      }
    } catch {
      // no-op
    }

    await fs.symlink(sourcePath, targetPath);
  }

  console.log("Linked server chunk files from .next/server/chunks into .next/server.");
  await copyStaticExportToPublic(root);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
