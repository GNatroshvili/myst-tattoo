/**
 * What the API sends for each record. Photos go out as addresses under
 * /uploads, which the server (and the site in front of it) serves as files.
 */

const image = (img) =>
  img
    ? {
        full: `/uploads/${img.full}`,
        thumb: `/uploads/${img.thumb}`,
        width: img.width,
        height: img.height,
      }
    : null;

/** A populated style, or null when the style has been deleted. */
export const style = (doc) =>
  doc && doc.name ? { id: String(doc._id), name: { en: doc.name.en, ka: doc.name.ka } } : null;

export const artist = (doc, extra = {}) => ({
  id: String(doc._id),
  lang: doc.lang,
  slug: doc.slug,
  nickname: doc.nickname,
  styles: (doc.styles ?? []).map(style).filter(Boolean),
  bio: typeof doc.bio === "string" ? doc.bio : "",
  instagramUrl: doc.instagramUrl ?? "",
  photo: image(doc.photo),
  ...extra,
});

/** The few artist details shown beside a tattoo. */
const artistBrief = (doc) =>
  doc && doc.nickname
    ? { id: String(doc._id), slug: doc.slug, nickname: doc.nickname, photo: image(doc.photo) }
    : null;

/** One line of a zone's price list. */
export const piercingPlace = (doc, extra = {}) => ({
  id: String(doc._id),
  name: doc.name,
  note: doc.note ?? "",
  price: doc.price,
  ...extra,
});

/** A piercing zone with its (already serialized) places. */
export const piercingZone = (doc, places = []) => ({
  id: String(doc._id),
  lang: doc.lang,
  name: doc.name,
  places,
});

/** Where a piercing sits: its place and that place's zone, by name. */
const placeBrief = (doc) =>
  doc && doc.name
    ? {
        id: String(doc._id),
        name: doc.name,
        zone: doc.zone && doc.zone.name ? { id: String(doc.zone._id), name: doc.zone.name } : null,
      }
    : null;

export const piercing = (doc) => ({
  id: String(doc._id),
  lang: doc.lang,
  image: image(doc.image),
  place: placeBrief(doc.place),
  artist: artistBrief(doc.artist),
  createdAt: doc.createdAt,
});

export const tattoo = (doc) => ({
  id: String(doc._id),
  lang: doc.lang,
  image: image(doc.image),
  style: style(doc.style),
  artist: artistBrief(doc.artist),
  createdAt: doc.createdAt,
});
