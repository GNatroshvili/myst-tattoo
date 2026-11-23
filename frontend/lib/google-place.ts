import { cacheLife } from "next/cache";
import { localeTags, locales, type Locale } from "./i18n/config";

/**
 * The studio as Google Maps knows it: where it is, its rating and the reviews
 * Google picks to show. Read with Place Details of the Places API (New).
 * Server Components only: the key must not reach the browser.
 *
 * One answer holds five reviews and no more, and Google has no way to ask for
 * the next five. What it does do is pick them by language: asked in Georgian
 * it sends its five most relevant reviews written in Georgian, asked in
 * English five others. So the place is asked for in each of REVIEW_LANGUAGES
 * and the answers are put together.
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
  /** the language the text is in, when Google names it: "ka", "en", "ru" */
  lang?: string;
  /** Google translated the text out of the language it was written in */
  translated: boolean;
  /** "2 months ago", in the page's language */
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
  /**
   * The page's language first, then the other languages in turn; each
   * language's reviews in the order Google finds most relevant.
   */
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
  /** "2026-11-15T09:12:44.120Z" */
  publishTime?: string;
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
 * The languages the reviews are asked for in: five reviews each, so fifteen
 * at most. These are the three the studio's guests write and read. Another
 * language here is another five reviews (as long as Google has that many
 * written in it) and another request every FRESH_FOR.
 */
const REVIEW_LANGUAGES = ["ka", "en", "ru"];

/**
 * How long one answer is shown before Google is asked again. Each language
 * is asked once for both of the site's languages, so three languages every
 * six hours is at most 360 requests a month, well inside the 1,000 a month
 * Google does not charge for.
 */
const FRESH_FOR = 6 * 60 * 60;

/** How soon Google is asked again while it sends a rating without any reviews. */
const WAITING_FOR = 60 * 60;

/** Google's address; another one can be set for tests. */
const API = (process.env.GOOGLE_PLACES_API_URL || "https://places.googleapis.com/v1").replace(/\/+$/, "");

/** A review as one answer holds it: when it was written is worded for each of the site's languages. */
type AnsweredReview = Omit<PlaceReview, "when"> & { when: Record<Locale, string> };
type AnsweredPlace = Omit<Place, "reviews"> & { reviews: AnsweredReview[] };

/**
 * "3 days ago", "last week", "2 months ago" in `locale`. Google words this
 * only in the language it was asked in, and a review asked for in Russian is
 * shown on the Georgian and the English page.
 */
function ago(then: number, now: number, locale: string) {
  const days = Math.max(0, Math.floor((now - then) / 86_400_000));
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (days < 7) return format.format(-days, "day");
  if (days < 30) return format.format(-Math.floor(days / 7), "week");
  if (days < 365) return format.format(-Math.floor(days / 30), "month");
  return format.format(-Math.floor(days / 365), "year");
}

/** When a review was written, for each of the site's languages. */
function written(review: ApiReview, asked: string, now: number) {
  const then = review.publishTime ? Date.parse(review.publishTime) : NaN;
  const when = {} as Record<Locale, string>;
  for (const locale of locales) {
    if (!Number.isNaN(then)) when[locale] = ago(then, now, localeTags[locale].intl);
    // Google's own words, where they are in this language
    else when[locale] = asked === locale ? (review.relativePublishTimeDescription ?? "") : "";
  }
  return when;
}

function toPlace(api: ApiPlace, placeId: string, asked: string, now: number): AnsweredPlace {
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
        id: r.name || `${asked}-${i}`,
        author: {
          name: r.authorAttribution!.displayName!,
          url: r.authorAttribution!.uri,
          photo: r.authorAttribution!.photoUri,
        },
        rating: Math.round(r.rating ?? 0),
        text: r.text!.text!.trim(),
        lang: r.text!.languageCode,
        translated:
          !!r.originalText?.languageCode && !!r.text?.languageCode && r.originalText.languageCode !== r.text.languageCode,
        when: written(r, asked, now),
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
 * The place as Google answers in one language. Kept between requests: the
 * answer is part of the page as it is built, and the page is rebuilt in the
 * background once the answer is six hours old. A failure is kept for a minute
 * only, so a fixed key shows up straight away.
 */
async function fetchPlace(placeId: string, lang: string): Promise<AnsweredPlace | null> {
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

  const place = toPlace((await res.json()) as ApiPlace, placeId, lang, Date.now());
  if (!place.name) return fail("the answer has no place name");

  // Ratings but not one review: Google is holding the reviews back, as it does
  // from a key made before its project had billing (a "Maps Demo Key"). The
  // rest of the answer is good, so it is shown, and Google is asked again
  // within the hour so the reviews appear soon after it starts sending them.
  if (place.reviews.length === 0 && (place.ratingCount ?? 0) > 0) {
    console.warn(
      `[google] Place Details gave a rating (${place.ratingCount} ratings) but no reviews. ` +
        "Google leaves reviews out for a key made without billing; see .env.example.",
    );
    cacheLife({ stale: 300, revalidate: WAITING_FOR, expire: 24 * 60 * 60 });
    return place;
  }

  cacheLife({ stale: 300, revalidate: FRESH_FOR, expire: 24 * 60 * 60 });
  return place;
}

/**
 * The studio on Google Maps, in the page's language; `null` while it is not
 * set up or cannot be read. Its name, address and rating come from the answer
 * in the page's language; the reviews from every answer.
 */
export async function getPlace(lang: Locale): Promise<Place | null> {
  const placeId = process.env.GOOGLE_PLACE_ID?.trim();
  if (!placeId || !process.env.GOOGLE_PLACES_API_KEY?.trim()) return null;

  const others = REVIEW_LANGUAGES.filter((other) => other !== lang);
  const [place, ...more] = await Promise.all([lang, ...others].map((asked) => fetchPlace(placeId, asked)));
  if (!place) return null;

  // In a language with fewer than five reviews of its own Google fills the
  // answer with other reviews it has translated: those belong to the answer in
  // their own language, not here in a third one.
  const extra = more.map((answer) => answer?.reviews.filter((review) => !review.translated) ?? []);
  const reviews = [...place.reviews];
  // one from each language in turn, so no language waits behind all of another
  for (let i = 0; extra.some((list) => i < list.length); i++) {
    for (const list of extra) if (list[i]) reviews.push(list[i]);
  }

  const seen = new Set<string>();
  return {
    ...place,
    reviews: reviews
      .filter((review) => !seen.has(review.id) && seen.add(review.id))
      .map((review) => ({ ...review, when: review.when[lang] })),
  };
}
