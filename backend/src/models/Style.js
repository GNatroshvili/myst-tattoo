import mongoose from "mongoose";

/** A tattoo style, named in both of the site's languages. */
const styleSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true, trim: true, maxlength: 40 },
      ka: { type: String, required: true, trim: true, maxlength: 40 },
    },
  },
  { timestamps: true }
);

export const Style = mongoose.model("Style", styleSchema);
