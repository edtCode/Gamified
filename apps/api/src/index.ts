import http from "http";
import { createApp } from "./app";
import { config } from "./lib/config";
import { connectRedis } from "./lib/redis";
import { initSockets } from "./sockets";

async function main() {
  await connectRedis();

  const app = createApp();
  const server = http.createServer(app);
  initSockets(server);

  server.listen(config.port, () => {
    console.log(`\n🚀 Gamified API listening on http://localhost:${config.port}`);
    console.log(`   CORS origin: ${config.webOrigin}`);
    console.log(`   Allowed signup domains: ${config.allowedEmailDomains.join(", ")}\n`);
  });
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
