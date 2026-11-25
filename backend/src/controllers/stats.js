import { LABEL_MAX, STATS_MAX, Stat, VALUE_MAX } from "../models/Stat.js";
import { HttpError, badRequest, bilingual, isId, notFound, text } from "../utils/http.js";
import * as serialize from "../utils/serialize.js";

/**
 * The figures the home page shows about the studio ("25+ years of
 * experience"). The site shows every one of them in one row, in the order
 * the admin panel puts them in, so there are STATS_MAX at most.
 */

/** A figure and the line under it, from the request. */
function readStat(body) {
  const value = text(body?.value, { field: "Figure", max: VALUE_MAX });
  if (!value) throw badRequest("A figure is needed", "stat_value_missing");
  const label = bilingual(body?.label, { field: "Label", max: LABEL_MAX });
  if (!label.en || !label.ka) {
    throw badRequest("A label is needed in both languages", "stat_label_both_languages");
  }
  return { value, label };
}

async function findStat(id) {
  const stat = isId(id) ? await Stat.findById(id) : null;
  if (!stat) throw notFound("Figure not found");
  return stat;
}

/** Every figure, in the order the site shows them. */
const inOrder = () => Stat.find().sort({ position: 1, createdAt: 1 });

export async function listStats(_req, res) {
  res.json((await inOrder()).map(serialize.stat));
}

/** A new figure goes to the end of the row, while the row has room. */
export async function createStat(req, res) {
  const fields = readStat(req.body);
  if ((await Stat.countDocuments()) >= STATS_MAX) {
    throw new HttpError(409, `The row holds at most ${STATS_MAX} figures`, "too_many_stats", { max: STATS_MAX });
  }
  const last = await Stat.findOne().sort({ position: -1 }).select("position");
  const stat = await Stat.create({ ...fields, position: (last?.position ?? 0) + 1 });
  res.status(201).json(serialize.stat(stat));
}

export async function updateStat(req, res) {
  const stat = await findStat(req.params.id);
  Object.assign(stat, readStat(req.body));
  await stat.save();
  res.json(serialize.stat(stat));
}

export async function deleteStat(req, res) {
  const stat = await findStat(req.params.id);
  await stat.deleteOne();
  res.status(204).end();
}

/**
 * Puts the figures in a new order: `ids` lists every figure once, first to
 * last. A list that leaves one out (it was added or deleted elsewhere in the
 * meantime) is refused, so no figure ends up in an unexpected place.
 */
export async function orderStats(req, res) {
  const ids = req.body?.ids;
  const own = new Set((await Stat.find().select("_id")).map((stat) => String(stat._id)));
  const valid =
    Array.isArray(ids) &&
    ids.length === own.size &&
    new Set(ids).size === ids.length &&
    ids.every((id) => typeof id === "string" && own.has(id));
  if (!valid) throw badRequest("ids must list every figure once", "stats_bad_order");

  if (ids.length > 0) {
    await Stat.bulkWrite(
      ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { position: i + 1 } } } }))
    );
  }
  res.json((await inOrder()).map(serialize.stat));
}
