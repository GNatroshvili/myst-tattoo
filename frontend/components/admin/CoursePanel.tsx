"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { postDate } from "@/lib/blog";
import type { Course, CoursePhoto } from "@/lib/types";
import type { PanelProps } from "./AdminApp";
import { api, form, json } from "./api";
import { shrinkPhoto } from "./shrink";
import { Card, CardTitle, ConfirmDelete, Hint, Notice, PHOTO_TYPES, Thumb } from "./ui";

/** the backend's limits (backend/src/models/Course.js) */
const TITLE_MAX = 140;
const BODY_MAX = 20000;
const PHOTOS_MAX = 4;

/** A photo in the form: one the course already has, or one picked and not yet uploaded. */
type Item =
  | { key: string; saved: CoursePhoto }
  | { key: string; file: File; preview: string };

type FormProps = Pick<PanelProps, "reload" | "explain"> & {
  /** the course as it is posted, or null while there is none */
  course: Course | null;
  /** how the last save went, shown above the button; the panel keeps it while the form is filled in afresh */
  outcome: Outcome | null;
  onOutcome: (outcome: Outcome | null) => void;
};

type Outcome = { kind: "error" | "ok"; text: string };

/**
 * The course's title, text and photos in one form. There is one course for
 * both sites: the title is filled in in Georgian and in English, the text in
 * at least one of them, and the photos are shared. The date is not a field:
 * it is the moment the course is first saved.
 */
function CourseForm({ course, reload, explain, outcome, onOutcome }: FormProps) {
  const [titleKa, setTitleKa] = useState(course?.title.ka ?? "");
  const [titleEn, setTitleEn] = useState(course?.title.en ?? "");
  const [bodyKa, setBodyKa] = useState(course?.body.ka ?? "");
  const [bodyEn, setBodyEn] = useState(course?.body.en ?? "");
  const [items, setItems] = useState<Item[]>(() =>
    (course?.photos ?? []).map((photo) => ({ key: photo.id, saved: photo }))
  );
  const [busy, setBusy] = useState(false);
  const room = PHOTOS_MAX - items.length;

  // The previews of picked photos are temporary addresses: given back when the form goes away.
  const previews = useRef(new Set<string>());
  useEffect(() => {
    const made = previews.current;
    return () => made.forEach((address) => URL.revokeObjectURL(address));
  }, []);

  /** Picked files join the end of the row, as many as there is room for. */
  function pick(files: FileList | null) {
    const added = Array.from(files ?? [])
      .slice(0, room)
      .map((file) => {
        const preview = URL.createObjectURL(file);
        previews.current.add(preview);
        return { key: preview, file, preview };
      });
    setItems((list) => [...list, ...added]);
  }

  /** Swaps a photo with its neighbour: `by` is -1 for earlier, 1 for later. */
  function move(index: number, by: -1 | 1) {
    setItems((list) => {
      const next = [...list];
      [next[index], next[index + by]] = [next[index + by], next[index]];
      return next;
    });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!bodyKa.trim() && !bodyEn.trim()) {
      onOutcome({ kind: "error", text: "კურსის ტექსტი ერთ ენაზე მაინც დაწერე." });
      return;
    }
    setBusy(true);
    onOutcome(null);

    try {
      // 1. the title and text, and which of the photos it already has stay
      const kept = items.flatMap((item) => ("saved" in item ? [item.saved.id] : []));
      let saved = await api<Course>(
        "/course",
        json("PUT", {
          title: { ka: titleKa, en: titleEn },
          body: { ka: bodyKa, en: bodyEn },
          ...(course ? { photos: kept } : {}),
        })
      );

      // 2. the new photos, one request each: a host may refuse several in one
      const ids = new Map<string, string>();
      for (const item of items) {
        if (!("file" in item)) continue;
        const had = new Set(saved.photos.map((photo) => photo.id));
        const body = new FormData();
        body.set("photo", await shrinkPhoto(item.file));
        saved = await api<Course>("/course/photos", form("POST", body));
        const added = saved.photos.find((photo) => !had.has(photo.id));
        if (added) ids.set(item.key, added.id);
      }

      // 3. the order, if the new photos do not all belong at the end
      const wanted = items.flatMap((item) => ("saved" in item ? [item.saved.id] : (ids.get(item.key) ?? [])));
      if (wanted.join() !== saved.photos.map((photo) => photo.id).join()) {
        await api<Course>(
          "/course",
          json("PUT", { title: saved.title, body: saved.body, photos: wanted })
        );
      }

      await reload();
      onOutcome({
        kind: "ok",
        text: course ? "ცვლილებები შენახულია." : "კურსი გამოქვეყნდა და ჩანს საიტის ორივე ენაზე.",
      });
    } catch (err) {
      // Part of it may be saved already (the text, some of the photos): the
      // form is then filled in again from what the backend now has.
      const text = explain(err);
      await reload();
      onOutcome({ kind: "error", text });
    }
    setBusy(false);
  }

  return (
    <form onSubmit={save} className="mt-5 flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="field-label mb-2">სათაური ქართულად *</span>
          <input
            required
            maxLength={TITLE_MAX}
            value={titleKa}
            onChange={(e) => setTitleKa(e.target.value)}
            placeholder="მაგ.: ტატუს კურსი დამწყებთათვის"
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
            placeholder="e.g. Tattoo course for beginners"
            className="field h-[46px] px-3.5"
          />
        </label>
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
          აქ დეტალურად აღწერე კურსი: ვისთვისაა, რას მოიცავს, რამდენ ხანს გრძელდება, რა ღირს. ახალი
          აბზაცისთვის გამოტოვე ცარიელი ხაზი. ერთ ენაზე მაინც აუცილებელია; თუ მხოლოდ ერთზე დაწერ, საიტის
          ორივე ვერსიაზე ის გამოჩნდება.
        </Hint>
      </div>

      <div>
        <span className="field-label mb-2">
          ფოტოები <span className="font-light text-muted">({items.length} / {PHOTOS_MAX})</span>
        </span>
        {items.length > 0 && (
          <ul className="mb-3 flex flex-wrap gap-3.5">
            {items.map((item, i) => (
              <li key={item.key} className="w-[168px]">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] border border-cream/16 bg-ink">
                  {"saved" in item ? (
                    <Thumb photo={item.saved} />
                  ) : (
                    <Image src={item.preview} alt="" fill unoptimized className="object-cover" />
                  )}
                  {i === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-gold px-2.5 py-0.5 text-[12px] font-medium leading-5 text-on-gold">
                      მთავარი
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label={`ფოტო ${i + 1}: წინ გადატანა`}
                    disabled={busy || i === 0}
                    onClick={() => move(i, -1)}
                    className="btn btn-outline h-9 w-9 p-0 text-[15px] disabled:opacity-35"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    aria-label={`ფოტო ${i + 1}: უკან გადატანა`}
                    disabled={busy || i === items.length - 1}
                    onClick={() => move(i, 1)}
                    className="btn btn-outline h-9 w-9 p-0 text-[15px] disabled:opacity-35"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    aria-label={`ფოტო ${i + 1}: მოშორება`}
                    disabled={busy}
                    onClick={() => setItems((list) => list.filter((other) => other.key !== item.key))}
                    className="btn h-9 flex-1 border border-[#e0707a]/55 px-0 text-[13.5px] text-[#f5b3b9] hover:border-[#e0707a] hover:bg-[#e0707a]/10"
                  >
                    მოშორება
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {room > 0 && (
          <input
            // a fresh picker after each pick, so the same file can be picked again
            key={items.length}
            type="file"
            aria-label="კურსის ფოტოების დამატება"
            accept={PHOTO_TYPES}
            multiple
            disabled={busy}
            onChange={(e) => pick(e.target.files)}
            className="field px-3.5 py-2.5 file:mr-3.5 file:rounded-full file:border-0 file:bg-raised file:px-4 file:py-1.5 file:text-cream sm:max-w-[420px]"
          />
        )}
        <Hint className="mt-2">
          JPEG, PNG, WebP ან AVIF, სულ {PHOTOS_MAX}-მდე; 3–4 ფოტო საუკეთესოდ ჩანს. პირველი ფოტო („მთავარი“)
          გვერდზე ყველაზე დიდია; რიგს ისრებით ცვლი. ჩარჩოები ფოტოს კიდეებს ჭრის, ამიტომ მთავარი საგანი
          შუაში უნდა იყოს. ცვლილებები ძალაში „შენახვის“ შემდეგ შედის.
        </Hint>
      </div>

      {outcome && <Notice kind={outcome.kind}>{outcome.text}</Notice>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className="btn btn-gold disabled:opacity-60">
          {busy ? "ინახება…" : course ? "შენახვა" : "კურსის გამოქვეყნება"}
        </button>
      </div>
    </form>
  );
}

/** The tattoo course: the one record the site's /course page shows. */
export function CoursePanel({ course, reload, explain }: PanelProps) {
  /** how deleting went (shown by its button, at the top) and how saving went (by its button, at the bottom) */
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Outcome | null>(null);
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    setError("");
    setDone("");
    setSaved(null);
    try {
      await api("/course", { method: "DELETE" });
      await reload();
      setDone("კურსი წაიშალა. საიტის გვერდზე ახლა წერია, რომ კურსი მალე დაემატება.");
    } catch (err) {
      setError(explain(err));
    }
    setBusy(false);
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle>ტატუს კურსი</CardTitle>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/ka/course" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
            გვერდის ნახვა
          </Link>
          {course && <ConfirmDelete disabled={busy} onConfirm={() => void remove()} label="კურსის წაშლა" />}
        </div>
      </div>
      <Hint className="mt-2">
        {course
          ? `გამოქვეყნდა: ${postDate(course.createdAt, "ka")}. ეს თარიღი ჩანს საიტზე და რედაქტირებისას არ იცვლება. ახალი კურსის ახალი თარიღით გამოსაქვეყნებლად ჯერ ეს წაშალე.`
          : "კურსი ჯერ არ არის გამოქვეყნებული: საიტის „კურსი“ გვერდზე წერია, რომ მალე დაემატება. თარიღად ის დღე ჩაიწერება, როცა კურსს გამოაქვეყნებ."}
      </Hint>

      {(done || error) && (
        <div className="mt-4">
          <Notice kind={error ? "error" : "ok"}>{error || done}</Notice>
        </div>
      )}

      <CourseForm
        // filled in afresh whenever the backend's copy changes
        key={course?.updatedAt ?? "new"}
        course={course}
        reload={reload}
        explain={explain}
        outcome={saved}
        onOutcome={(outcome) => {
          setError("");
          setDone("");
          setSaved(outcome);
        }}
      />
    </Card>
  );
}
