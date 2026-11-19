import "dotenv/config";
import app from "./app.js";
import { disconnectDB, ready } from "./config/db.js";
import { env } from "./config/env.js";
import { loginConfigured } from "./middleware/auth.js";
import { storage } from "./utils/storage.js";

/**
 * Runs the app as an ordinary server: `npm run dev` / `npm start`.
 * (On Vercel this file is not used; app.js is loaded directly.)
 */
const server = app.listen(env.port, () => {
  console.log(`[server] listening on http://localhost:${env.port}`);
  console.log(`[server] photos are kept in ${storage === "blob" ? "Vercel Blob" : env.uploadDir}`);
  if (!loginConfigured()) {
    console.warn("[server] admin sign-in is off: set ADMIN_PASSWORD and SESSION_SECRET in .env");
  }
});

// Connect to the database without blocking server start-up; requests wait for it.
ready().catch(() => {
  console.error("[db] the server keeps running and tries again on the next request.");
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
