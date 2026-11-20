import mongoose from "mongoose";
import { imageSchema } from "./image.js";

/** The longest an article's text may be, in characters, in each language. */
export const BODY_MAX = 20000;
export const TITLE_MAX = 140;

/**
 * A blog article. One record serves both sites: the title is kept in both
 * languages, and the text in at least one (a site without its own shows the
 * other). `createdAt` is the moment it was added, which the site shows.
 */
const blogPostSchema = new mongoose.Schema(
  {
    title: {
      en: { type: String, required: true, trim: true, maxlength: TITLE_MAX },
      ka: { type: String, required: true, trim: true, maxlength: TITLE_MAX },
    },
    /** last part of the article's address on both sites: /blog/<slug>; it never changes */
    slug: { type: String, required: true, unique: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: "BlogTopic", required: true, index: true },
    /** the article itself; paragraphs are separated by an empty line */
    body: {
      en: { type: String, default: "", trim: true, maxlength: BODY_MAX },
      ka: { type: String, default: "", trim: true, maxlength: BODY_MAX },
    },
    image: { type: imageSchema, required: true },
  },
  { timestamps: true }
);

export const BlogPost = mongoose.model("BlogPost", blogPostSchema);
