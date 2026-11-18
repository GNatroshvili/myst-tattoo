import { Piercing } from "../models/Piercing.js";
import { PiercingPlace } from "../models/PiercingPlace.js";
import { badRequest, isId, notFound, queryLang } from "../utils/http.js";
import { removeImage, saveImage } from "../utils/images.js";
import { readArtist } from "../utils/refs.js";
import * as serialize from "../utils/serialize.js";

/** Photos of piercings done at the studio. */

/** The place a piercing sits in: it must exist, and it decides the language. */
async function readPlace(value) {
  const place = isId(value) ? await PiercingPlace.findById(value).select("lang") : null;
  if (!place) throw badRequest("Choose where the piercing sits");
  return place;
}

async function findPiercing(id) {
  const piercing = isId(id) ? await Piercing.findById(id) : null;
  if (!piercing) throw notFound("Piercing not found");
  return piercing;
}

/** With the place (and the place's zone) and the artist filled in. */
export const populatedPiercings = (query) =>
  query.populate({ path: "place", populate: { path: "zone" } }).populate("artist");

/**
 * Piercings, newest first: all of them, or with `?lang=ka` only that language's.
 * `?limit=4` returns only the first few.
 */
export async function listPiercings(req, res) {
  const lang = queryLang(req.query.lang);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 0, 0), 500);
  const piercings = await populatedPiercings(
    Piercing.find(lang ? { lang } : {}).sort({ createdAt: -1 }).limit(limit)
  );
  res.json(piercings.map(serialize.piercing));
}

/** The piercing takes the language of the place it is added to. */
export async function createPiercing(req, res) {
  if (!req.file) throw badRequest("Upload the piercing's photo");
  const place = await readPlace(req.body.place);
  const lang = place.lang;
  if (req.body.lang !== undefined && req.body.lang !== lang) {
    throw badRequest("The chosen place belongs to the other language", "lang_mismatch");
  }
  const artist = req.body.artist === undefined ? null : await readArtist(req.body.artist, lang);

  // everything is valid: only now touch the disk and the database
  const image = await saveImage(req.file.buffer);
  let piercing;
  try {
    piercing = await Piercing.create({ lang, image, place: place._id, artist });
  } catch (err) {
    await removeImage(image);
    throw err;
  }
  res.status(201).json(serialize.piercing(await populatedPiercings(Piercing.findById(piercing._id))));
}

/**
 * Changes only the fields that were sent; a new photo replaces the old one.
 * The language is set once, so a new place has to be of the same one.
 */
export async function updatePiercing(req, res) {
  const piercing = await findPiercing(req.params.id);
  if (req.body.lang !== undefined && req.body.lang !== piercing.lang) {
    throw badRequest("The language of a piercing cannot be changed", "lang_fixed");
  }
  if (req.body.place !== undefined) {
    const place = await readPlace(req.body.place);
    if (place.lang !== piercing.lang) {
      throw badRequest("The chosen place belongs to the other language", "lang_mismatch");
    }
    piercing.place = place._id;
  }
  if (req.body.artist !== undefined) piercing.artist = await readArtist(req.body.artist, piercing.lang);

  // everything is valid: only now touch the disk and the database
  const oldImage = piercing.image;
  const newImage = req.file ? await saveImage(req.file.buffer) : null;
  if (newImage) piercing.image = newImage;
  try {
    await piercing.save();
  } catch (err) {
    await removeImage(newImage);
    throw err;
  }
  if (newImage) await removeImage(oldImage);

  res.json(serialize.piercing(await populatedPiercings(Piercing.findById(piercing._id))));
}

export async function deletePiercing(req, res) {
  const piercing = await findPiercing(req.params.id);
  await piercing.deleteOne();
  await removeImage(piercing.image);
  res.status(204).end();
}
