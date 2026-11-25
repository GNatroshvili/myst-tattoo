"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import type { Stat } from "@/lib/types";
import type { PanelProps } from "./AdminApp";
import { api, json } from "./api";
import { Card, CardTitle, ConfirmDelete, Hint, Notice } from "./ui";

type Actions = Pick<PanelProps, "reload" | "explain">;

/** the backend's limits (backend/src/models/Stat.js) */
const VALUE_MAX = 12;
const LABEL_MAX = 60;
const STATS_MAX = 4;

type Texts = { value: string; labelKa: string; labelEn: string };

const blank: Texts = { value: "", labelKa: "", labelEn: "" };

/** A figure's texts as the API takes them. */
const body = (t: Texts) => ({ value: t.value, label: { ka: t.labelKa, en: t.labelEn } });

/** The three boxes of a figure: it, and the line under it in Georgian and in English. */
function Fields({ value, onChange }: { value: Texts; onChange: (value: Texts) => void }) {
  const set = (key: keyof Texts) => (text: string) => onChange({ ...value, [key]: text });

  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_minmax(0,3fr)]">
      <label>
        <span className="field-label mb-2">რიცხვი *</span>
        <input
          required
          maxLength={VALUE_MAX}
          value={value.value}
          onChange={(e) => set("value")(e.target.value)}
          placeholder="მაგ.: 700+"
          className="field h-[46px] px-3.5"
        />
      </label>
      <label>
        <span className="field-label mb-2">წარწერა ქართულად *</span>
        <input
          required
          maxLength={LABEL_MAX}
          value={value.labelKa}
          onChange={(e) => set("labelKa")(e.target.value)}
          placeholder="მაგ.: შეფასება Google-ზე"
          className="field h-[46px] px-3.5"
        />
      </label>
      <label>
        <span className="field-label mb-2">წარწერა ინგლისურად *</span>
        <input
          required
          maxLength={LABEL_MAX}
          value={value.labelEn}
          onChange={(e) => set("labelEn")(e.target.value)}
          placeholder="e.g. Reviews on Google"
          className="field h-[46px] px-3.5"
        />
      </label>
    </div>
  );
}

/** The form a figure is changed in; it opens in the figure's place in the list. */
function StatEditor({ stat, onClose, reload, explain }: { stat: Stat; onClose: () => void } & Actions) {
  const [texts, setTexts] = useState<Texts>({ value: stat.value, labelKa: stat.label.ka, labelEn: stat.label.en });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(`/stats/${stat.id}`, json("PATCH", body(texts)));
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
 * The figures the home page shows about the studio, above "Featured
 * projects": a figure over a line of text, in one row, in this order. A
 * figure is one record for both sites: the number is the same on both, the
 * line under it is written in Georgian and in English. The row holds four.
 */
export function StatsPanel({ stats, reload, explain }: PanelProps) {
  const [draft, setDraft] = useState<Texts>(blank);
  const [adding, setAdding] = useState(false);
  const [addOutcome, setAddOutcome] = useState<{ kind: "error" | "ok"; text: string } | null>(null);
  /** the figure open for editing, if any */
  const [editing, setEditing] = useState<string | null>(null);
  /** moving or deleting a figure: one at a time */
  const [busy, setBusy] = useState(false);
  const [listError, setListError] = useState("");
  const full = stats.length >= STATS_MAX;

  async function add(event: FormEvent) {
    event.preventDefault();
    setAdding(true);
    setAddOutcome(null);
    try {
      await api("/stats", json("POST", body(draft)));
      setDraft(blank);
      await reload();
      setAddOutcome({ kind: "ok", text: "მიღწევა დაემატა და ჩანს მთავარ გვერდზე, საიტის ორივე ენაზე." });
    } catch (err) {
      // the row may have filled up elsewhere: show what the backend has now
      await reload();
      setAddOutcome({ kind: "error", text: explain(err) });
    }
    setAdding(false);
  }

  /** A change to the list itself: a new order, or one figure fewer. */
  async function change(action: () => Promise<unknown>) {
    setBusy(true);
    setListError("");
    // "the figure was added" is no longer the latest news
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

  /** Swaps a figure with its neighbour: `by` is -1 for up, 1 for down. */
  function move(index: number, by: -1 | 1) {
    const ids = stats.map((stat) => stat.id);
    [ids[index], ids[index + by]] = [ids[index + by], ids[index]];
    void change(() => api("/stats/order", json("PUT", { ids })));
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>მიღწევის დამატება</CardTitle>
          <Link href="/ka#numbers" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
            გვერდის ნახვა
          </Link>
        </div>
        <Hint className="mt-1.5">
          აქ დამატებული მიღწევები ჩანს მთავარ გვერდზე, ერთ რიგში, „გამორჩეული ნამუშევრების“ თავზე: ზემოთ დიდი
          რიცხვი, ქვემოთ მისი წარწერა. რიცხვი ისე ჩაწერე, როგორც საიტზე უნდა გამოჩნდეს (700+, 5000+,
          5,000+); ბოლოში დაწერილი „+“ ოქროსფრად ჩანს. წარწერა ორივე ენაზეა საჭირო. რიგში მაქსიმუმ{" "}
          {STATS_MAX} მიღწევა ეტევა; სანამ არცერთი არ არის, ეს სექცია საიტზე საერთოდ არ ჩანს.
        </Hint>
        {full ? (
          <div className="mt-5">
            <Notice kind="ok">
              რიგი სავსეა: {STATS_MAX} მიღწევა უკვე დამატებულია. ახლის დასამატებლად ჯერ ერთ-ერთი წაშალე, ან
              არსებული შეცვალე.
            </Notice>
          </div>
        ) : (
          <form onSubmit={add} className="mt-5 flex flex-col gap-4">
            <Fields value={draft} onChange={setDraft} />
            {addOutcome && <Notice kind={addOutcome.kind}>{addOutcome.text}</Notice>}
            <div>
              <button type="submit" disabled={adding} className="btn btn-gold disabled:opacity-60">
                {adding ? "ემატება…" : "დამატება"}
              </button>
            </div>
          </form>
        )}
      </Card>

      <Card>
        <CardTitle>მიღწევები</CardTitle>
        {stats.length === 0 ? (
          <Hint className="mt-3">მიღწევები ჯერ არ არის დამატებული.</Hint>
        ) : (
          <>
            <Hint className="mt-1.5">საიტზე ამავე რიგით ჩანს, მარცხნიდან მარჯვნივ. რიგს ისრებით ცვლი.</Hint>
            {listError && (
              <div className="mt-3">
                <Notice kind="error">{listError}</Notice>
              </div>
            )}
            <ol className="mt-2">
              {stats.map((stat, i) => (
                <li key={stat.id} className="border-b border-cream/12 py-4 last:border-b-0">
                  {editing === stat.id ? (
                    <StatEditor stat={stat} onClose={() => setEditing(null)} reload={reload} explain={explain} />
                  ) : (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                      <div className="flex min-w-0 flex-[1_1_320px] items-center gap-x-5">
                        <p className="min-w-[92px] shrink-0 text-[26px] font-medium leading-8 text-cream">
                          {stat.value}
                        </p>
                        <div className="min-w-0">
                          <p className="break-words text-[16px] leading-[23px] text-cream">{stat.label.ka}</p>
                          <p className="mt-0.5 break-words text-[14px] font-light leading-5 text-muted">
                            {stat.label.en}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          aria-label={`მიღწევა ${i + 1}: წინ გადატანა`}
                          disabled={busy || i === 0}
                          onClick={() => move(i, -1)}
                          className="btn btn-outline h-11 w-11 p-0 text-[15px] disabled:opacity-35"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          aria-label={`მიღწევა ${i + 1}: უკან გადატანა`}
                          disabled={busy || i === stats.length - 1}
                          onClick={() => move(i, 1)}
                          className="btn btn-outline h-11 w-11 p-0 text-[15px] disabled:opacity-35"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setEditing(stat.id)}
                          className="btn btn-outline btn-sm disabled:opacity-40"
                        >
                          რედაქტირება
                        </button>
                        <ConfirmDelete
                          disabled={busy}
                          onConfirm={() => void change(() => api(`/stats/${stat.id}`, { method: "DELETE" }))}
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
