import { Artist } from "../models/Artist.js";
import { Tattoo } from "../models/Tattoo.js";

/**
 * Brings records saved by earlier versions of the server up to date. It runs
 * on every start and does nothing once the data is in today's shape.
 *
 * - Artists and tattoos used to have no language. They become Georgian, the
 *   language of the admin panel; a tattoo takes its artist's language.
 * - An artist's bio used to be kept in both languages. It becomes one text.
 * - Slugs used to be unique across all artists. They are now unique within a
 *   language, so the old index is replaced.
 */
export async function upgradeData() {
  const artists = Artist.collection;
  const tattoos = Tattoo.collection;
  let changed = 0;

  const noLang = await artists.updateMany({ lang: { $exists: false } }, { $set: { lang: "ka" } });
  changed += noLang.modifiedCount;

  for await (const doc of artists.find({ bio: { $type: "object" } })) {
    const bio = doc.bio?.[doc.lang] || doc.bio?.ka || doc.bio?.en || "";
    await artists.updateOne({ _id: doc._id }, { $set: { bio } });
    changed += 1;
  }

  for await (const doc of tattoos.find({ lang: { $exists: false } })) {
    const artist = doc.artist ? await artists.findOne({ _id: doc.artist }) : null;
    await tattoos.updateOne({ _id: doc._id }, { $set: { lang: artist?.lang ?? "ka" } });
    changed += 1;
  }

  // drops indexes the models no longer define (the old unique slug) and builds the new ones
  await Artist.syncIndexes();
  await Tattoo.syncIndexes();

  if (changed > 0) console.log(`[db] brought ${changed} older record(s) up to date`);
}
