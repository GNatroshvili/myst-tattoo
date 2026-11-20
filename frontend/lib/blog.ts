import type { Locale } from "./i18n/config";
import { localized, type BlogPost } from "./types";

/**
 * Helpers for showing blog articles (the articles themselves come from the
 * backend; see `getBlogPosts` in api.ts).
 */

/** The studio's clock: an article's date and time are shown as they were in Tbilisi. */
const TIME_ZONE = "Asia/Tbilisi";

/** Only the numbers are asked of the platform: they come out the same everywhere. */
const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/**
 * Month names are kept here rather than asked of the platform: not every
 * browser knows the Georgian ones, and the admin panel formats dates in the
 * browser.
 */
const months: Record<Locale, string[]> = {
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  ka: [
    "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
    "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი",
  ],
};

/**
 * When an article was added, to the minute, on the studio's clock:
 * "20 November 2026, 14:05" or "20 ნოემბერი 2026, 14:05".
 */
export function postDate(iso: string, lang: Locale) {
  const parts = Object.fromEntries(
    clock.formatToParts(new Date(iso)).map((part) => [part.type, part.value])
  );
  // the day without a leading zero: "6 November", not "06 November"
  return `${Number(parts.day)} ${months[lang][Number(parts.month) - 1]} ${parts.year}, ${parts.hour}:${parts.minute}`;
}

/** The article's text in the page's language, or in the other one when that is all there is. */
export const postBody = (post: BlogPost, lang: Locale) => localized(post.body, lang);

/** The text as paragraphs: an empty line starts a new one. */
export function paragraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** The opening of the text for a card: whole words up to about `max` characters. */
export function excerpt(text: string, max: number) {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:!?–—-]+$/, "")}…`;
}

/** Minutes it takes to read the text, at an unhurried 200 words a minute. */
export function readMinutes(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
