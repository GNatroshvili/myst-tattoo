import type { Artist, Piercing, PiercingZone, Style, Tattoo } from "./types";

/**
 * Reads from the backend API. Server Components only: the browser reaches the
 * same API through the /api rewrite in next.config.ts instead.
 *
 * Nothing here is cached, so what the admin panel changes shows on the next
 * page load. If the backend cannot be reached the lists come back empty and
 * the pages show their "nothing here yet" states rather than an error.
 */

/** The backend's address, without a slash at the end (see next.config.ts). */
export const API_URL = (process.env.API_URL ?? "http://localhost:5000").trim().replace(/\/+$/, "");

/** `null` means the record does not exist (or the backend is down). */
async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api${path}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  } catch (err) {
    // Not a failure: while the site is being built, Next ends a request-time
    // read this way so the page keeps its loading state. It must travel on.
    if ((err as { digest?: string } | null)?.digest === "HANGING_PROMISE_REJECTION") throw err;

    const reason = err instanceof Error ? err.message : String(err);
    // "fetch failed" is all Node says when nothing answers at API_URL
    const hint =
      reason === "fetch failed"
        ? ` (cannot reach the backend at ${API_URL}; start it with "npm run dev" in backend/)`
        : "";
    console.error(`[api] GET ${path} failed: ${reason}${hint}`);
    return null;
  }
}

/** Every artist, in the order they were added, each with `tattooCount` and `piercingCount`. */
export const getArtists = async () => (await get<Artist[]>("/artists")) ?? [];

/** One artist by the slug in their profile's address, with their `tattoos` and `piercings`. */
export const getArtist = (slug: string) => get<Artist>(`/artists/${encodeURIComponent(slug)}`);

/** Tattoos, newest first; `limit` keeps only the first few. */
export const getTattoos = async (limit?: number) =>
  (await get<Tattoo[]>(limit ? `/tattoos?limit=${limit}` : "/tattoos")) ?? [];

export const getStyles = async () => (await get<Style[]>("/styles")) ?? [];

/** The piercing zones, each with its places and prices, in the order they were added. */
export const getPiercingZones = async () => (await get<PiercingZone[]>("/piercing/zones")) ?? [];

/** Piercing photos, newest first. */
export const getPiercings = async () => (await get<Piercing[]>("/piercings")) ?? [];
