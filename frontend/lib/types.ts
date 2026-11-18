import type { Locale } from "./i18n/config";

/**
 * The records the backend API sends (see backend/src/utils/serialize.js).
 * Shared by the public pages and the admin panel.
 */

/** Text kept in both of the site's languages. */
export type Localized = Record<Locale, string>;

/** A stored photo: addresses of the photo and of its small copy, and its size. */
export type Photo = {
  full: string;
  thumb: string;
  width: number;
  height: number;
};

export type Style = {
  id: string;
  name: Localized;
};

/** The few artist details that come with a tattoo. */
export type ArtistBrief = {
  id: string;
  /** last part of the profile's address: /artists/<slug> */
  slug: string;
  /** as each site shows it: "ნიკა" on /ka, "Nika" on /en */
  nickname: Localized;
  photo: Photo | null;
};

export type Tattoo = {
  id: string;
  image: Photo;
  /** null only if the style was deleted from under it */
  style: Style | null;
  /** null until the tattoo is attached to an artist */
  artist: ArtistBrief | null;
  createdAt: string;
};

/** One line of a piercing zone's price list: a place within the zone and its price. */
export type PiercingPlace = {
  id: string;
  name: Localized;
  /** small line under the name; "" in a language that has none */
  note: Localized;
  /** as the visitor reads it on both sites: "80 ₾" */
  price: string;
  /** how many piercing photos sit in this place (the admin panel uses it) */
  piercingCount?: number;
};

/** A part of the body where piercings are done ("Ear", "Face"), with its price list. */
export type PiercingZone = {
  id: string;
  name: Localized;
  places: PiercingPlace[];
};

/** A photo of a piercing done at the studio. */
export type Piercing = {
  id: string;
  image: Photo;
  /** where it sits; null only if its place was deleted from under it */
  place: { id: string; name: Localized; zone: { id: string; name: Localized } | null } | null;
  /** null until the piercing is attached to an artist */
  artist: ArtistBrief | null;
  createdAt: string;
};

/** An artist. One record serves both sites: the nickname and the bio are in both languages. */
export type Artist = ArtistBrief & {
  styles: Style[];
  /** "" in a language that has none; the page then shows the other one */
  bio: Localized;
  /** "" when the artist has no Instagram */
  instagramUrl: string;
  /** come with the list of artists: a tattoo artist has tattoos, a piercer has piercings */
  tattooCount?: number;
  piercingCount?: number;
  /** come with a single artist: their work, newest first */
  tattoos?: Tattoo[];
  piercings?: Piercing[];
};

/** Text in the page's language, or in the other one when that is all there is. */
export function localized(value: Localized, lang: Locale) {
  return value[lang] || value.en || value.ka;
}

/** "https://instagram.com/name" → "@name" */
export function instagramHandle(url: string) {
  return `@${url.replace(/\/+$/, "").split("/").pop() ?? ""}`;
}

/** A photo's shape as CSS `aspect-ratio`. */
export const photoRatio = (photo: Photo) => `${photo.width} / ${photo.height}`;
