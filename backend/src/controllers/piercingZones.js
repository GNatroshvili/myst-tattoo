import { Piercing } from "../models/Piercing.js";
import { PiercingPlace } from "../models/PiercingPlace.js";
import { PiercingZone } from "../models/PiercingZone.js";
import { HttpError, badRequest, isId, notFound, queryLang, readLang, text } from "../utils/http.js";
import * as serialize from "../utils/serialize.js";

/**
 * The piercing price list: zones ("Ear", "Face") and, inside each, places
 * with their prices ("Eyebrow", "Nose", "Lip").
 */

function readZoneName(value) {
  const name = text(value, { field: "Zone name", max: 40 });
  if (!name) throw badRequest("A zone needs a name");
  return name;
}

/** A place's fields from the request; with `partial`, only those that were sent. */
function readPlace(body, { partial = false } = {}) {
  const fields = {};
  if (!partial || body?.name !== undefined) {
    fields.name = text(body?.name, { field: "Place name", max: 60 });
    if (!fields.name) throw badRequest("A place needs a name");
  }
  if (!partial || body?.note !== undefined) {
    fields.note = text(body?.note, { field: "Note", max: 160 });
  }
  if (!partial || body?.price !== undefined) {
    fields.price = text(body?.price, { field: "Price", max: 40 });
    if (!fields.price) throw badRequest("A place needs a price");
  }
  return fields;
}

async function findZone(id) {
  const zone = isId(id) ? await PiercingZone.findById(id) : null;
  if (!zone) throw notFound("Zone not found");
  return zone;
}

async function findPlace(id) {
  const place = isId(id) ? await PiercingPlace.findById(id) : null;
  if (!place) throw notFound("Place not found");
  return place;
}

/** A zone as the API sends it: with its places, each with how many photos use it. */
async function zoneWithPlaces(zone) {
  const places = await PiercingPlace.find({ zone: zone._id }).sort({ createdAt: 1 });
  const counts = await Piercing.aggregate([
    { $match: { place: { $in: places.map((p) => p._id) } } },
    { $group: { _id: "$place", n: { $sum: 1 } } },
  ]);
  const used = new Map(counts.map((c) => [String(c._id), c.n]));
  return serialize.piercingZone(
    zone,
    places.map((p) => serialize.piercingPlace(p, { piercingCount: used.get(String(p._id)) ?? 0 }))
  );
}

/** Every zone with its places, in the order they were added; `?lang=ka` for one language's. */
export async function listZones(req, res) {
  const lang = queryLang(req.query.lang);
  const zones = await PiercingZone.find(lang ? { lang } : {}).sort({ createdAt: 1 });
  res.json(await Promise.all(zones.map(zoneWithPlaces)));
}

export async function createZone(req, res) {
  const lang = readLang(req.body?.lang);
  const zone = await PiercingZone.create({ lang, name: readZoneName(req.body?.name) });
  res.status(201).json(await zoneWithPlaces(zone));
}

/** Renames a zone. Its language is set once, when it is added. */
export async function updateZone(req, res) {
  const zone = await findZone(req.params.id);
  if (req.body?.lang !== undefined && req.body.lang !== zone.lang) {
    throw badRequest("The language of a zone cannot be changed", "lang_fixed");
  }
  zone.name = readZoneName(req.body?.name);
  await zone.save();
  res.json(await zoneWithPlaces(zone));
}

/** Deletes a zone and its places, unless piercing photos still sit in one of them. */
export async function deleteZone(req, res) {
  const zone = await findZone(req.params.id);
  const places = await PiercingPlace.find({ zone: zone._id }).select("_id");
  const inUse = await Piercing.countDocuments({ place: { $in: places.map((p) => p._id) } });
  if (inUse > 0) {
    throw new HttpError(
      409,
      `Places in this zone are used by ${inUse} piercing photo(s). Move or delete them first.`,
      "zone_in_use",
      { piercings: inUse }
    );
  }
  await PiercingPlace.deleteMany({ zone: zone._id });
  await zone.deleteOne();
  res.status(204).end();
}

/** Adds a place (with its price) to a zone; it takes the zone's language. */
export async function createPlace(req, res) {
  const zone = await findZone(req.params.id);
  await PiercingPlace.create({ zone: zone._id, lang: zone.lang, ...readPlace(req.body) });
  res.status(201).json(await zoneWithPlaces(zone));
}

/** Changes only the fields that were sent. */
export async function updatePlace(req, res) {
  const place = await findPlace(req.params.id);
  Object.assign(place, readPlace(req.body, { partial: true }));
  await place.save();
  res.json(await zoneWithPlaces(await findZone(String(place.zone))));
}

/** A place that piercing photos still use cannot be deleted. */
export async function deletePlace(req, res) {
  const place = await findPlace(req.params.id);
  const inUse = await Piercing.countDocuments({ place: place._id });
  if (inUse > 0) {
    throw new HttpError(
      409,
      `This place is used by ${inUse} piercing photo(s). Move or delete them first.`,
      "place_in_use",
      { piercings: inUse }
    );
  }
  await place.deleteOne();
  res.status(204).end();
}
