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
  /** picked in the admin panel for the home page's "Featured projects" */
  featured: boolean;
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

/** What a blog article is about ("Tattoo care", "Studio news"). */
export type BlogTopic = {
  id: string;
  name: Localized;
  /** how many articles are filed under it (comes with the list of topics) */
  postCount?: number;
};

/** A blog article. One record serves both sites. */
export type BlogPost = {
  id: string;
  /** last part of the article's address: /blog/<slug> */
  slug: string;
  title: Localized;
  /** null only if the topic was deleted from under it */
  topic: BlogTopic | null;
  /** the article's text; "" in a language that has none, and the page then shows the other one */
  body: Localized;
  image: Photo;
  /** when the article was added: the date and time the site shows */
  createdAt: string;
  updatedAt: string;
};

/** One of the course's photos; `id` is what the admin panel orders and removes them by. */
export type CoursePhoto = Photo & { id: string };

/** The studio's tattoo course, as the /course page shows it. One record serves both sites. */
export type Course = {
  title: Localized;
  /** what the course is; "" in a language that has none, and the page then shows the other one */
  body: Localized;
  /** in the order the page shows them: the first is the large one */
  photos: CoursePhoto[];
  /** when the course was posted: the date the site shows */
  createdAt: string;
  updatedAt: string;
};

/** One of the figures the home page shows about the studio. One record serves both sites. */
export type Stat = {
  id: string;
  /** the figure as the site shows it, the same on both sites: "700+", "5,000+" */
  value: string;
  /** the line under the figure: "Reviews on Google" */
  label: Localized;
};

/** One of the home page's frequently asked questions. One record serves both sites. */
export type Faq = {
  id: string;
  question: Localized;
  /** "" in a language that has none, and the page then shows the other one */
  answer: Localized;
};

/** One section of the /about page. One record serves both sites. */
export type AboutSection = {
  id: string;
  /** "" in both languages where the section has no title; with one only, the page shows that one */
  title: Localized;
  /** "" in a language that has none, and the page then shows the other one */
  body: Localized;
  image: Photo;
};

/** The privacy policy's text as saved in the admin panel. One record serves both sites. */
export type PrivacyPolicy = {
  /** "" in a language that has none, and the page then shows the other one */
  body: Localized;
  /** when the text was last saved: the "last updated" date the site shows */
  updatedAt: string;
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
