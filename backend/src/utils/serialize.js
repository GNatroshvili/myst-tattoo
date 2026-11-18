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
  slug: doc.slug,
  nickname: doc.nickname,
  styles: (doc.styles ?? []).map(style).filter(Boolean),
  bio: { en: doc.bio?.en ?? "", ka: doc.bio?.ka ?? "" },
  instagramUrl: doc.instagramUrl ?? "",
  photo: image(doc.photo),
  ...extra,
});

/** The few artist details shown beside a tattoo. */
const artistBrief = (doc) =>
  doc && doc.nickname
    ? { id: String(doc._id), slug: doc.slug, nickname: doc.nickname, photo: image(doc.photo) }
    : null;

export const tattoo = (doc) => ({
  id: String(doc._id),
  image: image(doc.image),
  style: style(doc.style),
  artist: artistBrief(doc.artist),
  createdAt: doc.createdAt,
});
