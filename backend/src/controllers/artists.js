import { Artist } from "../models/Artist.js";
import { Style } from "../models/Style.js";
import { Tattoo } from "../models/Tattoo.js";
import { badRequest, isId, list, notFound, text } from "../utils/http.js";
import { removeImage, saveImage } from "../utils/images.js";
import * as serialize from "../utils/serialize.js";
import { uniqueSlug } from "../utils/slug.js";

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

/** The style ids from the form, checked against the styles that exist. */
async function readStyles(value) {
  const ids = list(value, "Styles");
  if (ids === undefined) return undefined;
  if (!ids.every(isId) || (await Style.countDocuments({ _id: { $in: ids } })) !== ids.length) {
    throw badRequest("One of the chosen styles does not exist");
  }
  return ids;
}

/** The tattoo ids from the form, checked against the tattoos that exist. */
async function readTattoos(value) {
  const ids = list(value, "Tattoos");
  if (ids === undefined) return undefined;
  if (!ids.every(isId) || (await Tattoo.countDocuments({ _id: { $in: ids } })) !== ids.length) {
    throw badRequest("One of the chosen tattoos does not exist");
  }
  return ids;
}

/** Makes `ids` exactly the set of tattoos attached to this artist. */
async function attachTattoos(artistId, ids) {
  await Tattoo.updateMany({ artist: artistId, _id: { $nin: ids } }, { artist: null });
  await Tattoo.updateMany({ _id: { $in: ids } }, { artist: artistId });
}

/** By id (the admin panel) or by slug (the public profile page). */
async function findArtist(key) {
  const artist = await Artist.findOne(isId(key) ? { _id: key } : { slug: key });
  if (!artist) throw notFound("Artist not found");
  return artist;
}

const artistTattoos = (artistId) =>
  Tattoo.find({ artist: artistId }).sort({ createdAt: -1 }).populate("style").populate("artist");

export async function listArtists(_req, res) {
  const [artists, counts] = await Promise.all([
    Artist.find().sort({ createdAt: 1 }).populate("styles"),
    Tattoo.aggregate([{ $match: { artist: { $ne: null } } }, { $group: { _id: "$artist", n: { $sum: 1 } } }]),
  ]);
  const tattooCount = new Map(counts.map((c) => [String(c._id), c.n]));
  res.json(artists.map((a) => serialize.artist(a, { tattooCount: tattooCount.get(String(a._id)) ?? 0 })));
}

/** One artist with everything they have tattooed, newest first. */
export async function getArtist(req, res) {
  const artist = await findArtist(req.params.key);
  await artist.populate("styles");
  const tattoos = await artistTattoos(artist._id);
  res.json(serialize.artist(artist, { tattoos: tattoos.map(serialize.tattoo) }));
}

export async function createArtist(req, res) {
  const nickname = text(req.body.nickname, { field: "Nickname", max: 60 });
  if (!nickname) throw badRequest("A nickname is required");

  const fields = {
    nickname,
    styles: (await readStyles(req.body.styles)) ?? [],
    bio: {
      en: text(req.body.bioEn, { field: "English bio", max: 1200 }),
      ka: text(req.body.bioKa, { field: "Georgian bio", max: 1200 }),
    },
    instagramUrl: instagramUrl(req.body.instagramUrl),
  };
  const tattoos = await readTattoos(req.body.tattoos);

  // everything is valid: only now touch the disk and the database
  const photo = req.file ? await saveImage(req.file.buffer) : null;
  let artist;
  try {
    const slug = await uniqueSlug(nickname, (s) => Artist.exists({ slug: s }));
    artist = await Artist.create({ ...fields, slug, photo });
  } catch (err) {
    await removeImage(photo);
    throw err;
  }
  if (tattoos) await attachTattoos(artist._id, tattoos);

  await artist.populate("styles");
  res.status(201).json(serialize.artist(artist));
}

/** Changes only the fields that were sent. */
export async function updateArtist(req, res) {
  const artist = await findArtist(req.params.key);
  const body = req.body;

  if (body.nickname !== undefined) {
    const nickname = text(body.nickname, { field: "Nickname", max: 60 });
    if (!nickname) throw badRequest("A nickname is required");
    if (nickname !== artist.nickname) {
      artist.nickname = nickname;
      artist.slug = await uniqueSlug(nickname, (s) =>
        Artist.exists({ slug: s, _id: { $ne: artist._id } })
      );
    }
  }
  const styles = await readStyles(body.styles);
  if (styles) artist.styles = styles;
  if (body.bioEn !== undefined) artist.bio.en = text(body.bioEn, { field: "English bio", max: 1200 });
  if (body.bioKa !== undefined) artist.bio.ka = text(body.bioKa, { field: "Georgian bio", max: 1200 });
  if (body.instagramUrl !== undefined) artist.instagramUrl = instagramUrl(body.instagramUrl);
  const tattoos = await readTattoos(body.tattoos);

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
  if (tattoos) await attachTattoos(artist._id, tattoos);

  await artist.populate("styles");
  res.json(serialize.artist(artist));
}

/** The artist's tattoos stay in the gallery, attached to nobody. */
export async function deleteArtist(req, res) {
  const artist = await findArtist(req.params.key);
  await Tattoo.updateMany({ artist: artist._id }, { artist: null });
  await artist.deleteOne();
  await removeImage(artist.photo);
  res.status(204).end();
}
