/**
 * Blog articles, as drawn in the design: one featured article and six more,
 * all still placeholders. The titles, excerpts and dates a visitor reads come
 * from the dictionaries' `blog` section until the real ones are added here.
 */

/** Article topics; each key picks its label from the dictionary's `blog.topics`. */
export const blogTopics = ["aftercare", "tattoo", "piercing", "studioNews"] as const;
export type BlogTopic = (typeof blogTopics)[number];

export type Post = {
  /** last part of the article's address: /blog/<id> */
  id: string;
  topic: BlogTopic;
};

/** The article shown large above the list. */
export const featuredPost = { id: "featured" };

export const posts: Post[] = [
  { id: "post-1", topic: "aftercare" },
  { id: "post-2", topic: "tattoo" },
  { id: "post-3", topic: "piercing" },
  { id: "post-4", topic: "studioNews" },
  { id: "post-5", topic: "aftercare" },
  { id: "post-6", topic: "tattoo" },
];

/** Every article that has a page of its own at /blog/<id>. */
export const articleIds = [featuredPost.id, ...posts.map((post) => post.id)];
