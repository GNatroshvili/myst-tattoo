import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { env } from "../config/env.js";
import { badRequest } from "./http.js";

/** Longest side of the stored photo and of its small copy, in pixels. */
const FULL = 1600;
const THUMB = 640;

/**
 * Stores an uploaded photo as two WebP files: the photo itself (at most
 * 1600px) and a small copy for galleries (at most 640px). The picture is
 * turned the right way up and its camera data is dropped on the way.
 *
 * Returns what the database keeps: the two file names and the photo's size.
 */
export async function saveImage(buffer) {
  await fs.mkdir(env.uploadDir, { recursive: true });
  const id = randomUUID();
  const full = `${id}.webp`;
  const thumb = `${id}-thumb.webp`;
  const fit = { fit: "inside", withoutEnlargement: true };

  try {
    const source = sharp(buffer, { failOn: "error" }).rotate();
    const info = await source
      .clone()
      .resize(FULL, FULL, fit)
      .webp({ quality: 82 })
      .toFile(path.join(env.uploadDir, full));
    await source
      .clone()
      .resize(THUMB, THUMB, fit)
      .webp({ quality: 78 })
      .toFile(path.join(env.uploadDir, thumb));
    return { full, thumb, width: info.width, height: info.height };
  } catch {
    await removeImage({ full, thumb });
    throw badRequest("The photo could not be read. Use a JPEG, PNG, WebP or AVIF image.", "bad_photo");
  }
}

/** Deletes a stored photo's files; a file that is already gone is not an error. */
export async function removeImage(image) {
  if (!image) return;
  await Promise.all(
    [image.full, image.thumb]
      .filter(Boolean)
      .map((name) => fs.rm(path.join(env.uploadDir, path.basename(name)), { force: true }))
  );
}
