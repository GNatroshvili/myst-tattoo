import { ANSWER_MAX, Faq, QUESTION_MAX } from "../models/Faq.js";
import { badRequest, bilingual, isId, notFound } from "../utils/http.js";
import * as serialize from "../utils/serialize.js";

/**
 * The home page's frequently asked questions. The site shows every one of
 * them, in the order the admin panel puts them in.
 */

/** A question's two texts from the request. */
function readFaq(body) {
  const question = bilingual(body?.question, { field: "Question", max: QUESTION_MAX });
  if (!question.en || !question.ka) {
    throw badRequest("A question is needed in both languages", "question_both_languages");
  }
  const answer = bilingual(body?.answer, { field: "Answer", max: ANSWER_MAX });
  if (!answer.en && !answer.ka) {
    throw badRequest("Write the answer in at least one language", "answer_missing");
  }
  return { question, answer };
}

async function findFaq(id) {
  const faq = isId(id) ? await Faq.findById(id) : null;
  if (!faq) throw notFound("Question not found");
  return faq;
}

/** Every question, in the order the site shows them. */
const inOrder = () => Faq.find().sort({ position: 1, createdAt: 1 });

export async function listFaqs(_req, res) {
  res.json((await inOrder()).map(serialize.faq));
}

/** A new question goes to the end of the list. */
export async function createFaq(req, res) {
  const fields = readFaq(req.body);
  const last = await Faq.findOne().sort({ position: -1 }).select("position");
  const faq = await Faq.create({ ...fields, position: (last?.position ?? 0) + 1 });
  res.status(201).json(serialize.faq(faq));
}

export async function updateFaq(req, res) {
  const faq = await findFaq(req.params.id);
  Object.assign(faq, readFaq(req.body));
  await faq.save();
  res.json(serialize.faq(faq));
}

export async function deleteFaq(req, res) {
  const faq = await findFaq(req.params.id);
  await faq.deleteOne();
  res.status(204).end();
}

/**
 * Puts the questions in a new order: `ids` lists every question once, first
 * to last. A list that leaves one out (it was added or deleted elsewhere in
 * the meantime) is refused, so no question ends up in an unexpected place.
 */
export async function orderFaqs(req, res) {
  const ids = req.body?.ids;
  const own = new Set((await Faq.find().select("_id")).map((faq) => String(faq._id)));
  const valid =
    Array.isArray(ids) &&
    ids.length === own.size &&
    new Set(ids).size === ids.length &&
    ids.every((id) => typeof id === "string" && own.has(id));
  if (!valid) throw badRequest("ids must list every question once", "bad_order");

  if (ids.length > 0) {
    await Faq.bulkWrite(
      ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { position: i + 1 } } } }))
    );
  }
  res.json((await inOrder()).map(serialize.faq));
}
