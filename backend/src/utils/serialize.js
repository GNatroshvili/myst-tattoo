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

export const tattoo = (doc) => ({
  id: String(doc._id),
  image: image(doc.image),
  style: style(doc.style),
  artist: artistBrief(doc.artist),
  createdAt: doc.createdAt,
});
