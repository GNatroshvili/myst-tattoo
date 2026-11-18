"use client";

import { useState, type FormEvent } from "react";
import type { Style } from "@/lib/types";
import type { PanelProps } from "./AdminApp";
import { api, json } from "./api";
import { Card, CardTitle, ConfirmDelete, Hint, Notice } from "./ui";

/** One style: its two names, editable in place. */
function StyleRow({ style, reload, explain }: { style: Style } & Pick<PanelProps, "reload" | "explain">) {
  const [ka, setKa] = useState(style.name.ka);
  const [en, setEn] = useState(style.name.en);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const changed = ka.trim() !== style.name.ka || en.trim() !== style.name.en;

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
          void run(() => api(`/styles/${style.id}`, json("PATCH", { name: { ka, en } })));
        }}
        className="flex flex-wrap items-center gap-2.5"
      >
        <input
          aria-label="სახელი ქართულად"
          required
          maxLength={40}
          value={ka}
          onChange={(e) => setKa(e.target.value)}
          className="field h-[46px] min-w-[150px] flex-1 px-3.5"
        />
        <input
          aria-label="სახელი ინგლისურად"
          required
          maxLength={40}
          value={en}
          onChange={(e) => setEn(e.target.value)}
          className="field h-[46px] min-w-[150px] flex-1 px-3.5"
        />
        <button type="submit" disabled={busy || !changed} className="btn btn-outline btn-sm disabled:opacity-40">
          შენახვა
        </button>
        <ConfirmDelete disabled={busy} onConfirm={() => void run(() => api(`/styles/${style.id}`, { method: "DELETE" }))} />
      </form>
      {error && (
        <div className="mt-2.5">
          <Notice kind="error">{error}</Notice>
        </div>
      )}
    </li>
  );
}

/** Tattoo styles: the list artists and tattoos are tagged with. */
export function StylesPanel({ styles, reload, explain }: PanelProps) {
  const [ka, setKa] = useState("");
  const [en, setEn] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function add(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/styles", json("POST", { name: { ka, en } }));
      setKa("");
      setEn("");
      await reload();
    } catch (err) {
      setError(explain(err));
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardTitle>სტილის დამატება</CardTitle>
        <Hint className="mt-1.5">
          სტილებს ირჩევ არტისტისა და ტატუს დამატებისას; საიტზე ტატუების ფილტრიც მათ იყენებს. სახელი
          ორივე ენაზე ჩაწერე — ის საიტის ქართულ და ინგლისურ ვერსიაზე გამოჩნდება.
        </Hint>
        <form onSubmit={add} className="mt-4 flex flex-wrap items-end gap-2.5">
          <label className="min-w-[150px] flex-1">
            <span className="field-label mb-2">ქართულად</span>
            <input
              required
              maxLength={40}
              value={ka}
              onChange={(e) => setKa(e.target.value)}
              placeholder="მაგ.: რეალიზმი"
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
              placeholder="e.g. Realism"
              className="field h-[46px] px-3.5"
            />
          </label>
          <button type="submit" disabled={busy} className="btn btn-gold disabled:opacity-60">
            დამატება
          </button>
        </form>
        {error && (
          <div className="mt-3">
            <Notice kind="error">{error}</Notice>
          </div>
        )}
      </Card>

      <Card>
        <CardTitle>სტილები</CardTitle>
        {styles.length === 0 ? (
          <Hint className="mt-3">სტილები ჯერ არ არის დამატებული.</Hint>
        ) : (
          <ul className="mt-2">
            {/* the key includes the names, so a row starts afresh once its change is saved */}
            {styles.map((style) => (
              <StyleRow
                key={`${style.id}:${style.name.ka}:${style.name.en}`}
                style={style}
                reload={reload}
                explain={explain}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
