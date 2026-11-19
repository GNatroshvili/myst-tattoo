import "dotenv/config";
import mongoose from "mongoose";
import { env } from "../config/env.js";

/**
 * Copies every record from one MongoDB database into another, empty one:
 * `npm run db:copy` (or `npm run db:copy -- <address of the database to copy from>`).
 *
 * For moving a site's data from this machine to a hosted database: set
 * MONGODB_URI in .env to the new database and run it. Records are copied from
 * the local database unless another address is given.
 *
 * Nothing is overwritten: if the new database already holds records, the
 * script stops before copying anything.
 */
const from = process.argv[2] ?? "mongodb://127.0.0.1:27017/myst-tattoo";
const to = env.mongoUri;

if (from === to) {
  console.error("[copy] MONGODB_URI is the database being copied from: set it to the new database first");
  process.exit(1);
}

const source = await mongoose.createConnection(from, { serverSelectionTimeoutMS: 5000 }).asPromise();
const target = await mongoose.createConnection(to, { serverSelectionTimeoutMS: 10000 }).asPromise();

// sign-in attempts are short-lived bookkeeping, not site data
const names = (await source.db.listCollections().toArray())
  .map((collection) => collection.name)
  .filter((name) => !name.startsWith("system.") && name !== "loginattempts");

const taken = [];
for (const name of names) {
  if ((await target.db.collection(name).countDocuments()) > 0) taken.push(name);
}
if (taken.length > 0) {
  console.error(`[copy] the new database already has records (${taken.join(", ")}); nothing was copied`);
  await Promise.all([source.close(), target.close()]);
  process.exit(1);
}

for (const name of names) {
  const docs = await source.db.collection(name).find().toArray();
  if (docs.length > 0) await target.db.collection(name).insertMany(docs);
  console.log(`[copy] ${name}: ${docs.length}`);
}
console.log(`[copy] done: ${source.name} -> ${target.host}/${target.name}`);
await Promise.all([source.close(), target.close()]);
