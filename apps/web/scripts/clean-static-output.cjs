const fs = require("node:fs/promises");
const path = require("node:path");

async function main() {
  const root = process.cwd();
  await fs.rm(path.join(root, "out"), { recursive: true, force: true });
  await fs.rm(path.join(root, "public"), { recursive: true, force: true });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
