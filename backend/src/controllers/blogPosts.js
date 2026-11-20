import { BODY_MAX, BlogPost, TITLE_MAX } from "../models/BlogPost.js";
import { BlogTopic } from "../models/BlogTopic.js";
import { badRequest, isId, notFound, text } from "../utils/http.js";
import { removeImage, saveImage } from "../utils/images.js";
import * as serialize from "../utils/serialize.js";
import { uniqueSlug } from "../utils/slug.js";

/** The title in one language; it cannot be empty. */
function readTitle(value, language) {
  const title = text(value, { field: `${language} title`, max: TITLE_MAX });
  if (!title) throw badRequest("An article needs a title in both languages", "title_both_languages");
  return title;
}

const readBody = (value, language) => text(value, { field: `${language} text`, max: BODY_MAX });

/** The text may be written in one language only, but not in neither. */
function requireBody(body) {
  if (!body.ka && !body.en) {
    throw badRequest("Write the article's text in at least one language", "body_missing");
  }
}

async function readTopic(value) {
  if (!isId(value) || !(await BlogTopic.exists({ _id: value }))) {
    throw badRequest("Choose the article's topic", "bad_topic");
  }
  return value;
}

/** By id (the admin panel) or by slug (the public article page). */
async function findPost(key) {
  const post = await BlogPost.findOne(isId(key) ? { _id: key } : { slug: key });
  if (!post) throw notFound("Article not found");
  return post;
}

/** Every article, newest first. */
export async function listPosts(_req, res) {
  const posts = await BlogPost.find().sort({ createdAt: -1 }).populate("topic");
  res.json(posts.map(serialize.blogPost));
}

export async function getPost(req, res) {
  const post = await findPost(req.params.key);
  await post.populate("topic");
  res.json(serialize.blogPost(post));
}

/**
 * One article for both sites. The moment it is created is its date: the site
 * shows that date and time, and later edits do not move it.
 */
export async function createPost(req, res) {
  const title = {
    ka: readTitle(req.body.titleKa, "Georgian"),
    en: readTitle(req.body.titleEn, "English"),
  };
  const body = { ka: readBody(req.body.bodyKa, "Georgian"), en: readBody(req.body.bodyEn, "English") };
  requireBody(body);
  const topic = await readTopic(req.body.topic);
  if (!req.file) throw badRequest("Upload the article's image", "photo_required");

  // everything is valid: only now touch the disk and the database
  const slug = await uniqueSlug(title.en, (slug) => BlogPost.exists({ slug }), "article");
  const image = await saveImage(req.file.buffer);
  let post;
  try {
    post = await BlogPost.create({ title, slug, topic, body, image });
  } catch (err) {
    await removeImage(image);
    throw err;
  }
  res.status(201).json(serialize.blogPost(await post.populate("topic")));
}

/** Changes only the fields that were sent; a new image replaces the old one. */
export async function updatePost(req, res) {
  const post = await findPost(req.params.key);
  if (req.body.titleKa !== undefined) post.title.ka = readTitle(req.body.titleKa, "Georgian");
  if (req.body.titleEn !== undefined) post.title.en = readTitle(req.body.titleEn, "English");
  if (req.body.bodyKa !== undefined) post.body.ka = readBody(req.body.bodyKa, "Georgian");
  if (req.body.bodyEn !== undefined) post.body.en = readBody(req.body.bodyEn, "English");
  requireBody(post.body);
  if (req.body.topic !== undefined) post.topic = await readTopic(req.body.topic);

  // everything is valid: only now touch the disk and the database
  const oldImage = post.image;
  const newImage = req.file ? await saveImage(req.file.buffer) : null;
  if (newImage) post.image = newImage;
  try {
    await post.save();
  } catch (err) {
    await removeImage(newImage);
    throw err;
  }
  if (newImage) await removeImage(oldImage);

  res.json(serialize.blogPost(await post.populate("topic")));
}

export async function deletePost(req, res) {
  const post = await findPost(req.params.key);
  await post.deleteOne();
  await removeImage(post.image);
  res.status(204).end();
}
