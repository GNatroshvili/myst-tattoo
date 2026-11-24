import mongoose from "mongoose";

export const QUESTION_MAX = 200;
/** The longest an answer may be, in characters, in each language. */
export const ANSWER_MAX = 2000;

/**
 * One of the home page's frequently asked questions. One record serves both
 * sites: the question is kept in both languages, and the answer in at least
 * one (a site without its own shows the other).
 */
const faqSchema = new mongoose.Schema(
  {
    question: {
      en: { type: String, required: true, trim: true, maxlength: QUESTION_MAX },
      ka: { type: String, required: true, trim: true, maxlength: QUESTION_MAX },
    },
    /** line breaks are kept as written */
    answer: {
      en: { type: String, default: "", trim: true, maxlength: ANSWER_MAX },
      ka: { type: String, default: "", trim: true, maxlength: ANSWER_MAX },
    },
    /** where it stands in the list: lower comes first. A new question gets the next number. */
    position: { type: Number, required: true, index: true },
  },
  { timestamps: true }
);

export const Faq = mongoose.model("Faq", faqSchema);
