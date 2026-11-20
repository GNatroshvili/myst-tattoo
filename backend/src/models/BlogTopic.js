import mongoose from "mongoose";

/** What a blog article is about ("Tattoo care", "Studio news"), named in both of the site's languages. */
const blogTopicSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true, trim: true, maxlength: 40 },
      ka: { type: String, required: true, trim: true, maxlength: 40 },
    },
  },
  { timestamps: true }
);

export const BlogTopic = mongoose.model("BlogTopic", blogTopicSchema);
