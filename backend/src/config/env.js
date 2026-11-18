import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * Everything the server reads from the environment, in one place.
 * See .env.example for what each value means.
 */
export const env = {
  port: Number(process.env.PORT) || 5000,
  isProduction: process.env.NODE_ENV === "production",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/myst-tattoo",
  clientOrigins: process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map((s) => s.trim())
    : "*",

  /** The one password that opens the admin panel. Empty = nobody can log in. */
  adminPassword: process.env.ADMIN_PASSWORD || "",
  /** Signs the admin session cookie. Empty = nobody can log in. */
  sessionSecret: process.env.SESSION_SECRET || "",

  /** Where uploaded photos are kept on disk. */
  uploadDir: path.resolve(root, process.env.UPLOAD_DIR || "uploads"),
};
