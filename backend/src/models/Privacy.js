import mongoose from "mongoose";

/** The longest the policy's text may be, in characters, in each language. */
export const BODY_MAX = 20000;

/**
 * The privacy policy as the admin panel last saved it, shown on the site's
 * /privacy page. There is one record at most, and it serves both sites: the
 * text is kept in at least one language (a site without its own shows the
 * other). While there is no record the page shows the standard text that
 * comes with the site (frontend/lib/privacy.ts). `updatedAt` is the "last
 * updated" date the page shows.
 */
const privacySchema = new mongoose.Schema(
  {
    /** the same in the only record there may be: a second one cannot be saved */
    key: { type: String, default: "privacy", unique: true, immutable: true },
    /**
     * Paragraphs are separated by an empty line; a line that begins with "#"
     * is a section's heading.
     */
    body: {
      en: { type: String, default: "", trim: true, maxlength: BODY_MAX },
      ka: { type: String, default: "", trim: true, maxlength: BODY_MAX },
    },
  },
  { timestamps: true }
);

export const Privacy = mongoose.model("Privacy", privacySchema);
