"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import type { AboutSection } from "@/lib/types";
import { ImageIcon } from "../ui/Icons";
import type { PanelProps } from "./AdminApp";
import { api, form, json } from "./api";
import { shrinkPhoto } from "./shrink";
import { Card, CardTitle, ConfirmDelete, Hint, Notice, PHOTO_TYPES, Thumb, usePreview } from "./ui";

type Actions = Pick<PanelProps, "reload" | "explain">;

/** the backend's limits (backend/src/models/AboutSection.js) */
const TITLE_MAX = 140;
const BODY_MAX = 5000;

const NO_TEXT = "სექციის ტექსტი ერთ ენაზე მაინც დაწერე.";

type Texts = { titleKa: string; titleEn: string; bodyKa: string; bodyEn: string };

const blank: Texts = { titleKa: "", titleEn: "", bodyKa: "", bodyEn: "" };

/** A section as the API takes it: its texts, and its photo when one was picked. */
async function body(texts: Texts, photo: File | null) {
  const data = new FormData();
  data.set("titleKa", texts.titleKa);
  data.set("titleEn", texts.titleEn);
  data.set("bodyKa", texts.bodyKa);
  data.set("bodyEn", texts.bodyEn);
  if (photo) data.set("photo", await shrinkPhoto(photo));
  return data;
}

type FieldsProps = {
  value: Texts;
  onChange: (value: Texts) => void;
  photo: File | null;
  onPhoto: (photo: File | null) => void;
  /** the section being changed; none while a new one is filled in, and then a photo is required */
  section?: AboutSection;
};

/** A section's fields: its photo, and its title and text in Georgian and in English. */
function Fields({ value, onChange, photo, onPhoto, section }: FieldsProps) {
  const set = (key: keyof Texts) => (text: string) => onChange({ ...value, [key]: text });
  const preview = usePreview(photo);

  return (
    <>
      <div>
        <span className="field-label mb-2">ფოტო {section ? "" : "*"}</span>
        <div className="flex flex-wrap items-start gap-4">
          <div className="relative flex aspect-[5/4] w-[200px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-cream/16 bg-ink">
            {preview ? (
              <Image src={preview} alt="" fill unoptimized className="object-cover" />
            ) : section ? (
              <Thumb photo={section.image} />
            ) : (
              <ImageIcon className="h-9 w-9 text-rose" />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <input
              type="file"
              aria-label="სექციის ფოტო"
              accept={PHOTO_TYPES}
              required={!section}
              onChange={(e) => onPhoto(e.target.files?.[0] ?? null)}
              className="field px-3.5 py-2.5 file:mr-3.5 file:rounded-full file:border-0 file:bg-raised file:px-4 file:py-1.5 file:text-cream"
            />
            <Hint>
              JPEG, PNG, WebP ან AVIF. გვერდზე ფოტო ჩარჩოში ჩანს და კიდეები იჭრება: კომპიუტერზე თითქმის
              კვადრატული ფორმით (5:4), ტელეფონზე 4:3 ფორმით. მთავარი საგანი შუაში უნდა იყოს.
              {section ? " ახალს თუ აირჩევ, ძველი ჩანაცვლდება." : ""}
            </Hint>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="field-label mb-2">
            სათაური ქართულად <span className="font-light text-muted">(არასავალდებულო)</span>
          </span>
          <input
            maxLength={TITLE_MAX}
            value={value.titleKa}
            onChange={(e) => set("titleKa")(e.target.value)}
            placeholder="მაგ.: ჩვენი სტუდია"
            className="field h-[46px] px-3.5"
          />
        </label>
        <label>
          <span className="field-label mb-2">
            სათაური ინგლისურად <span className="font-light text-muted">(არასავალდებულო)</span>
          </span>
          <input
            maxLength={TITLE_MAX}
            value={value.titleEn}
            onChange={(e) => set("titleEn")(e.target.value)}
            placeholder="e.g. Our studio"
            className="field h-[46px] px-3.5"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="field-label mb-2">ტექსტი ქართულად</span>
          <textarea
            rows={8}
            maxLength={BODY_MAX}
            value={value.bodyKa}
            onChange={(e) => set("bodyKa")(e.target.value)}
            className="field px-3.5 py-3 font-light leading-[22px]"
          />
        </label>
        <label>
          <span className="field-label mb-2">ტექსტი ინგლისურად</span>
          <textarea
            rows={8}
            maxLength={BODY_MAX}
            value={value.bodyEn}
            onChange={(e) => set("bodyEn")(e.target.value)}
            className="field px-3.5 py-3 font-light leading-[22px]"
          />
        </label>
        <Hint className="sm:col-span-2">
          ახალი აბზაცისთვის გამოტოვე ცარიელი ხაზი. ტექსტი ერთ ენაზე მაინც აუცილებელია; თუ მხოლოდ ერთზე
          დაწერ, საიტის ორივე ვერსიაზე ის გამოჩნდება. სათაურიც ასეა: თუ მხოლოდ ერთ ენაზე ჩაწერ, ორივე
          ვერსიაზე ის გამოჩნდება, ხოლო თუ ორივეს ცარიელს დატოვებ, სექცია სათაურის გარეშე იქნება.
        </Hint>
      </div>
    </>
  );
}

/** The form a section is changed in; it opens in the section's place in the list. */
function SectionEditor({ section, onClose, reload, explain }: { section: AboutSection; onClose: () => void } & Actions) {
  const [texts, setTexts] = useState<Texts>({
    titleKa: section.title.ka,
    titleEn: section.title.en,
    bodyKa: section.body.ka,
    bodyEn: section.body.en,
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!texts.bodyKa.trim() && !texts.bodyEn.trim()) {
      setError(NO_TEXT);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api(`/about/sections/${section.id}`, form("PATCH", await body(texts, photo)));
      await reload();
      onClose();
    } catch (err) {
      setError(explain(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <Fields value={texts} onChange={setTexts} photo={photo} onPhoto={setPhoto} section={section} />
      {error && <Notice kind="error">{error}</Notice>}
      <div className="flex flex-wrap gap-2.5">
        <button type="submit" disabled={busy} className="btn btn-gold btn-sm disabled:opacity-60">
          {busy ? "ინახება…" : "შენახვა"}
        </button>
        <button type="button" disabled={busy} onClick={onClose} className="btn btn-outline btn-sm">
          გაუქმება
        </button>
      </div>
    </form>
  );
}

/**
 * The "About us" page: every section added here shows on the site's /about
 * page, in this order, as a photo with its title and text. A section is one
 * record for both sites: its photo is shared, its title is optional, and its
 * text is written in at least one of the two languages.
 */
export function AboutPanel({ about, reload, explain }: PanelProps) {
  const [draft, setDraft] = useState<Texts>(blank);
  const [photo, setPhoto] = useState<File | null>(null);
  /** counts the sections added: a fresh form (and an empty file picker) after each */
  const [added, setAdded] = useState(0);
  const [adding, setAdding] = useState(false);
  const [addOutcome, setAddOutcome] = useState<{ kind: "error" | "ok"; text: string } | null>(null);
  /** the section open for editing, if any */
  const [editing, setEditing] = useState<string | null>(null);
  /** moving or deleting a section: one at a time */
  const [busy, setBusy] = useState(false);
  const [listError, setListError] = useState("");

  async function add(event: FormEvent) {
    event.preventDefault();
    if (!draft.bodyKa.trim() && !draft.bodyEn.trim()) {
      setAddOutcome({ kind: "error", text: NO_TEXT });
      return;
    }
    setAdding(true);
    setAddOutcome(null);
    try {
      await api("/about/sections", form("POST", await body(draft, photo)));
      setDraft(blank);
      setPhoto(null);
      setAdded((count) => count + 1);
      await reload();
      setAddOutcome({ kind: "ok", text: "სექცია დაემატა და ჩანს „ჩვენ შესახებ“ გვერდზე, საიტის ორივე ენაზე." });
    } catch (err) {
      setAddOutcome({ kind: "error", text: explain(err) });
    }
    setAdding(false);
  }

  /** A change to the list itself: a new order, or one section fewer. */
  async function change(action: () => Promise<unknown>) {
    setBusy(true);
    setListError("");
    try {
      await action();
      await reload();
    } catch (err) {
      const text = explain(err);
      // the list here may be out of date: show what the backend has now
      await reload();
      setListError(text);
    }
    setBusy(false);
  }

  /** Swaps a section with its neighbour: `by` is -1 for up, 1 for down. */
  function move(index: number, by: -1 | 1) {
    const ids = about.map((section) => section.id);
    [ids[index], ids[index + by]] = [ids[index + by], ids[index]];
    void change(() => api("/about/sections/order", json("PUT", { ids })));
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>სექციის დამატება</CardTitle>
          <Link href="/ka/about" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
            გვერდის ნახვა
          </Link>
        </div>
        <Hint className="mt-1.5">
          აქ დამატებული ყველა სექცია ჩანს საიტის „ჩვენ შესახებ“ გვერდზე: ფოტო, მასთან სათაური (თუ ჩაწერ)
          და ტექსტი. კომპიუტერზე ფოტო და ტექსტი გვერდიგვერდაა და მხარეები სექციიდან სექციამდე
          მონაცვლეობს; ტელეფონზე ჯერ ფოტოა, მის ქვემოთ ტექსტი. სანამ არცერთი სექცია არ არის, გვერდზე
          წერია, რომ მალე დაემატება.
        </Hint>
        <form onSubmit={add} className="mt-5 flex flex-col gap-4">
          <Fields key={added} value={draft} onChange={setDraft} photo={photo} onPhoto={setPhoto} />
          {addOutcome && <Notice kind={addOutcome.kind}>{addOutcome.text}</Notice>}
          <div>
            <button type="submit" disabled={adding} className="btn btn-gold disabled:opacity-60">
              {adding ? "ემატება…" : "დამატება"}
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <CardTitle>სექციები</CardTitle>
        {about.length === 0 ? (
          <Hint className="mt-3">სექციები ჯერ არ არის დამატებული.</Hint>
        ) : (
          <>
            <Hint className="mt-1.5">საიტზე ამავე რიგით ჩანს. რიგს ისრებით ცვლი.</Hint>
            {listError && (
              <div className="mt-3">
                <Notice kind="error">{listError}</Notice>
              </div>
            )}
            <ol className="mt-2">
              {about.map((section, i) => (
                <li key={section.id} className="border-b border-cream/12 py-4 last:border-b-0">
                  {editing === section.id ? (
                    <SectionEditor
                      section={section}
                      onClose={() => setEditing(null)}
                      reload={reload}
                      explain={explain}
                    />
                  ) : (
                    <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
                      <div className="relative aspect-[5/4] w-[120px] shrink-0 overflow-hidden rounded-[10px] bg-ink">
                        <Thumb photo={section.image} />
                      </div>
                      <div className="min-w-0 flex-[1_1_280px]">
                        {section.title.ka || section.title.en ? (
                          <>
                            <p className="break-words text-[16px] font-medium leading-[23px] text-cream">
                              <span className="mr-2 font-light text-muted">{i + 1}.</span>
                              {section.title.ka || section.title.en}
                            </p>
                            {section.title.ka && section.title.en && (
                              <p className="mt-0.5 break-words text-[14px] font-light leading-5 text-muted">
                                {section.title.en}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-[16px] font-light leading-[23px] text-muted">
                            <span className="mr-2">{i + 1}.</span>
                            <span className="italic">სათაურის გარეშე</span>
                          </p>
                        )}
                        <p className="mt-2 line-clamp-2 whitespace-pre-line break-words text-[14.5px] font-light leading-[21px] text-body">
                          {section.body.ka || section.body.en}
                        </p>
                        {(!section.body.ka || !section.body.en) && (
                          <p className="mt-1 text-[13.5px] leading-5 text-muted">
                            {section.body.ka ? "ტექსტი მხოლოდ ქართულად" : "ტექსტი მხოლოდ ინგლისურად"}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          aria-label={`სექცია ${i + 1}: ზემოთ გადატანა`}
                          disabled={busy || i === 0}
                          onClick={() => move(i, -1)}
                          className="btn btn-outline h-11 w-11 p-0 text-[15px] disabled:opacity-35"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          aria-label={`სექცია ${i + 1}: ქვემოთ გადატანა`}
                          disabled={busy || i === about.length - 1}
                          onClick={() => move(i, 1)}
                          className="btn btn-outline h-11 w-11 p-0 text-[15px] disabled:opacity-35"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setEditing(section.id)}
                          className="btn btn-outline btn-sm disabled:opacity-40"
                        >
                          რედაქტირება
                        </button>
                        <ConfirmDelete
                          disabled={busy}
                          onConfirm={() => void change(() => api(`/about/sections/${section.id}`, { method: "DELETE" }))}
                        />
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </>
        )}
      </Card>
    </div>
  );
}
