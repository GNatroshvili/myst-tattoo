import { connection } from "next/server";
import { API_URL } from "@/lib/api";

/**
 * /admin/status: what this deployment of the site is and whether it can reach
 * its backend. The site's counterpart to the backend's /api/health, for
 * checking a deployment's settings without guessing:
 *
 * - `commit`: the version that is running (set by Vercel; null elsewhere)
 * - `apiUrl`: where /api and /uploads are forwarded, as the site understood API_URL
 * - `backend`: what the backend's own health check answered, asked directly
 * - `forwarding`: the same question asked through this site's /api address,
 *    the way the admin panel asks. "redirect" here means the forwarding is
 *    misconfigured even though the backend itself is fine.
 */
export async function GET(request: Request) {
  await connection();

  const health = async (url: string) => {
    try {
      const res = await fetch(url, { cache: "no-store", redirect: "manual" });
      if (res.status >= 300 && res.status < 400) {
        return { ok: false, problem: `redirect (${res.status}) to ${res.headers.get("location")}` };
      }
      const body = (await res.json()) as { db?: string; photos?: string; dbProblem?: string };
      return { ok: res.ok, db: body.db, photos: body.photos, dbProblem: body.dbProblem };
    } catch (err) {
      return { ok: false, problem: err instanceof Error ? err.message : "request failed" };
    }
  };

  const [backend, forwarding] = await Promise.all([
    health(`${API_URL}/api/health`),
    health(new URL("/api/health", request.url).href),
  ]);

  return Response.json({
    site: "myst-tattoo-frontend",
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    apiUrl: API_URL,
    backend,
    forwarding,
  });
}
