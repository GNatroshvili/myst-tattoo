import type { Locale } from "./i18n/config";
import type { Artist, Style, Tattoo } from "./types";

/**
 * Reads from the backend API. Server Components only: the browser reaches the
 * same API through the /api rewrite in next.config.ts instead.
 *
 * Artists and tattoos belong to one language each, so every read says which
 * site it is for and gets only that language's records.
 *
 * Nothing here is cached, so what the admin panel changes shows on the next
 * page load. If the backend cannot be reached the lists come back empty and
 * the pages show their "nothing here yet" states rather than an error.
 */

export const API_URL = process.env.API_URL ?? "http://localhost:5000";

/** `null` means the record does not exist (or the backend is down). */
async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api${path}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  } catch (err) {
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

/** One language's artists, in the order they were added, each with `tattooCount`. */
export const getArtists = async (lang: Locale) =>
  (await get<Artist[]>(`/artists?lang=${lang}`)) ?? [];

/** One artist of that language by the slug in their profile's address, with their `tattoos`. */
export const getArtist = (slug: string, lang: Locale) =>
  get<Artist>(`/artists/${encodeURIComponent(slug)}?lang=${lang}`);

/** One language's tattoos, newest first; `limit` keeps only the first few. */
export const getTattoos = async (lang: Locale, limit?: number) =>
  (await get<Tattoo[]>(`/tattoos?lang=${lang}${limit ? `&limit=${limit}` : ""}`)) ?? [];

export const getStyles = async () => (await get<Style[]>("/styles")) ?? [];
