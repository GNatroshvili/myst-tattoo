import "dotenv/config";
import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { loginConfigured } from "./middleware/auth.js";

const server = app.listen(env.port, () => {
  console.log(`[server] listening on http://localhost:${env.port}`);
  if (!loginConfigured()) {
    console.warn("[server] admin sign-in is off: set ADMIN_PASSWORD and SESSION_SECRET in .env");
  }
});

// Connect to the database without blocking server start-up.
connectDB(env.mongoUri).catch((err) => {
  console.error(`[db] could not connect to ${env.mongoUri}`);
  console.error(`[db] ${err.message}`);
  console.error("[db] server keeps running; start MongoDB and restart to connect.");
});

async function shutdown(signal) {
  console.log(`\n[server] ${signal} received, shutting down...`);
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
