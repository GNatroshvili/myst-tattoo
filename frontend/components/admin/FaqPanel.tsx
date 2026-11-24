"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import type { Faq } from "@/lib/types";
import type { PanelProps } from "./AdminApp";
import { api, json } from "./api";
import { Card, CardTitle, ConfirmDelete, Hint, Notice } from "./ui";

type Actions = Pick<PanelProps, "reload" | "explain">;

/** the backend's limits (backend/src/models/Faq.js) */
const QUESTION_MAX = 200;
const ANSWER_MAX = 2000;

const NO_ANSWER = "პასუხი ერთ ენაზე მაინც დაწერე.";

type Texts = { questionKa: string; questionEn: string; answerKa: string; answerEn: string };

const blank: Texts = { questionKa: "", questionEn: "", answerKa: "", answerEn: "" };

/** A question's texts as the API takes them. */
const body = (t: Texts) => ({
  question: { ka: t.questionKa, en: t.questionEn },
  answer: { ka: t.answerKa, en: t.answerEn },
});

/** The four boxes of a question: it and its answer, in Georgian and in English. */
function Fields({ value, onChange }: { value: Texts; onChange: (value: Texts) => void }) {
  const set = (key: keyof Texts) => (text: string) => onChange({ ...value, [key]: text });

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="field-label mb-2">კითხვა ქართულად *</span>
          <input
            required
            maxLength={QUESTION_MAX}
            value={value.questionKa}
            onChange={(e) => set("questionKa")(e.target.value)}
            placeholder="მაგ.: მტკივნეულია ტატუს გაკეთება?"
            className="field h-[46px] px-3.5"
          />
        </label>
        <label>
          <span className="field-label mb-2">კითხვა ინგლისურად *</span>
          <input
            required
            maxLength={QUESTION_MAX}
            value={value.questionEn}
            onChange={(e) => set("questionEn")(e.target.value)}
            placeholder="e.g. Does getting a tattoo hurt?"
            className="field h-[46px] px-3.5"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="field-label mb-2">პასუხი ქართულად</span>
          <textarea
            rows={5}
            maxLength={ANSWER_MAX}
            value={value.answerKa}
            onChange={(e) => set("answerKa")(e.target.value)}
            className="field px-3.5 py-3 font-light leading-[22px]"
          />
        </label>
        <label>
          <span className="field-label mb-2">პასუხი ინგლისურად</span>
          <textarea
            rows={5}
            maxLength={ANSWER_MAX}
            value={value.answerEn}
            onChange={(e) => set("answerEn")(e.target.value)}
            className="field px-3.5 py-3 font-light leading-[22px]"
          />
        </label>
      </div>
    </>
  );
}

/** The form a question is changed in; it opens in the question's place in the list. */
function FaqEditor({ faq, onClose, reload, explain }: { faq: Faq; onClose: () => void } & Actions) {
  const [texts, setTexts] = useState<Texts>({
    questionKa: faq.question.ka,
    questionEn: faq.question.en,
    answerKa: faq.answer.ka,
    answerEn: faq.answer.en,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!texts.answerKa.trim() && !texts.answerEn.trim()) {
      setError(NO_ANSWER);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api(`/faqs/${faq.id}`, json("PATCH", body(texts)));
      await reload();
      onClose();
    } catch (err) {
      setError(explain(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <Fields value={texts} onChange={setTexts} />
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
 * Frequently asked questions: every one added here shows on the home page, in
 * this order. A question is one record for both sites: it is written in
 * Georgian and in English, and its answer in at least one of them.
 */
export function FaqPanel({ faqs, reload, explain }: PanelProps) {
  const [draft, setDraft] = useState<Texts>(blank);
  const [adding, setAdding] = useState(false);
  const [addOutcome, setAddOutcome] = useState<{ kind: "error" | "ok"; text: string } | null>(null);
  /** the question open for editing, if any */
  const [editing, setEditing] = useState<string | null>(null);
  /** moving or deleting a question: one at a time */
  const [busy, setBusy] = useState(false);
  const [listError, setListError] = useState("");

  async function add(event: FormEvent) {
    event.preventDefault();
    if (!draft.answerKa.trim() && !draft.answerEn.trim()) {
      setAddOutcome({ kind: "error", text: NO_ANSWER });
      return;
    }
    setAdding(true);
    setAddOutcome(null);
    try {
      await api("/faqs", json("POST", body(draft)));
      setDraft(blank);
      await reload();
      setAddOutcome({ kind: "ok", text: "კითხვა დაემატა და ჩანს მთავარ გვერდზე, საიტის ორივე ენაზე." });
    } catch (err) {
      setAddOutcome({ kind: "error", text: explain(err) });
    }
    setAdding(false);
  }

  /** A change to the list itself: a new order, or one question fewer. */
  async function change(action: () => Promise<unknown>) {
    setBusy(true);
    setListError("");
    // "the question was added" is no longer the latest news
    setAddOutcome(null);
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

  /** Swaps a question with its neighbour: `by` is -1 for up, 1 for down. */
  function move(index: number, by: -1 | 1) {
    const ids = faqs.map((faq) => faq.id);
    [ids[index], ids[index + by]] = [ids[index + by], ids[index]];
    void change(() => api("/faqs/order", json("PUT", { ids })));
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>კითხვის დამატება</CardTitle>
          <Link href="/ka#faq" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
            გვერდის ნახვა
          </Link>
        </div>
        <Hint className="mt-1.5">
          აქ დამატებული ყველა კითხვა ჩანს მთავარ გვერდზე, სექციაში „ხშირად დასმული კითხვები“. კითხვა ორივე
          ენაზე ჩაწერე; პასუხი ერთ ენაზე მაინც აუცილებელია, და თუ მხოლოდ ერთზე დაწერ, საიტის ორივე
          ვერსიაზე ის გამოჩნდება. სანამ არცერთი კითხვა არ არის, ეს სექცია საიტზე საერთოდ არ ჩანს.
        </Hint>
        <form onSubmit={add} className="mt-5 flex flex-col gap-4">
          <Fields value={draft} onChange={setDraft} />
          {addOutcome && <Notice kind={addOutcome.kind}>{addOutcome.text}</Notice>}
          <div>
            <button type="submit" disabled={adding} className="btn btn-gold disabled:opacity-60">
              {adding ? "ემატება…" : "დამატება"}
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <CardTitle>კითხვები</CardTitle>
        {faqs.length === 0 ? (
          <Hint className="mt-3">კითხვები ჯერ არ არის დამატებული.</Hint>
        ) : (
          <>
            <Hint className="mt-1.5">საიტზე ამავე რიგით ჩანს. რიგს ისრებით ცვლი.</Hint>
            {listError && (
              <div className="mt-3">
                <Notice kind="error">{listError}</Notice>
              </div>
            )}
            <ol className="mt-2">
              {faqs.map((faq, i) => (
                <li key={faq.id} className="border-b border-cream/12 py-4 last:border-b-0">
                  {editing === faq.id ? (
                    <FaqEditor faq={faq} onClose={() => setEditing(null)} reload={reload} explain={explain} />
                  ) : (
                    <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
                      <div className="min-w-0 flex-[1_1_320px]">
                        <p className="break-words text-[16px] font-medium leading-[23px] text-cream">
                          <span className="mr-2 font-light text-muted">{i + 1}.</span>
                          {faq.question.ka}
                        </p>
                        <p className="mt-0.5 break-words text-[14px] font-light leading-5 text-muted">
                          {faq.question.en}
                        </p>
                        <p className="mt-2 line-clamp-2 whitespace-pre-line break-words text-[14.5px] font-light leading-[21px] text-body">
                          {faq.answer.ka || faq.answer.en}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          aria-label={`კითხვა ${i + 1}: ზემოთ გადატანა`}
                          disabled={busy || i === 0}
                          onClick={() => move(i, -1)}
                          className="btn btn-outline h-11 w-11 p-0 text-[15px] disabled:opacity-35"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          aria-label={`კითხვა ${i + 1}: ქვემოთ გადატანა`}
                          disabled={busy || i === faqs.length - 1}
                          onClick={() => move(i, 1)}
                          className="btn btn-outline h-11 w-11 p-0 text-[15px] disabled:opacity-35"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setEditing(faq.id)}
                          className="btn btn-outline btn-sm disabled:opacity-40"
                        >
                          რედაქტირება
                        </button>
                        <ConfirmDelete
                          disabled={busy}
                          onConfirm={() => void change(() => api(`/faqs/${faq.id}`, { method: "DELETE" }))}
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
