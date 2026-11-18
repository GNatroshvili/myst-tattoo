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
  nickname: string;
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

export type Artist = ArtistBrief & {
  styles: Style[];
  bio: Localized;
  /** "" when the artist has no Instagram */
  instagramUrl: string;
  /** comes with the list of artists */
  tattooCount?: number;
  /** comes with a single artist: their work, newest first */
  tattoos?: Tattoo[];
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
