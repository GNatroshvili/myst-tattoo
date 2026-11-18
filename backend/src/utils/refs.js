import { Artist } from "../models/Artist.js";
import { badRequest, isId } from "./http.js";

/**
 * An artist's id from a form, or null for "attached to nobody" (an empty
 * field). Used by tattoos and piercings alike.
 */
export async function readArtist(value) {
  if (value === "" || value === null) return null;
  if (!isId(value) || !(await Artist.exists({ _id: value }))) {
    throw badRequest("The chosen artist does not exist");
  }
  return value;
}
