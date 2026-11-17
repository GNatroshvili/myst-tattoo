"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import Link from "next/link";
import { displayCase, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  PersonIcon,
  StarIcon,
  TattooIcon,
  XIcon,
} from "./ui/Icons";

type Props = {
  lang: Locale;
  t: Dictionary["tattoos"];
  /** the tattoo's style, as shown to the visitor */
  style: string;
  /** who tattooed it, and the address of their profile */
  artist: string;
  artistHref: string;
  /** place among the tattoos now showing, e.g. "3 / 16" */
  position: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

const step =
  "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-line/35 bg-well px-3.5 text-[13.5px] sm:px-4 font-semibold text-white transition-colors hover:border-line/60";
const smallCaps = "caps text-[11px] leading-4 tracking-[3px] text-petal-500";

/**
 * Details of one tattoo, over a dimmed and blurred page: the photo on the left;
 * its style, the artist, a booking button and previous / next on the right.
 * Closes on the cross, a click outside or Escape; the arrow keys step through.
 */
export function TattooModal({
  lang,
  t,
  style,
  artist,
  artistHref,
  position,
  onClose,
  onPrev,
  onNext,
}: Props) {
  const dialog = useRef<HTMLDivElement>(null);
  const m = t.modal;

  // While open: keyboard focus moves into the window and the page behind stops
  // scrolling. On close both go back to how they were.
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    dialog.current?.focus();
    return () => {
      root.style.overflow = overflow;
      opener?.focus({ preventScroll: true });
    };
  }, []);

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") onClose();
    else if (event.key === "ArrowLeft") onPrev();
    else if (event.key === "ArrowRight") onNext();
    else if (event.key === "Tab" && dialog.current) {
      // keep Tab inside the window
      const stops = dialog.current.querySelectorAll<HTMLElement>("a[href], button");
      const first = stops[0];
      const last = stops[stops.length - 1];
      const at = document.activeElement;
      if (event.shiftKey && (at === first || at === dialog.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && at === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  return (
    <div onKeyDown={onKeyDown} className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* the dimmed page: clicking it closes the window (keyboard users have the cross) */}
      <button
        type="button"
        aria-label={m.close}
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 h-full w-full border-0 bg-[rgba(8,3,8,0.8)] p-0 backdrop-blur-[6px]"
      />

      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label={m.aria}
        tabIndex={-1}
        className="relative flex max-h-[calc(100dvh-48px)] w-full max-w-[880px] flex-wrap overflow-auto rounded-[22px] border border-line/38 bg-surface text-mist-500 shadow-[0_30px_80px_rgba(0,0,0,0.6),0_0_40px_rgba(170,50,215,0.25)] outline-none"
      >
        <div
          role="img"
          aria-label={t.photoAria}
          className="flex aspect-[4/5] min-w-0 flex-[1_1_340px] flex-col items-center justify-center gap-3.5 bg-[linear-gradient(160deg,#2b1432_0%,#1b0f1c_55%,#120812_100%)]"
        >
          <TattooIcon strokeWidth={1.2} className="h-14 w-14 text-orchid" />
          <span className="caps text-[11px] leading-[14px] tracking-[3.4px] text-[#c9bacf]">
            {displayCase(t.photoLabel, lang)}
          </span>
        </div>

        <div className="flex min-w-0 flex-[1_1_300px] flex-col px-6 pb-[30px] pt-11 sm:px-9">
          <p className="caps text-[12px] leading-4 tracking-[4.4px] text-[#d3bbdb]">
            {displayCase(m.eyebrow, lang)}
          </p>

          <p className={`${smallCaps} mt-[30px]`}>{displayCase(t.styleLabel, lang)}</p>
          <h2
            className={`mt-1.5 font-display text-[length:calc(44px*var(--display-scale))] leading-[48px] tracking-[0.5px] text-petal-100 ${
              // the lighter Georgian cut matches Italiana's strokes
              lang === "ka" ? "font-light" : "font-normal"
            }`}
          >
            {style}
          </h2>

          {/* gold star with a line fading out to the right */}
          <div aria-hidden className="-ml-2 mt-[18px] flex items-center gap-1.5">
            <StarIcon className="h-7 w-7 text-gold drop-shadow-[0_0_6px_rgba(250,225,40,0.55)]" />
            <span className="block h-[1.5px] w-[130px] bg-gradient-to-r from-gold to-gold/0" />
          </div>

          <p className={`${smallCaps} mt-6`}>{displayCase(m.tattooedBy, lang)}</p>
          <div className="mb-6 mt-2.5 flex items-center gap-3.5">
            <span
              role="img"
              aria-label={m.artistPhotoAria}
              className="flex h-14 flex-[0_0_56px] items-center justify-center rounded-full border border-line/42 bg-[#24122a]"
            >
              <PersonIcon strokeWidth={1.8} className="h-[26px] w-[26px] text-orchid" />
            </span>
            <div className="min-w-0">
              <p className="text-[18px] font-semibold leading-6 text-white">{artist}</p>
              <Link
                href={artistHref}
                className="group inline-flex min-h-11 items-center gap-2 text-[14px] font-medium text-mist-200 transition-colors hover:text-gold"
              >
                {m.viewProfile}
                <ArrowRightIcon className="h-3 w-[18px] text-orchid-soft transition group-hover:translate-x-1 group-hover:text-gold" />
              </Link>
            </div>
          </div>

          {/* closes the window and scrolls to the page's booking panel */}
          <a href="#book" onClick={onClose} className="btn btn-gold mt-auto flex px-6">
            {m.bookSimilar} <ArrowUpRightIcon className="h-3.5 w-3.5" />
          </a>

          <div className="mt-[18px] flex items-center justify-between gap-2 sm:gap-3">
            <button type="button" onClick={onPrev} className={step}>
              <ArrowLeftIcon strokeWidth={1.6} className="h-[11px] w-4" />
              {m.previous}
            </button>
            <span className="whitespace-nowrap text-[13px] leading-5 text-mist-600">{position}</span>
            <button type="button" onClick={onNext} className={step}>
              {m.next}
              <ArrowRightIcon strokeWidth={1.6} className="h-[11px] w-4" />
            </button>
          </div>
        </div>

        <button
          type="button"
          aria-label={m.close}
          onClick={onClose}
          className="absolute right-3.5 top-3.5 flex h-11 w-11 items-center justify-center rounded-full border border-line/35 bg-well p-0 text-white transition-colors hover:border-gold hover:text-gold"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
