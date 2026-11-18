import mongoose from "mongoose";

/** A stored photo: its two files in the uploads folder and its size in pixels. */
export const imageSchema = new mongoose.Schema(
  {
    full: { type: String, required: true },
    thumb: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false }
);
