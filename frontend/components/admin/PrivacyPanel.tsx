"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { postDate } from "@/lib/blog";
import { standardPolicy } from "@/lib/privacy";
import type { PrivacyPolicy } from "@/lib/types";
import type { PanelProps } from "./AdminApp";
import { api, json } from "./api";
import { Card, CardTitle, ConfirmDelete, Hint, Notice } from "./ui";

/** the backend's limit (backend/src/models/Privacy.js) */
const BODY_MAX = 20000;

type Outcome = { kind: "error" | "ok"; text: string };

type FormProps = Pick<PanelProps, "reload" | "explain"> & {
  /** the text as it is saved, or null while the site shows its standard one */
  privacy: PrivacyPolicy | null;
  /** how the last save went; the panel keeps it while the form is filled in afresh */
  outcome: Outcome | null;
  onOutcome: (outcome: Outcome | null) => void;
};

/**
 * The policy's text in Georgian and in English. While nothing is saved the
 * boxes hold the standard text, so there is something to edit from.
 */
function PrivacyForm({ privacy, reload, explain, outcome, onOutcome }: FormProps) {
  const [bodyKa, setBodyKa] = useState(privacy ? privacy.body.ka : standardPolicy.ka);
  const [bodyEn, setBodyEn] = useState(privacy ? privacy.body.en : standardPolicy.en);
  const [busy, setBusy] = useState(false);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!bodyKa.trim() && !bodyEn.trim()) {
      onOutcome({ kind: "error", text: "პოლიტიკის ტექსტი ერთ ენაზე მაინც დაწერე." });
      return;
    }
    setBusy(true);
    onOutcome(null);
    try {
      await api<PrivacyPolicy>("/privacy", json("PUT", { body: { ka: bodyKa, en: bodyEn } }));
      await reload();
      onOutcome({ kind: "ok", text: "ტექსტი შენახულია და ჩანს საიტის ორივე ენაზე." });
    } catch (err) {
      onOutcome({ kind: "error", text: explain(err) });
    }
    setBusy(false);
  }

  return (
    <form onSubmit={save} className="mt-5 flex flex-col gap-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <label>
          <span className="field-label mb-2">ტექსტი ქართულად</span>
          <textarea
            rows={22}
            maxLength={BODY_MAX}
            value={bodyKa}
            onChange={(e) => setBodyKa(e.target.value)}
            className="field px-3.5 py-3 font-light leading-[22px]"
          />
        </label>
        <label>
          <span className="field-label mb-2">ტექსტი ინგლისურად</span>
          <textarea
            rows={22}
            maxLength={BODY_MAX}
            value={bodyEn}
            onChange={(e) => setBodyEn(e.target.value)}
            className="field px-3.5 py-3 font-light leading-[22px]"
          />
        </label>
        <Hint className="lg:col-span-2">
          ახალი აბზაცისთვის გამოტოვე ცარიელი ხაზი. სექციის სათაურისთვის ხაზი დაიწყე # ნიშნით, მაგ.:{" "}
          <span className="text-cream"># რუკა (Google Maps)</span>. სათაურები გვერდზე სარჩევადაც ჩანს.
          ბმულის ჩასასმელად ჩაწერე სრული მისამართი (https://…) და ის თავად გახდება ბმული. ერთ ენაზე მაინც
          აუცილებელია; თუ მხოლოდ ერთზე დაწერ, საიტის ორივე ვერსიაზე ის გამოჩნდება.
        </Hint>
      </div>

      {outcome && <Notice kind={outcome.kind}>{outcome.text}</Notice>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className="btn btn-gold disabled:opacity-60">
          {busy ? "ინახება…" : "შენახვა"}
        </button>
      </div>
    </form>
  );
}

/**
 * The privacy policy: the text of the site's /privacy page. The site carries
 * a standard text (lib/privacy.ts) and shows it until one is saved here.
 */
export function PrivacyPanel({ privacy, reload, explain }: PanelProps) {
  /** how going back to the standard text went (shown at the top) and how saving went (by its button) */
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Outcome | null>(null);
  const [busy, setBusy] = useState(false);

  async function restore() {
    setBusy(true);
    setError("");
    setDone("");
    setSaved(null);
    try {
      await api("/privacy", { method: "DELETE" });
      await reload();
      setDone("შენი ტექსტი წაიშალა: საიტზე ისევ სტანდარტული ტექსტი ჩანს.");
    } catch (err) {
      setError(explain(err));
    }
    setBusy(false);
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle>კონფიდენციალურობის პოლიტიკა</CardTitle>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/ka/privacy" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
            გვერდის ნახვა
          </Link>
          {privacy && (
            <ConfirmDelete disabled={busy} onConfirm={() => void restore()} label="სტანდარტული ტექსტის დაბრუნება" />
          )}
        </div>
      </div>
      <Hint className="mt-2">
        {privacy
          ? `ბოლოს შეიცვალა: ${postDate(privacy.updatedAt, "ka")}. ეს თარიღი ჩანს საიტზე, გვერდის სათაურის ქვეშ.`
          : "საიტზე ახლა სტანდარტული ტექსტი ჩანს: რუკის, Google-ის შეფასებების და ჯავშნის ფორმის შესახებ. ქვემოთ ის არის ჩაწერილი; შეცვალე, რაც გინდა, და შეინახე."}{" "}
        ბმული ამ გვერდზე საიტის ყველა გვერდის ბოლოშია.
      </Hint>

      {(done || error) && (
        <div className="mt-4">
          <Notice kind={error ? "error" : "ok"}>{error || done}</Notice>
        </div>
      )}

      <PrivacyForm
        // filled in afresh whenever the backend's copy changes
        key={privacy?.updatedAt ?? "standard"}
        privacy={privacy}
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
