import { Artist } from "../models/Artist.js";
import { badRequest, isId } from "./http.js";

/**
 * An artist's id from a form, or null for "attached to nobody" (an empty
 * field). A tattoo or a piercing can only belong to an artist of its own
 * language.
 */
export async function readArtist(value, lang) {
  if (value === "" || value === null) return null;
  const artist = isId(value) ? await Artist.findById(value).select("lang") : null;
  if (!artist) throw badRequest("The chosen artist does not exist");
  if (artist.lang !== lang) {
    throw badRequest("The chosen artist belongs to the other language", "lang_mismatch");
  }
  return value;
}
