import mongoose from "mongoose";
import { upgradeData } from "../utils/upgrade.js";
import { env } from "./env.js";

mongoose.set("strictQuery", true);
mongoose.connection.on("connected", () => {
  console.log(`[db] connected -> ${mongoose.connection.host}/${mongoose.connection.name}`);
});
mongoose.connection.on("disconnected", () => {
  console.warn("[db] disconnected");
});
mongoose.connection.on("error", (err) => {
  console.error("[db] error:", err.message);
});

/**
 * Connects to MongoDB using the given URI.
 * Resolves on success; rejects on failure so the caller decides what to do.
 */
export async function connectDB(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}

let pending = null;

/**
 * Makes sure the server can use the database: connects, then brings records
 * saved by earlier versions up to date. The work is done once and shared by
 * every caller; after a failure the next call tries again.
 *
 * Requests wait for this rather than the server connecting at start-up,
 * because on Vercel there is no start-up: the app is loaded on demand.
 */
export function ready() {
  if (!pending) {
    pending = connectDB(env.mongoUri)
      .then(() =>
        upgradeData().catch((err) => {
          console.error(`[db] could not bring older records up to date: ${err.message}`);
        })
      )
      .catch((err) => {
        pending = null;
        throw err;
      });
  }
  return pending;
}
