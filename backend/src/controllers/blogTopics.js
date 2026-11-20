import { BlogPost } from "../models/BlogPost.js";
import { BlogTopic } from "../models/BlogTopic.js";
import { HttpError, bilingual, isId, notFound } from "../utils/http.js";
import * as serialize from "../utils/serialize.js";

const readName = (body) => bilingual(body?.name, { field: "Topic name", max: 40, required: true });

async function findTopic(id) {
  const topic = isId(id) ? await BlogTopic.findById(id) : null;
  if (!topic) throw notFound("Topic not found");
  return topic;
}

/** Every topic, in the order they were added, each with how many articles it has. */
export async function listTopics(_req, res) {
  const [topics, counts] = await Promise.all([
    BlogTopic.find().sort({ createdAt: 1 }),
    BlogPost.aggregate([{ $group: { _id: "$topic", n: { $sum: 1 } } }]),
  ]);
  const posts = new Map(counts.map((c) => [String(c._id), c.n]));
  res.json(topics.map((t) => serialize.blogTopic(t, { postCount: posts.get(String(t._id)) ?? 0 })));
}

export async function createTopic(req, res) {
  const topic = await BlogTopic.create({ name: readName(req.body) });
  res.status(201).json(serialize.blogTopic(topic, { postCount: 0 }));
}

export async function updateTopic(req, res) {
  const topic = await findTopic(req.params.id);
  topic.name = readName(req.body);
  await topic.save();
  res.json(serialize.blogTopic(topic));
}

/** A topic that articles still use cannot be deleted. */
export async function deleteTopic(req, res) {
  const topic = await findTopic(req.params.id);
  const inUse = await BlogPost.countDocuments({ topic: topic._id });
  if (inUse > 0) {
    throw new HttpError(
      409,
      `This topic is used by ${inUse} article(s). Change their topic first.`,
      "topic_in_use",
      { posts: inUse }
    );
  }
  await topic.deleteOne();
  res.status(204).end();
}
