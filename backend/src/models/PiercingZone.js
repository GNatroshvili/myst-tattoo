import mongoose from "mongoose";

/**
 * A part of the body where piercings are done, named in both of the site's
 * languages ("ყური" / "Ear"). Its places and their prices are PiercingPlace
 * records that point back at it.
 */
const piercingZoneSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true, trim: true, maxlength: 40 },
      ka: { type: String, required: true, trim: true, maxlength: 40 },
    },
  },
  { timestamps: true }
);

export const PiercingZone = mongoose.model("PiercingZone", piercingZoneSchema);
