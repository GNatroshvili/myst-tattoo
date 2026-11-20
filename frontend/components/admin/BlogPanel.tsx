"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { postDate } from "@/lib/blog";
import type { BlogPost, BlogTopic } from "@/lib/types";
import { ImageIcon } from "../ui/Icons";
import type { PanelProps } from "./AdminApp";
import { api, form, json } from "./api";
import { shrinkPhoto } from "./shrink";
import { Card, CardTitle, ConfirmDelete, Hint, Notice, PHOTO_TYPES, Select, Thumb, usePreview } from "./ui";

/** the backend's limits (backend/src/models/BlogPost.js) */
const TITLE_MAX = 140;
const BODY_MAX = 20000;

/** what the topic field holds while a new topic is being named in the article's form */
const NEW_TOPIC = "new";

type Tools = Pick<PanelProps, "reload" | "explain">;

/** One topic: its two names, editable in place. */
function TopicRow({ topic, reload, explain }: { topic: BlogTopic } & Tools) {
  const [ka, setKa] = useState(topic.name.ka);
  const [en, setEn] = useState(topic.name.en);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const changed = ka.trim() !== topic.name.ka || en.trim() !== topic.name.en;

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await action();
      await reload();
    } catch (err) {
      setError(explain(err));
    }
    setBusy(false);
  }

  return (
    <li className="border-b border-cream/12 py-3.5 last:border-b-0">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void run(() => api(`/blog/topics/${topic.id}`, json("PATCH", { name: { ka, en } })));
        }}
        className="flex flex-wrap items-center gap-2.5"
      >
        <input
          aria-label="თემა ქართულად"
          required
          maxLength={40}
          value={ka}
          onChange={(e) => setKa(e.target.value)}
          className="field h-[46px] min-w-[150px] flex-1 px-3.5"
        />
        <input
          aria-label="თემა ინგლისურად"
          required
          maxLength={40}
          value={en}
          onChange={(e) => setEn(e.target.value)}
          className="field h-[46px] min-w-[150px] flex-1 px-3.5"
        />
        <span className="w-[86px] text-[13.5px] leading-5 text-muted">{topic.postCount ?? 0} სტატია</span>
        <button type="submit" disabled={busy || !changed} className="btn btn-outline btn-sm disabled:opacity-40">
          შენახვა
        </button>
        <ConfirmDelete
          disabled={busy}
          onConfirm={() => void run(() => api(`/blog/topics/${topic.id}`, { method: "DELETE" }))}
        />
      </form>
      {error && (
        <div className="mt-2.5">
          <Notice kind="error">{error}</Notice>
        </div>
      )}
    </li>
  );
}

/** The topics articles are filed under: add one, rename, delete. */
function TopicsCard({ topics, reload, explain }: { topics: BlogTopic[] } & Tools) {
  const [ka, setKa] = useState("");
  const [en, setEn] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function add(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/blog/topics", json("POST", { name: { ka, en } }));
      setKa("");
      setEn("");
      await reload();
    } catch (err) {
      setError(explain(err));
    }
    setBusy(false);
  }

  return (
    <Card>
      <CardTitle>თემები</CardTitle>
      <Hint className="mt-1.5">
        თემა გვიჩვენებს, რას ეხება სტატია — მაგალითად „ტატუს მოვლა“ ან „სტუდიის სიახლეები“. ბლოგის
        გვერდზე სტატიები თემების მიხედვით იფილტრება. ახალი თემის შექმნა სტატიის ფორმიდანაც შეიძლება;
        აქ კი თემას დაამატებ, გადაარქმევ ან წაშლი. სახელი ორივე ენაზე ჩაწერე.
      </Hint>
      <form onSubmit={add} className="mt-4 flex flex-wrap items-end gap-2.5">
        <label className="min-w-[150px] flex-1">
          <span className="field-label mb-2">ქართულად</span>
          <input
            required
            maxLength={40}
            value={ka}
            onChange={(e) => setKa(e.target.value)}
            placeholder="მაგ.: ტატუს მოვლა"
            className="field h-[46px] px-3.5"
          />
        </label>
        <label className="min-w-[150px] flex-1">
          <span className="field-label mb-2">ინგლისურად</span>
          <input
            required
            maxLength={40}
            value={en}
            onChange={(e) => setEn(e.target.value)}
            placeholder="e.g. Tattoo care"
            className="field h-[46px] px-3.5"
          />
        </label>
        <button type="submit" disabled={busy} className="btn btn-gold disabled:opacity-60">
          თემის დამატება
        </button>
      </form>
      {error && (
        <div className="mt-3">
          <Notice kind="error">{error}</Notice>
        </div>
      )}

      {topics.length > 0 && (
        <ul className="mt-3">
          {/* the key includes the names, so a row starts afresh once its change is saved */}
          {topics.map((topic) => (
            <TopicRow
              key={`${topic.id}:${topic.name.ka}:${topic.name.en}`}
              topic={topic}
              reload={reload}
              explain={explain}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}

type FormProps = Tools & {
  /** the article being edited, or null for a new one */
  post: BlogPost | null;
  topics: BlogTopic[];
  onDone: (message: string) => void;
  onCancel: () => void;
};

/**
 * Add or edit an article. There is one article for both sites: the title is
 * filled in in Georgian and in English, the text in at least one of them, and
 * the image and the topic are shared. The topic is picked from the existing
 * ones or named on the spot, in both languages, and created with the article.
 * The date is not a field: it is the moment the article is added.
 */
function PostForm({ post, topics, reload, explain, onDone, onCancel }: FormProps) {
  const [titleKa, setTitleKa] = useState(post?.title.ka ?? "");
  const [titleEn, setTitleEn] = useState(post?.title.en ?? "");
  /** a topic's id, NEW_TOPIC while a new one is being named, or "" before anything is picked */
  const [topic, setTopic] = useState(post?.topic?.id ?? (topics.length === 0 ? NEW_TOPIC : ""));
  const [newTopicKa, setNewTopicKa] = useState("");
  const [newTopicEn, setNewTopicEn] = useState("");
  const [bodyKa, setBodyKa] = useState(post?.body.ka ?? "");
  const [bodyEn, setBodyEn] = useState(post?.body.en ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const preview = usePreview(photo);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!bodyKa.trim() && !bodyEn.trim()) {
      setError("სტატიის ტექსტი ერთ ენაზე მაინც დაწერე.");
      return;
    }
    setBusy(true);
    setError("");

    try {
      // A new topic is created first, then the article is filed under it. One
      // with the same name is used as it is rather than added a second time.
      let topicId = topic;
      if (topic === NEW_TOPIC) {
        const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
        const existing = topics.find((t) => same(t.name.ka, newTopicKa) || same(t.name.en, newTopicEn));
        topicId =
          existing?.id ??
          (await api<BlogTopic>("/blog/topics", json("POST", { name: { ka: newTopicKa, en: newTopicEn } }))).id;
        // the list now has it: if the article fails below, trying again must not add it twice
        await reload();
        setTopic(topicId);
        setNewTopicKa("");
        setNewTopicEn("");
      }

      const body = new FormData();
      body.set("titleKa", titleKa);
      body.set("titleEn", titleEn);
      body.set("topic", topicId);
      body.set("bodyKa", bodyKa);
      body.set("bodyEn", bodyEn);
      if (photo) body.set("photo", await shrinkPhoto(photo));
      await api(post ? `/blog/posts/${post.id}` : "/blog/posts", form(post ? "PATCH" : "POST", body));
      await reload();
      onDone(post ? "ცვლილებები შენახულია." : "სტატია დაემატა და ჩანს საიტის ორივე ენაზე.");
    } catch (err) {
      setError(explain(err));
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardTitle>{post ? `რედაქტირება: ${post.title.ka}` : "ახალი სტატია"}</CardTitle>
      <Hint className="mt-1.5">
        {post
          ? `დაემატა: ${postDate(post.createdAt, "ka")}. ეს თარიღი და დრო ჩანს საიტზე და რედაქტირებისას არ იცვლება.`
          : "სტატიის თარიღად და დროდ ის წუთი ჩაიწერება, როცა „შენახვას“ დააჭერ — საიტზე სწორედ ის გამოჩნდება."}
      </Hint>

      <form onSubmit={save} className="mt-5 flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="field-label mb-2">სათაური ქართულად *</span>
            <input
              required
              maxLength={TITLE_MAX}
              value={titleKa}
              onChange={(e) => setTitleKa(e.target.value)}
              placeholder="მაგ.: როგორ მოვუაროთ ახალ ტატუს"
              className="field h-[46px] px-3.5"
            />
          </label>
          <label>
            <span className="field-label mb-2">სათაური ინგლისურად *</span>
            <input
              required
              maxLength={TITLE_MAX}
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="e.g. How to care for a new tattoo"
              className="field h-[46px] px-3.5"
            />
          </label>
        </div>

        <div>
          <label className="block sm:max-w-[360px]">
            <span className="field-label mb-2">თემა *</span>
            <Select required value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value="" disabled>
                აირჩიე თემა
              </option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name.ka} / {t.name.en}
                </option>
              ))}
              <option value={NEW_TOPIC}>+ ახალი თემა…</option>
            </Select>
          </label>

          {topic === NEW_TOPIC ? (
            <div className="mt-3 grid gap-4 rounded-[12px] border border-cream/16 p-4 sm:grid-cols-2">
              <label>
                <span className="field-label mb-2">ახალი თემა ქართულად *</span>
                <input
                  required
                  maxLength={40}
                  value={newTopicKa}
                  onChange={(e) => setNewTopicKa(e.target.value)}
                  placeholder="მაგ.: ტატუს მოვლა"
                  className="field h-[46px] px-3.5"
                />
              </label>
              <label>
                <span className="field-label mb-2">ახალი თემა ინგლისურად *</span>
                <input
                  required
                  maxLength={40}
                  value={newTopicEn}
                  onChange={(e) => setNewTopicEn(e.target.value)}
                  placeholder="e.g. Tattoo care"
                  className="field h-[46px] px-3.5"
                />
              </label>
              <Hint className="sm:col-span-2">
                თემა სტატიასთან ერთად შეიქმნება, როცა „შენახვას“ დააჭერ, და შემდეგ სტატიებისთვისაც სიაში
                გამოჩნდება.
              </Hint>
            </div>
          ) : (
            <Hint className="mt-2">
              აირჩიე უკვე არსებული თემა, ან სიის ბოლოს „+ ახალი თემა…“ — და იქვე ჩაწერ მის სახელს ორივე
              ენაზე.
            </Hint>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label>
            <span className="field-label mb-2">ტექსტი ქართულად</span>
            <textarea
              rows={14}
              maxLength={BODY_MAX}
              value={bodyKa}
              onChange={(e) => setBodyKa(e.target.value)}
              className="field px-3.5 py-3 font-light leading-[22px]"
            />
          </label>
          <label>
            <span className="field-label mb-2">ტექსტი ინგლისურად</span>
            <textarea
              rows={14}
              maxLength={BODY_MAX}
              value={bodyEn}
              onChange={(e) => setBodyEn(e.target.value)}
              className="field px-3.5 py-3 font-light leading-[22px]"
            />
          </label>
          <Hint className="lg:col-span-2">
            ეს არის თვითონ სტატია — ის, რასაც მკითხველი წაიკითხავს. ახალი აბზაცისთვის გამოტოვე ცარიელი
            ხაზი. ერთ ენაზე მაინც აუცილებელია; თუ მხოლოდ ერთზე დაწერ, საიტის ორივე ვერსიაზე ის
            გამოჩნდება. ბლოგის გვერდის ბარათზე ტექსტის დასაწყისი ჩანს.
          </Hint>
        </div>

        <div>
          <span className="field-label mb-2">სურათი {post ? "" : "*"}</span>
          <div className="flex flex-wrap items-start gap-4">
            <div className="relative flex aspect-[4/3] w-[200px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-cream/16 bg-ink">
              {preview ? (
                <Image src={preview} alt="" fill unoptimized className="object-cover" />
              ) : post ? (
                <Thumb photo={post.image} />
              ) : (
                <ImageIcon className="h-9 w-9 text-rose" />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <input
                type="file"
                aria-label="სტატიის სურათი"
                accept={PHOTO_TYPES}
                required={!post}
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                className="field px-3.5 py-2.5 file:mr-3.5 file:rounded-full file:border-0 file:bg-raised file:px-4 file:py-1.5 file:text-cream"
              />
              <Hint>
                JPEG, PNG, WebP ან AVIF. საუკეთესოა ჰორიზონტალური სურათი: ბარათზე ის 4:3 ფორმით ჩანს,
                სტატიის გვერდზე — 16:9 ფორმით, კიდეები იჭრება.
                {post ? " ახალს თუ აირჩევ, ძველი ჩანაცვლდება." : ""}
              </Hint>
            </div>
          </div>
        </div>

        {error && <Notice kind="error">{error}</Notice>}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className="btn btn-gold disabled:opacity-60">
            {busy ? "ინახება…" : "შენახვა"}
          </button>
          <button type="button" onClick={onCancel} disabled={busy} className="btn btn-outline">
            გაუქმება
          </button>
        </div>
      </form>
    </Card>
  );
}

/** The blog: its topics, the list of articles, and the form for adding or editing one. */
export function BlogPanel({ posts, topics, reload, explain }: PanelProps) {
  /** which article the form is open for: an id, "new", or null for the list */
  const [editing, setEditing] = useState<string | null>(null);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function remove(post: BlogPost) {
    setBusy(true);
    setError("");
    setDone("");
    try {
      await api(`/blog/posts/${post.id}`, { method: "DELETE" });
      await reload();
      setDone(`„${post.title.ka}“ წაიშალა.`);
    } catch (err) {
      setError(explain(err));
    }
    setBusy(false);
  }

  if (editing) {
    return (
      <PostForm
        // a fresh form for each article
        key={editing}
        post={posts.find((p) => p.id === editing) ?? null}
        topics={topics}
        reload={reload}
        explain={explain}
        onDone={(message) => {
          setDone(message);
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>სტატიები</CardTitle>
          <button
            type="button"
            onClick={() => {
              setDone("");
              setError("");
              setEditing("new");
            }}
            className="btn btn-gold btn-sm"
          >
            + სტატიის დამატება
          </button>
        </div>
        <Hint className="mt-2">
          სტატიის დამატებისას თემას ირჩევ არსებულებიდან ან იქვე ქმნი ახალს, ორივე ენაზე. არსებული
          თემების სია ქვემოთ, „თემები“ ბლოკშია: იქ შეგიძლია დაამატო, გადაარქვა ან წაშალო.
        </Hint>

        {(done || error) && (
          <div className="mt-4">
            <Notice kind={error ? "error" : "ok"}>{error || done}</Notice>
          </div>
        )}

        {posts.length === 0 ? (
          <Hint className="mt-3">სტატიები ჯერ არ არის დამატებული.</Hint>
        ) : (
          <ul className="mt-2">
            {posts.map((post) => (
              <li
                key={post.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-cream/12 py-4 last:border-b-0"
              >
                <div className="relative aspect-[4/3] w-[104px] shrink-0 overflow-hidden rounded-[10px] bg-ink">
                  <Thumb photo={post.image} />
                </div>
                <div className="min-w-0 flex-[1_1_260px]">
                  <p className="break-words text-[17px] font-medium leading-6 text-cream">{post.title.ka}</p>
                  <p className="break-words text-[14px] leading-5 text-body">{post.title.en}</p>
                  <p className="mt-1 text-[13.5px] leading-5 text-muted">
                    {post.topic?.name.ka ?? "თემის გარეშე"} · {postDate(post.createdAt, "ka")}
                    {!post.body.ka && " · მხოლოდ ინგლისურად"}
                    {!post.body.en && " · მხოლოდ ქართულად"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    href={`/ka/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    ნახვა
                  </Link>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setDone("");
                      setError("");
                      setEditing(post.id);
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    რედაქტირება
                  </button>
                  <ConfirmDelete disabled={busy} onConfirm={() => void remove(post)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <TopicsCard topics={topics} reload={reload} explain={explain} />
    </div>
  );
}
