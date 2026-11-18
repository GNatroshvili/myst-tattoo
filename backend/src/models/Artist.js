import mongoose from "mongoose";
import { imageSchema } from "./image.js";

const artistSchema = new mongoose.Schema(
  {
    nickname: { type: String, required: true, trim: true, maxlength: 60 },
    /** last part of the profile's address: /artists/<slug> */
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
