import { Piercing } from "../models/Piercing.js";
import { PiercingPlace } from "../models/PiercingPlace.js";
import { badRequest, isId, notFound } from "../utils/http.js";
import { removeImage, saveImage } from "../utils/images.js";
import { readArtist } from "../utils/refs.js";
import * as serialize from "../utils/serialize.js";

/** Photos of piercings done at the studio. */

/** The place a piercing sits in; it has to be one from the price list. */
async function readPlace(value) {
  if (!isId(value) || !(await PiercingPlace.exists({ _id: value }))) {
    throw badRequest("Choose where the piercing sits");
  }
  return value;
}

async function findPiercing(id) {
  const piercing = isId(id) ? await Piercing.findById(id) : null;
  if (!piercing) throw notFound("Piercing not found");
  return piercing;
}

/** With the place (and the place's zone) and the artist filled in. */
export const populatedPiercings = (query) =>
  query.populate({ path: "place", populate: { path: "zone" } }).populate("artist");

/** Every piercing, newest first. `?limit=4` returns only the first few. */
export async function listPiercings(req, res) {
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 0, 0), 500);
  const piercings = await populatedPiercings(Piercing.find().sort({ createdAt: -1 }).limit(limit));
  res.json(piercings.map(serialize.piercing));
}

export async function createPiercing(req, res) {
  if (!req.file) throw badRequest("Upload the piercing's photo");
  const place = await readPlace(req.body.place);
  const artist = req.body.artist === undefined ? null : await readArtist(req.body.artist);

  // everything is valid: only now touch the disk and the database
  const image = await saveImage(req.file.buffer);
  let piercing;
  try {
    piercing = await Piercing.create({ image, place, artist });
  } catch (err) {
    await removeImage(image);
    throw err;
  }
  res.status(201).json(serialize.piercing(await populatedPiercings(Piercing.findById(piercing._id))));
}

/** Changes only the fields that were sent; a new photo replaces the old one. */
export async function updatePiercing(req, res) {
  const piercing = await findPiercing(req.params.id);
  if (req.body.place !== undefined) piercing.place = await readPlace(req.body.place);
  if (req.body.artist !== undefined) piercing.artist = await readArtist(req.body.artist);

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
