import { Artist } from "../models/Artist.js";
import { Style } from "../models/Style.js";
import { Tattoo } from "../models/Tattoo.js";
import { HttpError, badRequest, isId, notFound, text } from "../utils/http.js";
import * as serialize from "../utils/serialize.js";

function readName(body) {
  const name = {
    en: text(body?.name?.en, { field: "English name", max: 40 }),
    ka: text(body?.name?.ka, { field: "Georgian name", max: 40 }),
  };
  if (!name.en || !name.ka) throw badRequest("A style needs a name in both languages");
  return name;
}

async function findStyle(id) {
  const style = isId(id) ? await Style.findById(id) : null;
  if (!style) throw notFound("Style not found");
  return style;
}

export async function listStyles(_req, res) {
  const styles = await Style.find().sort({ createdAt: 1 });
  res.json(styles.map(serialize.style));
}

export async function createStyle(req, res) {
  const style = await Style.create({ name: readName(req.body) });
  res.status(201).json(serialize.style(style));
}

export async function updateStyle(req, res) {
  const style = await findStyle(req.params.id);
  style.name = readName(req.body);
  await style.save();
  res.json(serialize.style(style));
}

/** A style that tattoos still use cannot be deleted; artists simply lose it. */
export async function deleteStyle(req, res) {
  const style = await findStyle(req.params.id);
  const inUse = await Tattoo.countDocuments({ style: style._id });
  if (inUse > 0) {
    throw new HttpError(
      409,
      `This style is used by ${inUse} tattoo(s). Change their style first.`,
      "style_in_use",
      { tattoos: inUse }
    );
  }
  await Artist.updateMany({ styles: style._id }, { $pull: { styles: style._id } });
  await style.deleteOne();
  res.status(204).end();
}
