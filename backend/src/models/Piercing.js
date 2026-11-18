import mongoose from "mongoose";
import { LANGS } from "../utils/http.js";
import { imageSchema } from "./image.js";

/** A photo of a piercing done at the studio. */
const piercingSchema = new mongoose.Schema(
  {
    /** which site's gallery shows it: "ka" or "en" (always its place's language) */
    lang: { type: String, enum: LANGS, required: true, index: true },
    image: { type: imageSchema, required: true },
    /** where it sits: a place from the price list, which also gives its zone */
    place: { type: mongoose.Schema.Types.ObjectId, ref: "PiercingPlace", required: true, index: true },
    /** who did it (an artist of the same language); empty until it is attached to one */
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", default: null, index: true },
  },
  { timestamps: true }
);

export const Piercing = mongoose.model("Piercing", piercingSchema);
