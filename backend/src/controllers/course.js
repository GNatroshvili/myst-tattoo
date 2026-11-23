import { BODY_MAX, Course, PHOTOS_MAX, TITLE_MAX } from "../models/Course.js";
import { HttpError, badRequest, bilingual, notFound } from "../utils/http.js";
import { removeImage, saveImage } from "../utils/images.js";
import * as serialize from "../utils/serialize.js";

/** A photo's two files, read before the record lets go of it. */
const filesOf = (photo) => ({ full: photo.full, thumb: photo.thumb });

/** The course, or 404 while none has been posted. */
export async function getCourse(_req, res) {
  const course = await Course.findOne();
  if (!course) throw notFound("No course has been posted");
  res.json(serialize.course(course));
}

/**
 * Posts the course, or changes the one there is: its title and text, and
 * (with `photos`, a list of photo ids) which of its photos stay and in what
 * order. New photos are added one at a time with `addPhoto`. The moment the
 * course is first saved is its date; later changes do not move it.
 */
export async function saveCourse(req, res) {
  const title = bilingual(req.body.title, { field: "Title", max: TITLE_MAX });
  if (!title.en || !title.ka) {
    throw badRequest("The course needs a title in both languages", "title_both_languages");
  }
  const body = bilingual(req.body.body, { field: "Text", max: BODY_MAX });
  if (!body.en && !body.ka) {
    throw badRequest("Write the course's text in at least one language", "course_body_missing");
  }

  const course = (await Course.findOne()) ?? new Course();
  let dropped = [];
  if (req.body.photos !== undefined) {
    const ids = req.body.photos;
    const own = new Map(course.photos.map((photo) => [String(photo._id), photo]));
    const valid =
      Array.isArray(ids) && new Set(ids).size === ids.length && ids.every((id) => typeof id === "string" && own.has(id));
    if (!valid) throw badRequest("photos must list the course's own photos, each once", "bad_photos");
    dropped = course.photos.filter((photo) => !ids.includes(String(photo._id))).map(filesOf);
    course.photos = ids.map((id) => own.get(id));
  }
  course.title = title;
  course.body = body;

  const created = course.isNew;
  await course.save();
  // only now that the record no longer points at them
  await Promise.all(dropped.map(removeImage));
  res.status(created ? 201 : 200).json(serialize.course(course));
}

/** Adds one photo to the end of the course's photos. */
export async function addPhoto(req, res) {
  const course = await Course.findOne();
  if (!course) throw badRequest("Save the course's title and text first", "course_missing");
  if (course.photos.length >= PHOTOS_MAX) {
    throw new HttpError(409, `A course has at most ${PHOTOS_MAX} photos`, "too_many_photos", { max: PHOTOS_MAX });
  }
  if (!req.file) throw badRequest("Choose a photo", "photo_missing");

  const image = await saveImage(req.file.buffer);
  course.photos.push(image);
  try {
    await course.save();
  } catch (err) {
    await removeImage(image);
    throw err;
  }
  res.status(201).json(serialize.course(course));
}

/** Takes the course off the site, with its photos. */
export async function deleteCourse(_req, res) {
  const course = await Course.findOne();
  if (!course) throw notFound("No course has been posted");
  await course.deleteOne();
  await Promise.all(course.photos.map((photo) => removeImage(filesOf(photo))));
  res.status(204).end();
}
