import { Style } from "../models/Style.js";
import { Tattoo } from "../models/Tattoo.js";
import { badRequest, flag, isId, notFound } from "../utils/http.js";
import { removeImage, saveImage } from "../utils/images.js";
import { readArtist } from "../utils/refs.js";
import * as serialize from "../utils/serialize.js";

async function readStyle(value) {
  if (!isId(value) || !(await Style.exists({ _id: value }))) {
    throw badRequest("Choose the tattoo's style");
  }
  return value;
}

async function findTattoo(id) {
  const tattoo = isId(id) ? await Tattoo.findById(id) : null;
  if (!tattoo) throw notFound("Tattoo not found");
  return tattoo;
}

const populated = (query) => query.populate("style").populate("artist");

/**
 * Every tattoo, newest first. `?featured=1` keeps only the ones picked for the
 * home page; `?limit=4` returns only the first few.
 */
export async function listTattoos(req, res) {
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 0, 0), 500);
  const filter = flag(req.query.featured, "featured") ? { featured: true } : {};
  const tattoos = await populated(Tattoo.find(filter).sort({ createdAt: -1 }).limit(limit));
  res.json(tattoos.map(serialize.tattoo));
}

export async function createTattoo(req, res) {
  if (!req.file) throw badRequest("Upload the tattoo's photo");
  const style = await readStyle(req.body.style);
  const artist = req.body.artist === undefined ? null : await readArtist(req.body.artist);
  const featured = flag(req.body.featured, "featured") ?? false;

  // everything is valid: only now touch the disk and the database
  const image = await saveImage(req.file.buffer);
  let tattoo;
  try {
    tattoo = await Tattoo.create({ image, style, artist, featured });
  } catch (err) {
    await removeImage(image);
    throw err;
  }
  res.status(201).json(serialize.tattoo(await populated(Tattoo.findById(tattoo._id))));
}

/** Changes only the fields that were sent; a new photo replaces the old one. */
export async function updateTattoo(req, res) {
  const tattoo = await findTattoo(req.params.id);
  if (req.body.style !== undefined) tattoo.style = await readStyle(req.body.style);
  if (req.body.artist !== undefined) tattoo.artist = await readArtist(req.body.artist);
  const featured = flag(req.body.featured, "featured");
  if (featured !== undefined) tattoo.featured = featured;

  // everything is valid: only now touch the disk and the database
  const oldImage = tattoo.image;
  const newImage = req.file ? await saveImage(req.file.buffer) : null;
  if (newImage) tattoo.image = newImage;
  try {
    await tattoo.save();
  } catch (err) {
    await removeImage(newImage);
    throw err;
  }
  if (newImage) await removeImage(oldImage);

  res.json(serialize.tattoo(await populated(Tattoo.findById(tattoo._id))));
}

export async function deleteTattoo(req, res) {
  const tattoo = await findTattoo(req.params.id);
  await tattoo.deleteOne();
  await removeImage(tattoo.image);
  res.status(204).end();
}
