import mongoose from "mongoose";
import { imageSchema } from "./image.js";

const tattooSchema = new mongoose.Schema(
  {
    image: { type: imageSchema, required: true },
    style: { type: mongoose.Schema.Types.ObjectId, ref: "Style", required: true },
    /** who tattooed it; empty until the tattoo is attached to an artist */
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", default: null, index: true },
    /** picked in the admin panel for the home page's "Featured projects" */
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Tattoo = mongoose.model("Tattoo", tattooSchema);
