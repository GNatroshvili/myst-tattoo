"use client";

import { useId, useState, type FormEvent } from "react";
import { displayCase, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { buildCourseMessage, whatsappUrl } from "@/lib/whatsapp";
import { InstagramIcon, WhatsAppIcon } from "./ui/Icons";

type Props = {
  lang: Locale;
  /** the course's title in the page's language: the message names it */
  course: string;
  /** where "Instagram DM" leads */
  instagramUrl: string;
  t: Dictionary["course"]["signup"];
  className?: string;
};

/**
 * The course page's sign-up panel, across the page under the text: what it is
 * for on the left, the form on the right (under it on narrow screens). Like
 * the booking form on the home page, it sends nothing by itself: the
 * visitor's name and question become a ready-made WhatsApp message to the
 * studio, which opens for them to send. Carries the `signup` anchor that the
 * button beside the text scrolls to.
 */
export function CourseSignup({ lang, course, instagramUrl, t, className = "" }: Props) {
  // unique per instance: a hidden copy of the page can share the document
  const id = useId();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const message = buildCourseMessage({ course, name, note }, t.message);
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  }

  return (
    <section
      id="signup"
      aria-labelledby={`${id}-title`}
      // Phones: the words, the form, then the other way to write. From tablets
      // up the form stands on the right, beside the words and that button.
      className={`voucher-panel grid scroll-mt-6 grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-7 px-6 py-9 md:grid-cols-[minmax(0,1fr)_minmax(0,460px)] md:gap-y-6 md:py-11 md:pl-[52px] md:pr-11 ${className}`}
    >
      <div className="md:self-end">
        <p className="caps label-caps">{displayCase(t.label, lang)}</p>
        <h2
          id={`${id}-title`}
          className="display mt-4 text-[length:calc(clamp(38px,4.2vw,54px)*var(--display-scale))] leading-[0.98] tracking-[0.5px] text-cream"
        >
          {displayCase(t.titleLine1, lang)}
          <br />
          {displayCase(t.titleLine2, lang)}
        </h2>
        <p className="mt-4 max-w-[420px] text-[18px] font-light leading-[26px] text-body">{t.text}</p>
      </div>

      {/* a card of its own from tablets up; on phones the panel is frame enough */}
      <form
        onSubmit={handleSubmit}
        aria-label={t.aria}
        className="flex min-w-0 flex-col gap-2 md:col-start-2 md:row-span-2 md:row-start-1 md:self-center md:rounded-[18px] md:border md:border-cream/16 md:bg-surface md:px-7 md:pb-7 md:pt-6"
      >
        <label htmlFor={`${id}-name`} className="field-label">
          {t.name}
        </label>
        <input
          id={`${id}-name`}
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="field h-[46px] px-3.5"
        />

        <label htmlFor={`${id}-note`} className="field-label mt-3">
          {t.note} <span className="text-[12px] font-light text-muted">{t.optional}</span>
        </label>
        <textarea
          id={`${id}-note`}
          name="note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t.notePlaceholder}
          className="field h-[92px] min-h-[76px] resize-y px-3.5 py-3 font-light leading-[21px]"
        />

        <button type="submit" className="btn btn-gold mt-5 h-12 w-full">
          <WhatsAppIcon className="h-5 w-5" />
          {t.submit}
        </button>
      </form>

      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-outline btn-sm -mt-3.5 gap-2.5 md:col-start-1 md:row-start-2 md:mt-0 md:self-start md:justify-self-start"
      >
        <InstagramIcon className="h-5 w-5" strokeWidth={1.8} />
        {t.instagramDm}
      </a>
    </section>
  );
}
