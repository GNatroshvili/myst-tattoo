import {
  clearFailedLogins,
  endSession,
  isAdmin,
  loginConfigured,
  passwordMatches,
  recordFailedLogin,
  startSession,
} from "../middleware/auth.js";
import { HttpError } from "../utils/http.js";

export async function login(req, res) {
  if (!loginConfigured()) {
    throw new HttpError(
      503,
      "Admin sign-in is not set up: add ADMIN_PASSWORD and SESSION_SECRET to .env",
      "login_not_configured"
    );
  }
  if (!passwordMatches(req.body?.password)) {
    await recordFailedLogin(req);
    throw new HttpError(401, "Wrong password", "wrong_password");
  }
  await clearFailedLogins(req);
  startSession(res);
  res.json({ admin: true });
}

export function logout(_req, res) {
  endSession(res);
  res.json({ admin: false });
}

/** Tells the admin panel whether this browser is signed in. */
export function me(req, res) {
  res.json({ admin: isAdmin(req) });
}
