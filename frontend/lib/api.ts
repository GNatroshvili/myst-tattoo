import { apiOrigin } from "./api-url";
import type {
  AboutSection,
  Artist,
  BlogPost,
  BlogTopic,
  Course,
  Faq,
  Piercing,
  PiercingZone,
  PrivacyPolicy,
  Stat,
  Style,
  Tattoo,
} from "./types";

/**
 * Reads from the backend API. Server Components only: the browser reaches the
 * same API through the /api rewrite in next.config.ts instead.
 *
 * Nothing here is cached, so what the admin panel changes shows on the next
 * page load. If the backend cannot be reached the lists come back empty and
 * the pages show their "nothing here yet" states rather than an error.
 */

/** The backend's address: scheme and host, nothing after (see api-url.ts). */
export const API_URL = apiOrigin();

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

/** Every tattoo, newest first. */
export const getTattoos = async () => (await get<Tattoo[]>("/tattoos")) ?? [];

/** The tattoos picked in the admin panel for the home page, newest first. */
export const getFeaturedTattoos = async () => (await get<Tattoo[]>("/tattoos?featured=1")) ?? [];

export const getStyles = async () => (await get<Style[]>("/styles")) ?? [];

/** The piercing zones, each with its places and prices, in the order they were added. */
export const getPiercingZones = async () => (await get<PiercingZone[]>("/piercing/zones")) ?? [];

/** Every blog article, newest first. */
export const getBlogPosts = async () => (await get<BlogPost[]>("/blog/posts")) ?? [];

/** The blog's topics, in the order they were added, each with `postCount`. */
export const getBlogTopics = async () => (await get<BlogTopic[]>("/blog/topics")) ?? [];

/** One article by the slug in its address. */
export const getBlogPost = (slug: string) => get<BlogPost>(`/blog/posts/${encodeURIComponent(slug)}`);

/** The tattoo course; `null` while none has been posted. */
export const getCourse = () => get<Course>("/course");

/** The figures the home page shows about the studio, in the order the admin panel puts them in. */
export const getStats = async () => (await get<Stat[]>("/stats")) ?? [];

/** The home page's frequently asked questions, in the order the admin panel puts them in. */
export const getFaqs = async () => (await get<Faq[]>("/faqs")) ?? [];

/** The /about page's sections, in the order the admin panel puts them in. */
export const getAboutSections = async () => (await get<AboutSection[]>("/about/sections")) ?? [];

/** The privacy policy's text as saved in the admin panel; `null` while the site shows its standard one. */
export const getPrivacy = () => get<PrivacyPolicy>("/privacy");

/** Piercing photos, newest first. */
export const getPiercings = async () => (await get<Piercing[]>("/piercings")) ?? [];
