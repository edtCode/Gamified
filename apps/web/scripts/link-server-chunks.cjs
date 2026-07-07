const fs = require("node:fs/promises");
const path = require("node:path");

async function main() {
  const root = process.cwd();
  const serverDir = path.join(root, ".next", "server");
  const chunksDir = path.join(serverDir, "chunks");

  try {
    const stat = await fs.stat(chunksDir);
    if (!stat.isDirectory()) {
      console.log("No server chunks directory found; nothing to link.");
      return;
    }
  } catch {
    console.log("No server chunks directory found; nothing to link.");
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
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
