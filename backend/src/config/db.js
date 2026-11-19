import dns from "node:dns";
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
  const options = { serverSelectionTimeoutMS: 8000 };
  try {
    await mongoose.connect(uri, options);
  } catch (err) {
    // A mongodb+srv:// address is found through DNS records that Node looks up
    // itself. On some machines the DNS server Node is given cannot answer that,
    // though the rest of the system resolves the address fine. Ask public DNS
    // servers instead and try once more.
    if (!uri.startsWith("mongodb+srv:") || !/querySrv|queryTxt/.test(err.message ?? "")) throw err;
    console.warn("[db] this machine's DNS could not look up the cluster; asking public DNS servers instead");
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
    await mongoose.connect(uri, options);
  }
  return mongoose.connection;
}

/**
 * Why connecting failed, in a sentence that is safe to show anyone: it names
 * the kind of problem, never the address or the credentials. The full error
 * goes to the server's log.
 */
export function dbProblem(err) {
  const text = `${err?.name ?? ""} ${err?.message ?? ""}`;
  if (/auth/i.test(text)) {
    return "the user name or password in MONGODB_URI is not accepted";
  }
  if (/ENOTFOUND|querySrv|EBADNAME|Invalid scheme|must start with|unescaped|malformed/i.test(text)) {
    return "MONGODB_URI is not a valid address or its cluster cannot be found (a password with special characters must be URL-encoded)";
  }
  if (/whitelist|allowlist|Server ?selection|ECONNREFUSED|ETIMEDOUT|timed out/i.test(text)) {
    return "the database does not answer (in Atlas, check Network Access allows 0.0.0.0/0 and the cluster is running)";
  }
  return "connecting failed for an unexpected reason (see the server's log)";
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
        console.error(`[db] could not connect: ${err.message}`);
        throw err;
      });
  }
  return pending;
}
