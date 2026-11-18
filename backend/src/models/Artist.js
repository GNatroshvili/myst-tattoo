import mongoose from "mongoose";
import { imageSchema } from "./image.js";

/**
 * An artist. One record serves both sites: the nickname and the bio are kept
 * in both languages, everything else is shared.
 */
const artistSchema = new mongoose.Schema(
  {
    /** as each site shows it: "ნიკა" on /ka, "Nika" on /en */
    nickname: {
      en: { type: String, required: true, trim: true, maxlength: 60 },
      ka: { type: String, required: true, trim: true, maxlength: 60 },
    },
    /** last part of the profile's address on both sites: /artists/<slug> */
    slug: { type: String, required: true, unique: true },
    /** the styles this artist works in */
    styles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Style" }],
    bio: {
      en: { type: String, default: "", trim: true, maxlength: 1200 },
      ka: { type: String, default: "", trim: true, maxlength: 1200 },
    },
    instagramUrl: { type: String, default: "" },
    photo: { type: imageSchema, default: null },
  },
  { timestamps: true }
);

export const Artist = mongoose.model("Artist", artistSchema);
