import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { dbProblem, ready } from "./config/db.js";
import { env } from "./config/env.js";
import api from "./routes/index.js";
import { HttpError } from "./utils/http.js";
import { storage } from "./utils/storage.js";

/**
 * The Express app. Run directly it is started by server.js; on Vercel this
 * file is the entry point and the app is loaded on demand as a function.
 */
const app = express();

// The site sits in front of this server and forwards requests to it, so the
// visitor's address arrives in a header. That header is trusted from this
// machine only, except on Vercel, whose own network writes it.
app.set("trust proxy", env.onVercel ? true : "loopback");

// --- Core middleware ---
app.use(cors({ origin: env.clientOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Uploaded photos kept on disk ---
// File names are random and never reused, so browsers may keep them forever.
// (Photos kept in Vercel Blob are served by Blob itself; see utils/storage.js.)
app.use("/uploads", express.static(env.uploadDir, { maxAge: "365d", immutable: true, index: false }));

// --- Health check ---
// Waits for the database (a few seconds at most) and reports what is true: on
// Vercel the app is paused between requests, so a connection left to finish
// "in the background" would never be seen finishing.
app.get("/api/health", async (_req, res) => {
  const problem = await ready().then(
    () => null,
    (err) => dbProblem(err)
  );
  res.json({
    status: "ok",
    service: "myst-tattoo-backend",
    db: problem ? "unreachable" : mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    // why, in plain words, when the database cannot be reached
    dbProblem: problem ?? undefined,
    photos: storage,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// --- API routes ---
// Every route needs the database: wait until it is connected, and say so
// plainly when it cannot be reached instead of letting each query time out.
app.use("/api", async (_req, _res, next) => {
  try {
    await ready();
  } catch (err) {
    throw new HttpError(503, `The database cannot be reached: ${dbProblem(err)}`, "db_down");
  }
  next();
});
app.use("/api", api);

// --- 404 ---
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// --- Error handler ---
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  // mongoose's own complaints about bad input are the client's mistake, not ours
  const status = err.status || (err.name === "ValidationError" || err.name === "CastError" ? 400 : 500);
  // an error raised on purpose (HttpError) explains itself; anything else is a
  // bug, logged here and kept from the visitor
  const known = Boolean(err.status);
  if (!known && status >= 500) console.error(err);
  res.status(status).json({
    message: known || status < 500 ? err.message : "Internal server error",
    code: err.code,
    details: err.details,
  });
});

export default app;
