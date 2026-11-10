import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

// --- Core middleware ---
const origins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((s) => s.trim())
  : "*";

app.use(cors({ origin: origins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// --- API routes will be mounted here, e.g. ---
// import bookingRoutes from "./routes/bookings.js";
// app.use("/api/bookings", bookingRoutes);

// --- 404 ---
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// --- Error handler ---
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

export default app;
