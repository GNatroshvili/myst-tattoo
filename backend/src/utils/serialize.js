import { fileUrl } from "./storage.js";

/**
 * What the API sends for each record. Photos go out as addresses a browser
 * can load: under /uploads for files on the server's disk (the site in front
 * of it forwards those), or straight from Vercel Blob.
 */

const image = (img) =>
  img
    ? {
        full: fileUrl(img.full),
        thumb: fileUrl(img.thumb),
        width: img.width,
        height: img.height,
      }
    : null;

/** A populated style, or null when the style has been deleted. */
export const style = (doc) =>
  doc && doc.name ? { id: String(doc._id), name: { en: doc.name.en, ka: doc.name.ka } } : null;

/** A text kept in both languages; a missing one goes out as "". */
const both = (value) => ({ en: value?.en ?? "", ka: value?.ka ?? "" });

export const artist = (doc, extra = {}) => ({
  id: String(doc._id),
  slug: doc.slug,
  nickname: both(doc.nickname),
  styles: (doc.styles ?? []).map(style).filter(Boolean),
  bio: both(doc.bio),
  instagramUrl: doc.instagramUrl ?? "",
  photo: image(doc.photo),
  ...extra,
});

/** The few artist details shown beside a tattoo. */
const artistBrief = (doc) =>
  doc && doc.nickname
    ? { id: String(doc._id), slug: doc.slug, nickname: both(doc.nickname), photo: image(doc.photo) }
    : null;

/** One line of a zone's price list. */
export const piercingPlace = (doc, extra = {}) => ({
  id: String(doc._id),
  name: both(doc.name),
  note: both(doc.note),
  price: doc.price,
  ...extra,
});

/** A piercing zone with its (already serialized) places. */
export const piercingZone = (doc, places = []) => ({
  id: String(doc._id),
  name: both(doc.name),
  places,
});

/** Where a piercing sits: its place and that place's zone, by name. */
const placeBrief = (doc) =>
  doc && doc.name
    ? {
        id: String(doc._id),
        name: both(doc.name),
        zone: doc.zone && doc.zone.name ? { id: String(doc.zone._id), name: both(doc.zone.name) } : null,
      }
    : null;

export const piercing = (doc) => ({
  id: String(doc._id),
  image: image(doc.image),
  place: placeBrief(doc.place),
  artist: artistBrief(doc.artist),
  createdAt: doc.createdAt,
});

/** A blog topic; `extra` carries how many articles it has, where that is known. */
export const blogTopic = (doc, extra = {}) => ({
  id: String(doc._id),
  name: both(doc.name),
  ...extra,
});

export const blogPost = (doc) => ({
  id: String(doc._id),
  slug: doc.slug,
  title: both(doc.title),
  /** null only if the topic was deleted from under it */
  topic: doc.topic && doc.topic.name ? blogTopic(doc.topic) : null,
  body: both(doc.body),
  image: image(doc.image),
  /** when the article was added: the date and time the site shows */
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

/** The tattoo course; each photo carries its id, which the admin panel orders and removes them by. */
export const course = (doc) => ({
  title: both(doc.title),
  body: both(doc.body),
  /** in the order the page shows them: the first is the large one */
  photos: doc.photos.map((photo) => ({ id: String(photo._id), ...image(photo) })),
  /** when the course was posted: the date the site shows */
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

/** One of the home page's frequently asked questions. */
export const faq = (doc) => ({
  id: String(doc._id),
  question: both(doc.question),
  answer: both(doc.answer),
});

/** One section of the /about page: a photo, a title ("" where it has none) and a text. */
export const aboutSection = (doc) => ({
  id: String(doc._id),
  title: both(doc.title),
  body: both(doc.body),
  image: image(doc.image),
});

/** The privacy policy's text as the admin panel saved it. */
export const privacy = (doc) => ({
  body: both(doc.body),
  /** when the text was last saved: the "last updated" date the site shows */
  updatedAt: doc.updatedAt,
});

export const tattoo = (doc) => ({
  id: String(doc._id),
  image: image(doc.image),
  style: style(doc.style),
  artist: artistBrief(doc.artist),
  /** shown in the home page's "Featured projects" */
  featured: Boolean(doc.featured),
  createdAt: doc.createdAt,
});
