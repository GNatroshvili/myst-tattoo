import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";
import { LoginAttempt } from "../models/LoginAttempt.js";
import { HttpError } from "../utils/http.js";

/**
 * Admin sign-in. There is one admin and one password (ADMIN_PASSWORD). A
 * correct password earns a signed cookie that lasts a week; every request
 * that changes data must carry it.
 */

export const SESSION_COOKIE = "myst_admin";
const WEEK = 7 * 24 * 60 * 60 * 1000;

const sign = (value) => createHmac("sha256", env.sessionSecret).update(value).digest("base64url");

/** Compares two strings without leaking, through timing, how much of them matched. */
function same(a, b) {
  const hash = (value) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(a), hash(b));
}

/** Sign-in only works once both values are set in the environment. */
export const loginConfigured = () => Boolean(env.adminPassword && env.sessionSecret);

export const passwordMatches = (password) =>
  loginConfigured() && typeof password === "string" && same(password, env.adminPassword);

/** "v1.<expiry>.<signature>" */
function createToken() {
  const body = `v1.${Date.now() + WEEK}`;
  return `${body}.${sign(body)}`;
}

function tokenValid(token) {
  if (!loginConfigured() || typeof token !== "string") return false;
  const cut = token.lastIndexOf(".");
  if (cut === -1) return false;
  const body = token.slice(0, cut);
  const [version, expiry] = body.split(".");
  return version === "v1" && same(token.slice(cut + 1), sign(body)) && Number(expiry) > Date.now();
}

function readCookie(req, name) {
  for (const part of (req.headers.cookie ?? "").split(";")) {
    const at = part.indexOf("=");
    if (at !== -1 && part.slice(0, at).trim() === name) {
      return decodeURIComponent(part.slice(at + 1).trim());
    }
  }
  return null;
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.isProduction,
  path: "/",
};

export function startSession(res) {
  res.cookie(SESSION_COOKIE, createToken(), { ...cookieOptions, maxAge: WEEK });
}

export function endSession(res) {
  res.clearCookie(SESSION_COOKIE, cookieOptions);
}

export const isAdmin = (req) => tokenValid(readCookie(req, SESSION_COOKIE));

/** Lets the request through only when it carries a valid admin session. */
export function requireAdmin(req, _res, next) {
  if (!isAdmin(req)) throw new HttpError(401, "Sign in to do this", "signed_out");
  next();
}

/* ---------- sign-in attempts ---------- */

const MAX_ATTEMPTS = 8;
const WINDOW = 15 * 60 * 1000;

const address = (req) => req.ip ?? "unknown";

/** The address's count of wrong tries, if its 15 minutes are still running. */
const running = (req) => LoginAttempt.findOne({ _id: address(req), resetAt: { $gt: new Date() } });

/** Stops password guessing: eight wrong tries from one address, then a 15-minute wait. */
export async function limitLogins(req, _res, next) {
  const entry = await running(req);
  if (entry && entry.count >= MAX_ATTEMPTS) {
    throw new HttpError(429, "Too many attempts. Try again in a few minutes.", "too_many_attempts");
  }
  next();
}

export async function recordFailedLogin(req) {
  const entry = await running(req);
  if (entry) {
    await LoginAttempt.updateOne({ _id: entry._id }, { $inc: { count: 1 } });
  } else {
    await LoginAttempt.replaceOne(
      { _id: address(req) },
      { count: 1, resetAt: new Date(Date.now() + WINDOW) },
      { upsert: true }
    );
  }
}

export async function clearFailedLogins(req) {
  await LoginAttempt.deleteOne({ _id: address(req) });
}
