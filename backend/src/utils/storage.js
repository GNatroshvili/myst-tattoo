import fs from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";
import { env } from "../config/env.js";
import { HttpError } from "./http.js";

/**
 * Where photo files live. There are two places:
 *
 * - "disk": the uploads folder beside the server. Used on a developer's
 *   machine and on any host that keeps its disk.
 * - "blob": Vercel Blob, for hosts with no lasting disk (Vercel). Used as soon
 *   as a Blob store is connected, which puts its credentials in the environment.
 *
 * A stored file is remembered by its "ref": the bare file name on disk, or the
 * file's full address in Blob. Both kinds can sit side by side in one
 * database, so photos saved before a move keep working until they are moved.
 */

export const storage = env.blobConfigured ? "blob" : "disk";

const isUrl = (ref) => /^https?:\/\//.test(ref);

/** The address a browser loads a stored file from. */
export const fileUrl = (ref) => (isUrl(ref) ? ref : `/uploads/${ref}`);

/** Saves a file and returns its ref. `name` is unique, so nothing is ever overwritten. */
export async function storeFile(name, buffer, contentType) {
  if (storage === "blob") {
    try {
      const blob = await put(`photos/${name}`, buffer, {
        access: "public",
        contentType,
        // only ever the same file again, when moving photos is run a second time
        allowOverwrite: true,
        // names are never reused, so browsers and the CDN may keep a file for a year
        cacheControlMaxAge: 365 * 24 * 60 * 60,
      });
      return blob.url;
    } catch (err) {
      // a wrong token, a private store, a full quota: say what Blob said
      console.error("[photos] Vercel Blob refused a file:", err.message);
      throw new HttpError(502, `Photo storage refused the file: ${err.message}`, "storage_failed");
    }
  }

  if (env.onVercel) {
    // nothing written here would survive: refuse rather than lose the photo later
    throw new HttpError(
      503,
      "Photo storage is not set up: connect a Vercel Blob store to this project",
      "storage_not_configured"
    );
  }
  await fs.mkdir(env.uploadDir, { recursive: true });
  await fs.writeFile(path.join(env.uploadDir, name), buffer);
  return name;
}

/** Deletes stored files by their refs; one that is already gone is not an error. */
export async function removeFiles(refs) {
  const urls = refs.filter(isUrl);
  const names = refs.filter((ref) => !isUrl(ref));
  await Promise.all([
    urls.length > 0 && env.blobConfigured ? del(urls) : null,
    ...names.map((name) => fs.rm(path.join(env.uploadDir, path.basename(name)), { force: true })),
  ]);
}

/** Reads a file kept on disk (for moving it to Blob). */
export const readDiskFile = (name) => fs.readFile(path.join(env.uploadDir, path.basename(name)));

export const isDiskRef = (ref) => !isUrl(ref);
