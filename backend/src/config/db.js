import mongoose from "mongoose";

/**
 * Connects to MongoDB using the given URI.
 * Resolves on success; rejects on failure so the caller decides what to do.
 */
export async function connectDB(uri) {
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

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
