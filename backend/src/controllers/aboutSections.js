import { AboutSection, BODY_MAX, TITLE_MAX } from "../models/AboutSection.js";
import { badRequest, isId, notFound, text } from "../utils/http.js";
import { removeImage, saveImage } from "../utils/images.js";
import * as serialize from "../utils/serialize.js";

/**
 * The sections of the site's /about page: each a photo, an optional title and
 * a text. The page shows every one of them, in the order the admin panel puts
 * them in.
 */

const readTitle = (value, language) => text(value, { field: `${language} title`, max: TITLE_MAX });
const readBody = (value, language) => text(value, { field: `${language} text`, max: BODY_MAX });

/** The text may be written in one language only, but not in neither. */
function requireBody(body) {
  if (!body.ka && !body.en) {
    throw badRequest("Write the section's text in at least one language", "about_body_missing");
  }
}

async function findSection(id) {
  const section = isId(id) ? await AboutSection.findById(id) : null;
  if (!section) throw notFound("Section not found");
  return section;
}

/** Every section, in the order the page shows them. */
const inOrder = () => AboutSection.find().sort({ position: 1, createdAt: 1 });

export async function listSections(_req, res) {
  res.json((await inOrder()).map(serialize.aboutSection));
}

/** A new section goes to the end of the page. */
export async function createSection(req, res) {
  const title = { ka: readTitle(req.body.titleKa, "Georgian"), en: readTitle(req.body.titleEn, "English") };
  const body = { ka: readBody(req.body.bodyKa, "Georgian"), en: readBody(req.body.bodyEn, "English") };
  requireBody(body);
  if (!req.file) throw badRequest("Choose the section's photo", "photo_missing");

  // everything is valid: only now touch the disk and the database
  const image = await saveImage(req.file.buffer);
  let section;
  try {
    const last = await AboutSection.findOne().sort({ position: -1 }).select("position");
    section = await AboutSection.create({ title, body, image, position: (last?.position ?? 0) + 1 });
  } catch (err) {
    await removeImage(image);
    throw err;
  }
  res.status(201).json(serialize.aboutSection(section));
}

/** Changes only the fields that were sent; a new photo replaces the old one. */
export async function updateSection(req, res) {
  const section = await findSection(req.params.id);
  if (req.body.titleKa !== undefined) section.title.ka = readTitle(req.body.titleKa, "Georgian");
  if (req.body.titleEn !== undefined) section.title.en = readTitle(req.body.titleEn, "English");
  if (req.body.bodyKa !== undefined) section.body.ka = readBody(req.body.bodyKa, "Georgian");
  if (req.body.bodyEn !== undefined) section.body.en = readBody(req.body.bodyEn, "English");
  requireBody(section.body);

  // everything is valid: only now touch the disk and the database
  const oldImage = section.image;
  const newImage = req.file ? await saveImage(req.file.buffer) : null;
  if (newImage) section.image = newImage;
  try {
    await section.save();
  } catch (err) {
    await removeImage(newImage);
    throw err;
  }
  if (newImage) await removeImage(oldImage);

  res.json(serialize.aboutSection(section));
}

export async function deleteSection(req, res) {
  const section = await findSection(req.params.id);
  await section.deleteOne();
  await removeImage(section.image);
  res.status(204).end();
}

/**
 * Puts the sections in a new order: `ids` lists every section once, first to
 * last. A list that leaves one out (it was added or deleted elsewhere in the
 * meantime) is refused, so no section ends up in an unexpected place.
 */
export async function orderSections(req, res) {
  const ids = req.body?.ids;
  const own = new Set((await AboutSection.find().select("_id")).map((section) => String(section._id)));
  const valid =
    Array.isArray(ids) &&
    ids.length === own.size &&
    new Set(ids).size === ids.length &&
    ids.every((id) => typeof id === "string" && own.has(id));
  if (!valid) throw badRequest("ids must list every section once", "about_bad_order");

  if (ids.length > 0) {
    await AboutSection.bulkWrite(
      ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { position: i + 1 } } } }))
    );
  }
  res.json((await inOrder()).map(serialize.aboutSection));
}
