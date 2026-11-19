import mongoose from "mongoose";

/**
 * Wrong admin passwords tried from one address. Kept in the database (not in
 * the server's memory) so the count holds when the server runs as several
 * short-lived copies. A record deletes itself once its time is up.
 */
const loginAttemptSchema = new mongoose.Schema({
  /** the visitor's address */
  _id: { type: String },
  count: { type: Number, required: true },
  /** when the count starts again; MongoDB removes the record at this time */
  resetAt: { type: Date, required: true, expires: 0 },
});

export const LoginAttempt = mongoose.model("LoginAttempt", loginAttemptSchema);
