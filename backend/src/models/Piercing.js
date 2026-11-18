import mongoose from "mongoose";
import { imageSchema } from "./image.js";

/** A photo of a piercing done at the studio. */
const piercingSchema = new mongoose.Schema(
  {
    image: { type: imageSchema, required: true },
    /** where it sits: a place from the price list, which also gives its zone */
    place: { type: mongoose.Schema.Types.ObjectId, ref: "PiercingPlace", required: true, index: true },
    /** who did it; empty until the piercing is attached to an artist */
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", default: null, index: true },
  },
  { timestamps: true }
);

export const Piercing = mongoose.model("Piercing", piercingSchema);
