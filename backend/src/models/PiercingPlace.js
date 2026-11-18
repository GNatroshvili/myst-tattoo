import mongoose from "mongoose";
import { LANGS } from "../utils/http.js";

/**
 * One line of a zone's price list: a place within the zone ("Eyebrow" under
 * "Face"), an optional note and its price.
 */
const piercingPlaceSchema = new mongoose.Schema(
  {
    zone: { type: mongoose.Schema.Types.ObjectId, ref: "PiercingZone", required: true, index: true },
    /** the zone's language, kept here too so places can be checked without loading the zone */
    lang: { type: String, enum: LANGS, required: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    /** small line under the name, e.g. what the price covers; may be empty */
    note: { type: String, default: "", trim: true, maxlength: 160 },
    /** as the visitor reads it: "80 ₾", "from 60 ₾" */
    price: { type: String, required: true, trim: true, maxlength: 40 },
  },
  { timestamps: true }
);

export const PiercingPlace = mongoose.model("PiercingPlace", piercingPlaceSchema);
