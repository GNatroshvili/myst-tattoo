import { Artist } from "../models/Artist.js";
import { Piercing } from "../models/Piercing.js";
import { PiercingPlace } from "../models/PiercingPlace.js";
import { PiercingZone } from "../models/PiercingZone.js";
import { Tattoo } from "../models/Tattoo.js";
import { removeImage } from "./images.js";

/**
 * Brings records saved by earlier versions of the server up to date. It runs
 * on every start and does nothing once the data is in today's shape.
 *
 * Today one record serves both sites: an artist's nickname and bio, and the
 * names and notes of piercing zones and places, are kept in both languages.
 * Two earlier shapes are converted:
 *
 * - The first version had one nickname and a bio in both languages.
 * - The second kept a separate record per language (`lang` on artists,
 *   tattoos, piercings, zones and places), with one nickname, one bio and one
 *   name each. Such a text becomes the text of both languages, except a bio
 *   or a note, which stays in the language it was written for. Two artists
 *   that shared a profile address across the two languages were the same
 *   person: they are joined into one, with both sets of works.
 */
export async function upgradeData() {
  const artists = Artist.collection;
  let changed = 0;

  for await (const doc of artists.find({ nickname: { $type: "string" } })) {
    const set = { nickname: { en: doc.nickname, ka: doc.nickname } };
    if (typeof doc.bio === "string") {
      set.bio = { en: "", ka: "", [doc.lang === "en" ? "en" : "ka"]: doc.bio };
    }
    await artists.updateOne({ _id: doc._id }, { $set: set });
    changed += 1;
  }

  // the same person added once per language: same address, different `lang`
  const twins = await artists
    .aggregate([
      { $match: { lang: { $exists: true } } },
      { $group: { _id: "$slug", ids: { $push: "$_id" }, n: { $sum: 1 } } },
      { $match: { n: { $gt: 1 } } },
    ])
    .toArray();
  for (const { ids } of twins) {
    const docs = await artists.find({ _id: { $in: ids } }).sort({ createdAt: 1 }).toArray();
    const keep = docs.find((d) => d.lang === "ka") ?? docs[0];
    for (const other of docs.filter((d) => d !== keep)) {
      const language = other.lang === "en" ? "en" : "ka";
      const set = { [`nickname.${language}`]: other.nickname[language] };
      if (other.bio?.[language]) set[`bio.${language}`] = other.bio[language];
      if (!keep.photo && other.photo) set.photo = other.photo;
      else await removeImage(other.photo);
      await artists.updateOne({ _id: keep._id }, { $set: set });
      await Tattoo.collection.updateMany({ artist: other._id }, { $set: { artist: keep._id } });
      await Piercing.collection.updateMany({ artist: other._id }, { $set: { artist: keep._id } });
      await artists.deleteOne({ _id: other._id });
      changed += 1;
    }
  }

  for (const model of [PiercingZone, PiercingPlace]) {
    for await (const doc of model.collection.find({ name: { $type: "string" } })) {
      const set = { name: { en: doc.name, ka: doc.name } };
      if (typeof doc.note === "string") {
        set.note = { en: "", ka: "", [doc.lang === "en" ? "en" : "ka"]: doc.note };
      }
      await model.collection.updateOne({ _id: doc._id }, { $set: set });
      changed += 1;
    }
  }

  // nothing belongs to one language any more
  for (const model of [Artist, Tattoo, Piercing, PiercingZone, PiercingPlace]) {
    const done = await model.collection.updateMany({ lang: { $exists: true } }, { $unset: { lang: "" } });
    changed += done.modifiedCount;
  }

  // drops indexes the models no longer define and builds the ones they do
  for (const model of [Artist, Tattoo, Piercing, PiercingZone, PiercingPlace]) {
    await model.syncIndexes();
  }

  if (changed > 0) console.log(`[db] brought ${changed} older record(s) up to date`);
}
