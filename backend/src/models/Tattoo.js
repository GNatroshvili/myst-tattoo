import mongoose from "mongoose";
import { LANGS } from "../utils/http.js";
import { imageSchema } from "./image.js";

const tattooSchema = new mongoose.Schema(
  {
    /** which site's gallery shows this tattoo: "ka" or "en" */
    lang: { type: String, enum: LANGS, required: true, index: true },
    image: { type: imageSchema, required: true },
    style: { type: mongoose.Schema.Types.ObjectId, ref: "Style", required: true },
    /** who tattooed it (an artist of the same language); empty until it is attached to one */
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", default: null, index: true },
  },
  { timestamps: true }
);

export const Tattoo = mongoose.model("Tattoo", tattooSchema);
