import mongoose from "mongoose";
import { LANGS } from "../utils/http.js";

/**
 * A part of the body where piercings are done ("Ear", "Face"), as one
 * language's site names it. Its places and their prices are PiercingPlace
 * records that point back at it.
 */
const piercingZoneSchema = new mongoose.Schema(
  {
    /** which site shows this zone: "ka" or "en" */
    lang: { type: String, enum: LANGS, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
  },
  { timestamps: true }
);

export const PiercingZone = mongoose.model("PiercingZone", piercingZoneSchema);
