import mongoose from "mongoose";
import { LANGS } from "../utils/http.js";
import { imageSchema } from "./image.js";

/**
 * An artist as one language's site shows them. The same person on both sites
 * is two records, one per language, each with its own nickname, bio and works.
 */
const artistSchema = new mongoose.Schema(
  {
    /** which site shows this artist: "ka" or "en" */
    lang: { type: String, enum: LANGS, required: true },
    nickname: { type: String, required: true, trim: true, maxlength: 60 },
    /** last part of the profile's address: /<lang>/artists/<slug> */
    slug: { type: String, required: true },
    /** the styles this artist works in */
    styles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Style" }],
    /** in the artist's language */
    bio: { type: String, default: "", trim: true, maxlength: 1200 },
    instagramUrl: { type: String, default: "" },
    photo: { type: imageSchema, default: null },
  },
  { timestamps: true }
);

// a slug is unique within its language, so "ნინო" and "Nino" can both be /artists/nino
artistSchema.index({ lang: 1, slug: 1 }, { unique: true });

export const Artist = mongoose.model("Artist", artistSchema);
