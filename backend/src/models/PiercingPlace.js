import mongoose from "mongoose";

/**
 * One line of a zone's price list: a place within the zone ("წარბი" /
 * "Eyebrow" under "Face"), an optional note and its price. The name and the
 * note are kept in both languages; the price is one text for both sites.
 */
const piercingPlaceSchema = new mongoose.Schema(
  {
    zone: { type: mongoose.Schema.Types.ObjectId, ref: "PiercingZone", required: true, index: true },
    name: {
      en: { type: String, required: true, trim: true, maxlength: 60 },
      ka: { type: String, required: true, trim: true, maxlength: 60 },
    },
    /** small line under the name, e.g. what the price covers; may be empty */
    note: {
      en: { type: String, default: "", trim: true, maxlength: 160 },
      ka: { type: String, default: "", trim: true, maxlength: 160 },
    },
    /** as the visitor reads it on both sites: "80 ₾" */
    price: { type: String, required: true, trim: true, maxlength: 40 },
  },
  { timestamps: true }
);

export const PiercingPlace = mongoose.model("PiercingPlace", piercingPlaceSchema);
