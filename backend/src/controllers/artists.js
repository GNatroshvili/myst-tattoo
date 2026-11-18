import { Artist } from "../models/Artist.js";
import { Piercing } from "../models/Piercing.js";
import { Style } from "../models/Style.js";
import { Tattoo } from "../models/Tattoo.js";
import { badRequest, isId, list, notFound, text } from "../utils/http.js";
import { removeImage, saveImage } from "../utils/images.js";
import * as serialize from "../utils/serialize.js";
import { uniqueSlug } from "../utils/slug.js";
import { populatedPiercings } from "./piercings.js";

/**
 * Accepts "@name", "name" or a full instagram.com address and returns the
 * profile's address, or "" when nothing was entered.
 */
function instagramUrl(value) {
  const raw = text(value, { field: "Instagram link", max: 200 });
  if (!raw) return "";

  let handle = raw.replace(/^@/, "");
  if (/^https?:\/\//i.test(raw) || /instagram\.com/i.test(raw)) {
    let url;
    try {
      url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    } catch {
      throw badRequest("The Instagram link is not a valid address", "bad_instagram");
    }
    if (!/(^|\.)instagram\.com$/i.test(url.hostname)) {
      throw badRequest("The Instagram link must point to instagram.com", "bad_instagram");
    }
    handle = url.pathname.split("/").filter(Boolean)[0] ?? "";
  }
  if (!/^[A-Za-z0-9._]{1,30}$/.test(handle)) {
    throw badRequest("The Instagram link is not a valid profile", "bad_instagram");
  }
  return `https://instagram.com/${handle}`;
}

/** The nickname in one language; it cannot be empty. */
function readNickname(value, language) {
  const nickname = text(value, { field: `${language} nickname`, max: 60 });
  if (!nickname) throw badRequest("A nickname is needed in both languages", "both_languages");
  return nickname;
}

/** The style ids from the form, checked against the styles that exist. */
async function readStyles(value) {
  const ids = list(value, "Styles");
  if (ids === undefined) return undefined;
  if (!ids.every(isId) || (await Style.countDocuments({ _id: { $in: ids } })) !== ids.length) {
    throw badRequest("One of the chosen styles does not exist");
  }
  return ids;
}

/**
 * The ids of an artist's works from the form (`Model` is Tattoo or Piercing),
 * checked against the ones that exist. `what` names them in messages.
 */
async function readWorks(Model, value, what) {
  const ids = list(value, what);
  if (ids === undefined) return undefined;
  if (!ids.every(isId) || (await Model.countDocuments({ _id: { $in: ids } })) !== ids.length) {
    throw badRequest(`One of the chosen ${what} does not exist`);
  }
  return ids;
}

/** Makes `ids` exactly the set of tattoos (or piercings) attached to this artist. */
async function attachWorks(Model, artistId, ids) {
  await Model.updateMany({ artist: artistId, _id: { $nin: ids } }, { artist: null });
  await Model.updateMany({ _id: { $in: ids } }, { artist: artistId });
}

/** How many tattoos (or piercings) each artist has: artist id → count. */
async function countByArtist(Model) {
  const counts = await Model.aggregate([
    { $match: { artist: { $ne: null } } },
    { $group: { _id: "$artist", n: { $sum: 1 } } },
  ]);
  return new Map(counts.map((c) => [String(c._id), c.n]));
}

/** By id (the admin panel) or by slug (the public profile page). */
async function findArtist(key) {
  const artist = await Artist.findOne(isId(key) ? { _id: key } : { slug: key });
  if (!artist) throw notFound("Artist not found");
  return artist;
}

const artistTattoos = (artistId) =>
  Tattoo.find({ artist: artistId }).sort({ createdAt: -1 }).populate("style").populate("artist");

const artistPiercings = (artistId) =>
  populatedPiercings(Piercing.find({ artist: artistId }).sort({ createdAt: -1 }));

/**
 * Every artist, each with how many tattoos and piercings they have. Tattoo
 * artists and piercers are one list.
 */
export async function listArtists(_req, res) {
  const [artists, tattoos, piercings] = await Promise.all([
    Artist.find().sort({ createdAt: 1 }).populate("styles"),
    countByArtist(Tattoo),
    countByArtist(Piercing),
  ]);
  res.json(
    artists.map((a) =>
      serialize.artist(a, {
        tattooCount: tattoos.get(String(a._id)) ?? 0,
        piercingCount: piercings.get(String(a._id)) ?? 0,
      })
    )
  );
}

/** One artist with everything they have tattooed and pierced, newest first. */
export async function getArtist(req, res) {
  const artist = await findArtist(req.params.key);
  await artist.populate("styles");
  const [tattoos, piercings] = await Promise.all([
    artistTattoos(artist._id),
    artistPiercings(artist._id),
  ]);
  res.json(
    serialize.artist(artist, {
      tattoos: tattoos.map(serialize.tattoo),
      piercings: piercings.map(serialize.piercing),
    })
  );
}

/** One artist for both sites: the nickname and the bio come in both languages. */
export async function createArtist(req, res) {
  const nickname = {
    ka: readNickname(req.body.nicknameKa, "Georgian"),
    en: readNickname(req.body.nicknameEn, "English"),
  };
  const fields = {
    nickname,
    styles: (await readStyles(req.body.styles)) ?? [],
    bio: {
      ka: text(req.body.bioKa, { field: "Georgian bio", max: 1200 }),
      en: text(req.body.bioEn, { field: "English bio", max: 1200 }),
    },
    instagramUrl: instagramUrl(req.body.instagramUrl),
  };
  const tattoos = await readWorks(Tattoo, req.body.tattoos, "tattoos");
  const piercings = await readWorks(Piercing, req.body.piercings, "piercings");

  // everything is valid: only now touch the disk and the database
  const photo = req.file ? await saveImage(req.file.buffer) : null;
  let artist;
  try {
    // the address comes from the English nickname (Georgian letters are written in Latin ones)
    const slug = await uniqueSlug(nickname.en, (s) => Artist.exists({ slug: s }));
    artist = await Artist.create({ ...fields, slug, photo });
  } catch (err) {
    await removeImage(photo);
    throw err;
  }
  if (tattoos) await attachWorks(Tattoo, artist._id, tattoos);
  if (piercings) await attachWorks(Piercing, artist._id, piercings);

  await artist.populate("styles");
  res.status(201).json(serialize.artist(artist));
}

/** Changes only the fields that were sent. */
export async function updateArtist(req, res) {
  const artist = await findArtist(req.params.key);
  const body = req.body;

  if (body.nicknameKa !== undefined) artist.nickname.ka = readNickname(body.nicknameKa, "Georgian");
  if (body.nicknameEn !== undefined) {
    const nickname = readNickname(body.nicknameEn, "English");
    if (nickname !== artist.nickname.en) {
      artist.nickname.en = nickname;
      artist.slug = await uniqueSlug(nickname, (s) =>
        Artist.exists({ slug: s, _id: { $ne: artist._id } })
      );
    }
  }
  const styles = await readStyles(body.styles);
  if (styles) artist.styles = styles;
  if (body.bioKa !== undefined) artist.bio.ka = text(body.bioKa, { field: "Georgian bio", max: 1200 });
  if (body.bioEn !== undefined) artist.bio.en = text(body.bioEn, { field: "English bio", max: 1200 });
  if (body.instagramUrl !== undefined) artist.instagramUrl = instagramUrl(body.instagramUrl);
  const tattoos = await readWorks(Tattoo, body.tattoos, "tattoos");
  const piercings = await readWorks(Piercing, body.piercings, "piercings");

  // everything is valid: only now touch the disk and the database
  const oldPhoto = artist.photo;
  const newPhoto = req.file ? await saveImage(req.file.buffer) : null;
  if (newPhoto) artist.photo = newPhoto;
  else if (body.removePhoto === "true") artist.photo = null;

  try {
    await artist.save();
  } catch (err) {
    await removeImage(newPhoto);
    throw err;
  }
  if (newPhoto || body.removePhoto === "true") await removeImage(oldPhoto);
  if (tattoos) await attachWorks(Tattoo, artist._id, tattoos);
  if (piercings) await attachWorks(Piercing, artist._id, piercings);

  await artist.populate("styles");
  res.json(serialize.artist(artist));
}

/** The artist's tattoos and piercings stay in the galleries, attached to nobody. */
export async function deleteArtist(req, res) {
  const artist = await findArtist(req.params.key);
  await Tattoo.updateMany({ artist: artist._id }, { artist: null });
  await Piercing.updateMany({ artist: artist._id }, { artist: null });
  await artist.deleteOne();
  await removeImage(artist.photo);
  res.status(204).end();
}
