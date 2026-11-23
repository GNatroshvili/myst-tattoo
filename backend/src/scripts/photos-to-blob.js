import "dotenv/config";
import path from "node:path";
import { connectDB, disconnectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { Artist } from "../models/Artist.js";
import { BlogPost } from "../models/BlogPost.js";
import { Course } from "../models/Course.js";
import { Piercing } from "../models/Piercing.js";
import { Tattoo } from "../models/Tattoo.js";
import { isDiskRef, readDiskFile, storage, storeFile } from "../utils/storage.js";

/**
 * Moves the photos kept in the uploads folder to Vercel Blob and points the
 * database at their new addresses: `npm run photos:to-blob`.
 *
 * For moving a site to Vercel. Run it on the machine that has the uploads
 * folder, with MONGODB_URI set to the database the site will use and
 * BLOB_READ_WRITE_TOKEN set to the Blob store's token.
 *
 * Safe to run again: photos already in Blob are skipped. The files in the
 * uploads folder are left where they are.
 */
if (storage !== "blob") {
  console.error("[photos] no Blob store is configured: set BLOB_READ_WRITE_TOKEN in .env first");
  process.exit(1);
}

await connectDB(env.mongoUri);

let moved = 0;
let missing = 0;
for (const [model, field] of [[Artist, "photo"], [Tattoo, "image"], [Piercing, "image"], [BlogPost, "image"]]) {
  for await (const doc of model.find({ [field]: { $ne: null } })) {
    const image = doc[field];
    const set = {};
    try {
      for (const size of ["full", "thumb"]) {
        if (!isDiskRef(image[size])) continue;
        const name = path.basename(image[size]);
        set[`${field}.${size}`] = await storeFile(name, await readDiskFile(name), "image/webp");
      }
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
      console.warn(`[photos] ${model.modelName} ${doc._id}: its file is not in ${env.uploadDir}, left as is`);
      missing += 1;
      continue;
    }
    if (Object.keys(set).length > 0) {
      await model.updateOne({ _id: doc._id }, { $set: set });
      moved += 1;
    }
  }
}

// the course keeps several photos in a list, each moved the same way
for await (const course of Course.find()) {
  for (const [i, photo] of course.photos.entries()) {
    const set = {};
    try {
      for (const size of ["full", "thumb"]) {
        if (!isDiskRef(photo[size])) continue;
        const name = path.basename(photo[size]);
        set[`photos.${i}.${size}`] = await storeFile(name, await readDiskFile(name), "image/webp");
      }
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
      console.warn(`[photos] Course photo ${photo._id}: its file is not in ${env.uploadDir}, left as is`);
      missing += 1;
      continue;
    }
    if (Object.keys(set).length > 0) {
      await Course.updateOne({ _id: course._id }, { $set: set });
      moved += 1;
    }
  }
}

console.log(`[photos] moved ${moved} photo(s) to Vercel Blob` + (missing ? `, ${missing} had no file` : ""));
await disconnectDB();
