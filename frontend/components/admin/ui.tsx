"use client";

import { useEffect, useState, type ReactNode, type SelectHTMLAttributes } from "react";
import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import type { Photo } from "@/lib/types";
import { ChevronDownIcon } from "../ui/Icons";

/** Small building blocks shared by the admin panel's screens. */

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[18px] border border-cream/16 bg-surface p-5 sm:p-7 ${className}`}>
      {children}
    </section>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-[20px] font-medium leading-7 text-cream">{children}</h2>;
}

/** Explanation under a field or a title. */
export function Hint({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[13.5px] font-light leading-5 text-muted ${className}`}>{children}</p>;
}

/** A line saying what went wrong (red) or what was done (green). */
export function Notice({ kind, children }: { kind: "error" | "ok"; children: ReactNode }) {
  const look =
    kind === "error"
      ? "border-[#e0707a]/45 bg-[#e0707a]/10 text-[#f5b3b9]"
      : "border-[#7fc39a]/40 bg-[#7fc39a]/10 text-[#b5e3c6]";
  return (
    <p role={kind === "error" ? "alert" : "status"} className={`rounded-[10px] border px-3.5 py-2.5 text-[14.5px] leading-5 ${look}`}>
      {children}
    </p>
  );
}

/** A drop-down in the form fields' look. */
export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative ${className}`}>
      <select {...props} className="field h-[46px] pl-3.5 pr-10 disabled:opacity-60">
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-4 top-[19px] h-2 w-[11px] text-cream" />
    </div>
  );
}

export const dangerButton =
  "btn btn-sm border border-[#e0707a]/55 text-[#f5b3b9] hover:border-[#e0707a] hover:bg-[#e0707a]/10 disabled:opacity-50";

/**
 * Delete in two steps: the first click asks, the second one deletes. Asking
 * goes away by itself after a few seconds.
 */
export function ConfirmDelete({
  onConfirm,
  disabled,
  label = "წაშლა",
}: {
  onConfirm: () => void;
  disabled?: boolean;
  label?: string;
}) {
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (!asking) return;
    const timer = setTimeout(() => setAsking(false), 5000);
    return () => clearTimeout(timer);
  }, [asking]);

  if (!asking) {
    return (
      <button type="button" disabled={disabled} onClick={() => setAsking(true)} className={dangerButton}>
        {label}
      </button>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="text-[14px] text-[#f5b3b9]">წავშალო?</span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
        className={dangerButton}
      >
        დიახ
      </button>
      <button type="button" onClick={() => setAsking(false)} className="btn btn-outline btn-sm">
        არა
      </button>
    </span>
  );
}

/** A stored photo filling its (positioned) parent. */
export function Thumb({ photo, size = "thumb" }: { photo: Photo; size?: "thumb" | "full" }) {
  return <Image src={photo[size]} alt="" fill unoptimized className="object-cover" draggable={false} />;
}

/** A temporary address for showing a photo that has been picked but not uploaded. */
export function usePreview(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    const address = URL.createObjectURL(file);
    // the address exists only now, so it has to be stored from inside the effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(address);
    return () => {
      URL.revokeObjectURL(address);
      setUrl(null);
    };
  }, [file]);

  return url;
}

/* ---------- languages ---------- */

/**
 * The site's two languages, as the panel names them. Every artist and every
 * tattoo is added for one of them and shows only on that language's pages.
 */
export const LANGUAGES: {
  key: Locale;
  label: string;
  /** short tag for tight places (a photo's corner) */
  short: string;
  /** where its records show */
  site: string;
  /** "on the Georgian site", for sentences */
  onSite: string;
  bioLabel: string;
}[] = [
  { key: "ka", label: "ქართული", short: "ქარ", site: "/ka", onSite: "ქართულ საიტზე", bioLabel: "ბიო ქართულად" },
  { key: "en", label: "ინგლისური", short: "ENG", site: "/en", onSite: "ინგლისურ საიტზე", bioLabel: "ბიო ინგლისურად" },
];

export const languageOf = (lang: Locale) => LANGUAGES.find((l) => l.key === lang) ?? LANGUAGES[0];

/** Small tag saying which language (and so which site) a record belongs to. */
export function LangBadge({
  lang,
  short = false,
  className = "",
}: {
  lang: Locale;
  short?: boolean;
  className?: string;
}) {
  const language = languageOf(lang);
  return (
    <span
      title={`ჩანს მისამართზე ${language.site}`}
      className={`inline-flex h-6 items-center rounded-full border border-cream/28 bg-ink/80 px-2.5 text-[12px] font-medium leading-none text-cream ${className}`}
    >
      {short ? language.short : language.label}
    </span>
  );
}

/**
 * First step of adding an artist or a tattoo: which language it is for.
 * Nothing else can be filled in until one is picked.
 */
export function LanguagePick({ onPick }: { onPick: (lang: Locale) => void }) {
  return (
    <div>
      <p className="field-label">რომელ ენაზე ამატებ?</p>
      <Hint className="mt-1">
        ჩანაწერი მხოლოდ არჩეული ენის საიტზე გამოჩნდება. ორივე ენაზე რომ ჩანდეს, დაამატე ცალ-ცალკე:
        ჯერ ერთი ენისთვის, მერე მეორისთვის.
      </Hint>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {LANGUAGES.map((language) => (
          <button
            key={language.key}
            type="button"
            onClick={() => onPick(language.key)}
            className="flex min-h-[84px] flex-col items-start justify-center rounded-[14px] border border-cream/22 bg-ink px-5 py-4 text-left transition-colors hover:border-gold"
          >
            <span className="text-[18px] font-medium leading-6 text-cream">{language.label}</span>
            <span className="mt-1 text-[13.5px] font-light leading-5 text-muted">
              გამოჩნდება {language.onSite} ({language.site})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** The picked language at the top of a form, with a way back while adding. */
export function ChosenLanguage({ lang, onChange }: { lang: Locale; onChange?: () => void }) {
  const language = languageOf(lang);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[12px] border border-cream/16 bg-ink px-4 py-3">
      <span className="text-[14.5px] leading-5 text-body">
        ენა: <strong className="font-medium text-cream">{language.label}</strong> — გამოჩნდება{" "}
        {language.onSite} ({language.site})
      </span>
      {onChange && (
        <button
          type="button"
          onClick={onChange}
          className="ml-auto min-h-11 text-[14.5px] text-cream underline underline-offset-4 transition-colors hover:text-gold"
        >
          ენის შეცვლა
        </button>
      )}
    </div>
  );
}

/** Chips above a list: every language's records, or only one's. */
export function LanguageFilter({
  value,
  onChange,
  count,
}: {
  value: Locale | "all";
  onChange: (value: Locale | "all") => void;
  /** how many records each choice would show */
  count: (lang: Locale | "all") => number;
}) {
  const options: { key: Locale | "all"; label: string }[] = [
    { key: "all", label: "ყველა ენა" },
    ...LANGUAGES.map(({ key, label }) => ({ key, label })),
  ];
  return (
    <div role="group" aria-label="ენის მიხედვით გაფილტვრა" className="flex flex-wrap gap-2">
      {options.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          aria-pressed={value === key}
          onClick={() => onChange(key)}
          className={`h-11 rounded-full border px-4 text-[14.5px] transition-colors ${
            value === key ? "border-gold bg-raised text-gold" : "border-cream/28 text-cream hover:border-cream/60"
          }`}
        >
          {label} <span className="ml-1 text-muted">{count(key)}</span>
        </button>
      ))}
    </div>
  );
}

/** What the file picker offers, and what the backend accepts. */
export const PHOTO_TYPES = "image/jpeg,image/png,image/webp,image/avif";
