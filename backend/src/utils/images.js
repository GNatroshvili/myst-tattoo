import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { badRequest } from "./http.js";
import { removeFiles, storeFile } from "./storage.js";

/** Longest side of the stored photo and of its small copy, in pixels. */
const FULL = 1600;
const THUMB = 640;

/**
 * Stores an uploaded photo as two WebP files: the photo itself (at most
 * 1600px) and a small copy for galleries (at most 640px). The picture is
 * turned the right way up and its camera data is dropped on the way.
 *
 * Returns what the database keeps: the two files' refs (see storage.js) and
 * the photo's size.
 */
export async function saveImage(buffer) {
  const fit = { fit: "inside", withoutEnlargement: true };
  let full, thumb;
  try {
    const source = sharp(buffer, { failOn: "error" }).rotate();
    [full, thumb] = await Promise.all([
      source.clone().resize(FULL, FULL, fit).webp({ quality: 82 }).toBuffer({ resolveWithObject: true }),
      source.clone().resize(THUMB, THUMB, fit).webp({ quality: 78 }).toBuffer({ resolveWithObject: true }),
    ]);
  } catch {
    throw badRequest("The photo could not be read. Use a JPEG, PNG, WebP or AVIF image.", "bad_photo");
  }

  const id = randomUUID();
  const fullRef = await storeFile(`${id}.webp`, full.data, "image/webp");
  try {
    const thumbRef = await storeFile(`${id}-thumb.webp`, thumb.data, "image/webp");
    return { full: fullRef, thumb: thumbRef, width: full.info.width, height: full.info.height };
  } catch (err) {
    await removeFiles([fullRef]).catch(() => {});
    throw err;
  }
}

/** Deletes a stored photo's files; a file that is already gone is not an error. */
export async function removeImage(image) {
  if (!image) return;
  await removeFiles([image.full, image.thumb].filter(Boolean));
}
