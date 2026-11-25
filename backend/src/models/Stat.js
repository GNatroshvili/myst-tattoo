import mongoose from "mongoose";

/** The longest a figure may be, in characters: "5,000+", "24/7". */
export const VALUE_MAX = 12;
export const LABEL_MAX = 60;
/** How many figures the home page's row holds at most. */
export const STATS_MAX = 4;

/**
 * One of the figures the home page shows about the studio: "700+" over
 * "Reviews on Google". One record serves both sites: the figure is the same
 * on both, written as the site should show it, and the line under it is kept
 * in both languages.
 */
const statSchema = new mongoose.Schema(
  {
    value: { type: String, required: true, trim: true, maxlength: VALUE_MAX },
    label: {
      en: { type: String, required: true, trim: true, maxlength: LABEL_MAX },
      ka: { type: String, required: true, trim: true, maxlength: LABEL_MAX },
    },
    /** where it stands in the row: lower comes first. A new figure gets the next number. */
    position: { type: Number, required: true, index: true },
  },
  { timestamps: true }
);

export const Stat = mongoose.model("Stat", statSchema);
