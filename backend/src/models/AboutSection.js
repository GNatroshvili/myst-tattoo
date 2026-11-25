import mongoose from "mongoose";
import { imageSchema } from "./image.js";

export const TITLE_MAX = 140;
/** The longest a section's text may be, in characters, in each language. */
export const BODY_MAX = 5000;

/**
 * One section of the site's /about page: a photo, an optional title and a
 * text. One record serves both sites: the title may be left out in either
 * language, and the text is kept in at least one (a site without its own
 * shows the other).
 */
const aboutSectionSchema = new mongoose.Schema(
  {
    /** "" where the section has no title */
    title: {
      en: { type: String, default: "", trim: true, maxlength: TITLE_MAX },
      ka: { type: String, default: "", trim: true, maxlength: TITLE_MAX },
    },
    /** paragraphs are separated by an empty line */
    body: {
      en: { type: String, default: "", trim: true, maxlength: BODY_MAX },
      ka: { type: String, default: "", trim: true, maxlength: BODY_MAX },
    },
    image: { type: imageSchema, required: true },
    /** where it stands on the page: lower comes first. A new section gets the next number. */
    position: { type: Number, required: true, index: true },
  },
  { timestamps: true }
);

export const AboutSection = mongoose.model("AboutSection", aboutSectionSchema);
