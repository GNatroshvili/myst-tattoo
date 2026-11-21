import { cacheLife } from "next/cache";
import type { Locale } from "./i18n/config";

/**
 * The studio as Google Maps knows it: where it is, its rating and the reviews
 * Google picks to show. Read with Place Details of the Places API (New).
 * Server Components only: the key must not reach the browser.
 *
 * Settings (see .env.example): GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID.
 * While either is missing, or Google does not answer, there is no place and
 * the home page leaves the section out.
 */

/** One review, as Google returns it. */
export type PlaceReview = {
  id: string;
  author: {
    name: string;
    /** the author's profile on Google Maps */
    url?: string;
    photo?: string;
  };
  /** 1 to 5 */
  rating: number;
  text: string;
  /** Google translated the text into the page's language */
  translated: boolean;
  /** "2 months ago", already in the page's language */
  when: string;
  /** this review on Google Maps */
  url?: string;
};

export type Place = {
  id: string;
  name: string;
  address?: string;
  location?: { lat: number; lng: number };
  /** average of every rating, 1.0 to 5.0 */
  rating?: number;
  ratingCount?: number;
  /** at most five: Google returns no more, sorted by what it finds most relevant */
  reviews: PlaceReview[];
  links: {
    place: string;
    directions: string;
    reviews: string;
    writeReview?: string;
  };
};

/** What Place Details answers with; only the fields asked for below. */
type ApiText = { text?: string; languageCode?: string };
type ApiReview = {
  name?: string;
  relativePublishTimeDescription?: string;
  rating?: number;
  text?: ApiText;
  originalText?: ApiText;
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
  googleMapsUri?: string;
};
type ApiPlace = {
  id?: string;
  displayName?: ApiText;
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  googleMapsLinks?: { directionsUri?: string; placeUri?: string; reviewsUri?: string; writeAReviewUri?: string };
  reviews?: ApiReview[];
};

/** Asking for `reviews` and `rating` is what Google bills as "Place Details Enterprise + Atmosphere". */
const FIELDS = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "rating",
  "userRatingCount",
  "googleMapsUri",
  "googleMapsLinks",
  "reviews",
].join(",");

/**
 * How long one answer is shown before Google is asked again. Each language
 * asks separately, so six hours is at most 240 requests a month, well inside
 * the 1,000 a month Google does not charge for.
 */
const FRESH_FOR = 6 * 60 * 60;

/** Google's address; another one can be set for tests. */
const API = (process.env.GOOGLE_PLACES_API_URL || "https://places.googleapis.com/v1").replace(/\/+$/, "");

function toPlace(api: ApiPlace, placeId: string): Place {
  const name = api.displayName?.text?.trim() || "";
  // Google Maps opens the place itself when it is given the name and the ID together
  const query = new URLSearchParams({ api: "1", query: name, query_place_id: placeId });
  const route = new URLSearchParams({ api: "1", destination: name, destination_place_id: placeId });
  const place = api.googleMapsLinks?.placeUri || api.googleMapsUri || `https://www.google.com/maps/search/?${query}`;
  const { latitude, longitude } = api.location ?? {};

  return {
    id: placeId,
    name,
    address: api.formattedAddress,
    location: typeof latitude === "number" && typeof longitude === "number" ? { lat: latitude, lng: longitude } : undefined,
    rating: api.rating,
    ratingCount: api.userRatingCount,
    reviews: (api.reviews ?? [])
      // a rating left without a word says nothing here
      .filter((r) => r.text?.text?.trim() && r.authorAttribution?.displayName)
      .map((r, i) => ({
        id: r.name || String(i),
        author: {
          name: r.authorAttribution!.displayName!,
          url: r.authorAttribution!.uri,
          photo: r.authorAttribution!.photoUri,
        },
        rating: Math.round(r.rating ?? 0),
        text: r.text!.text!.trim(),
        translated:
          !!r.originalText?.languageCode && !!r.text?.languageCode && r.originalText.languageCode !== r.text.languageCode,
        when: r.relativePublishTimeDescription ?? "",
        url: r.googleMapsUri,
      })),
    links: {
      place,
      directions: api.googleMapsLinks?.directionsUri || `https://www.google.com/maps/dir/?${route}`,
      reviews: api.googleMapsLinks?.reviewsUri || place,
      writeReview: api.googleMapsLinks?.writeAReviewUri,
    },
  };
}

/**
 * Kept between requests: the answer is part of the page as it is built, and
 * the page is rebuilt in the background once the answer is six hours old.
 * A failure is kept for a minute only, so a fixed key shows up straight away.
 */
async function fetchPlace(placeId: string, lang: Locale): Promise<Place | null> {
  "use cache";

  const fail = (reason: string) => {
    console.error(`[google] Place Details failed: ${reason}`);
    cacheLife("minutes");
    return null;
  };

  let res: Response;
  try {
    res = await fetch(`${API}/places/${encodeURIComponent(placeId)}?languageCode=${lang}&regionCode=GE`, {
      headers: {
        "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!.trim(),
        "X-Goog-FieldMask": FIELDS,
      },
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err));
  }

  if (!res.ok) {
    // Google says what is wrong in words: a key that is not valid, an API
    // that is not enabled, billing that is not set up, a place ID it does not know
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    return fail(`${res.status} ${body?.error?.message ?? res.statusText}`);
  }

  const place = toPlace((await res.json()) as ApiPlace, placeId);
  if (!place.name) return fail("the answer has no place name");

  cacheLife({ stale: 300, revalidate: FRESH_FOR, expire: 24 * 60 * 60 });
  return place;
}

/** The studio on Google Maps, in the page's language; `null` while it is not set up or cannot be read. */
export async function getPlace(lang: Locale): Promise<Place | null> {
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();
  if (!placeId || !process.env.GOOGLE_PLACES_API_KEY?.trim()) return null;
  return fetchPlace(placeId, lang);
}
