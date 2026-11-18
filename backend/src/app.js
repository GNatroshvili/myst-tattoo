import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import api from "./routes/index.js";

const app = express();

// The site sits in front of this server and forwards requests to it, so the
// visitor's address arrives in a header. Trusted only from this machine.
app.set("trust proxy", "loopback");

// --- Core middleware ---
app.use(cors({ origin: env.clientOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Uploaded photos ---
// File names are random and never reused, so browsers may keep them forever.
app.use("/uploads", express.static(env.uploadDir, { maxAge: "365d", immutable: true, index: false }));

// --- Health check ---
app.get("/api/health", (_req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    status: "ok",
    service: "myst-tattoo-backend",
    db: states[mongoose.connection.readyState] ?? "unknown",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// --- API routes ---
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
  if (status >= 500) console.error(err);
  res.status(status).json({
    message: status >= 500 ? "Internal server error" : err.message,
    code: err.code,
    details: err.details,
  });
});

export default app;
