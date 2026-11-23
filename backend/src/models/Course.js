import mongoose from "mongoose";

/** The longest the course's text may be, in characters, in each language. */
export const BODY_MAX = 20000;
export const TITLE_MAX = 140;
/** How many photos the course page shows at most. */
export const PHOTOS_MAX = 4;

/**
 * One of the course's photos: its two files and its size, as in image.js, but
 * with an id of its own, so the admin panel can say which to keep and in what
 * order.
 */
const photoSchema = new mongoose.Schema({
  full: { type: String, required: true },
  thumb: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
});

/**
 * The studio's tattoo course, as the site's /course page shows it. There is
 * one record at most, and it serves both sites: the title is kept in both
 * languages, and the text in at least one (a site without its own shows the
 * other). `createdAt` is the moment the course was posted, which the page
 * shows; deleting the course and adding a new one starts a new date.
 */
const courseSchema = new mongoose.Schema(
  {
    /** the same in the only record there may be: a second one cannot be saved */
    key: { type: String, default: "course", unique: true, immutable: true },
    title: {
      en: { type: String, required: true, trim: true, maxlength: TITLE_MAX },
      ka: { type: String, required: true, trim: true, maxlength: TITLE_MAX },
    },
    /** what the course is; paragraphs are separated by an empty line */
    body: {
      en: { type: String, default: "", trim: true, maxlength: BODY_MAX },
      ka: { type: String, default: "", trim: true, maxlength: BODY_MAX },
    },
    /** in the order the page shows them: the first is the large one */
    photos: {
      type: [photoSchema],
      default: [],
      validate: [(photos) => photos.length <= PHOTOS_MAX, `A course has at most ${PHOTOS_MAX} photos`],
    },
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
