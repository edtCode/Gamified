import http from "http";
import { createApp } from "./app";
import { config } from "./lib/config";
import { connectRedis } from "./lib/redis";
import { initSockets } from "./sockets";

async function main() {
  await connectRedis();

  const app = createApp();
  const server = http.createServer(app);
  const io = initSockets(server);
  server.listen(config.port, () => {
    console.log(`\n🚀 Gamified API listening on http://localhost:${config.port}`);
    console.log(`   CORS origin: ${config.webOrigin}`);
    console.log(`   Allowed signup domains: ${config.allowedEmailDomains.join(", ")}\n`);
  });

  server.on("error", (err: any) => {
    if (err && err.code === "EADDRINUSE") {
      console.error(`Port ${config.port} already in use — shutting down.`);
      process.exit(1);
    }
    console.error("Server error:", err);
    process.exit(1);
  });

  const shutdown = () => {
    console.log("Shutting down server...");
    // Close Socket.IO first (if present) then the HTTP server.
    try {
      if (io && typeof (io as any).close === "function") {
        (io as any).close();
      }
    } catch (err) {
      console.warn("Error closing Socket.IO:", err);
    }
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
    // Force exit if close takes too long
    setTimeout(() => process.exit(1), 5000).unref();
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
