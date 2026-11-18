import mongoose from "mongoose";

/**
 * An error that carries the HTTP status the client should get. `code` is a
 * short fixed name for the problem, which the admin panel turns into a message
 * in its own language; `details` are the numbers that message needs.
 */
export class HttpError extends Error {
  constructor(status, message, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message, code) => new HttpError(400, message, code);
export const notFound = (message = "Not found") => new HttpError(404, message);

export const isId = (value) => typeof value === "string" && mongoose.isValidObjectId(value);

/** Trims a text field and checks its length; missing or non-text becomes "". */
export function text(value, { field, max }) {
  // forms send line breaks as CR LF; keep plain LF
  const clean = typeof value === "string" ? value.replace(/\r\n?/g, "\n").trim() : "";
  if (clean.length > max) throw badRequest(`${field} is too long (max ${max} characters)`);
  return clean;
}

/**
 * A list sent in a form: a JSON array in one field ('["a","b"]'), or the field
 * repeated once per item (which arrives as an array, or as a plain string when
 * there is only one). An empty field is an empty list.
 * Returns `undefined` when the field was not sent at all.
 */
export function list(value, field) {
  if (value === undefined) return undefined;
  let items = value;
  if (typeof value === "string") {
    const raw = value.trim();
    if (raw === "") items = [];
    else if (!raw.startsWith("[")) items = [raw];
    else {
      try {
        items = JSON.parse(raw);
      } catch {
        throw badRequest(`${field} must be a list`);
      }
    }
  }
  if (!Array.isArray(items) || items.some((item) => typeof item !== "string")) {
    throw badRequest(`${field} must be a list`);
  }
  return [...new Set(items)];
}
