import { BODY_MAX, Privacy } from "../models/Privacy.js";
import { badRequest, bilingual, notFound } from "../utils/http.js";
import * as serialize from "../utils/serialize.js";

/**
 * The privacy policy's text. The site carries a standard text of its own and
 * shows it until one is saved here; deleting the saved one brings it back.
 */

/** The saved policy, or 404 while the site is showing its standard text. */
export async function getPrivacy(_req, res) {
  const privacy = await Privacy.findOne();
  if (!privacy) throw notFound("No privacy policy has been saved");
  res.json(serialize.privacy(privacy));
}

/** Saves the policy's text, or changes the one there is. */
export async function savePrivacy(req, res) {
  const body = bilingual(req.body.body, { field: "Text", max: BODY_MAX });
  if (!body.en && !body.ka) {
    throw badRequest("Write the policy's text in at least one language", "privacy_body_missing");
  }

  const privacy = (await Privacy.findOne()) ?? new Privacy();
  privacy.body = body;
  const created = privacy.isNew;
  await privacy.save();
  res.status(created ? 201 : 200).json(serialize.privacy(privacy));
}

/** Drops the saved text: the page goes back to the site's standard one. */
export async function deletePrivacy(_req, res) {
  const privacy = await Privacy.findOne();
  if (!privacy) throw notFound("No privacy policy has been saved");
  await privacy.deleteOne();
  res.status(204).end();
}
