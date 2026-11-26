"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { bookPath, displayCase, localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { tattooAlt } from "@/lib/tattoos";
import { localized, type Tattoo } from "@/lib/types";
import { StarRule } from "./StarRule";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  PersonIcon,
  XIcon,
} from "./ui/Icons";

type Props = {
  lang: Locale;
  t: Dictionary["tattoos"];
  tattoo: Tattoo;
  /** place among the tattoos now showing, e.g. "3 / 16" */
  position: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

const step =
  "inline-flex h-11 shrink-0 items-center gap-2.5 rounded-full border border-cream/28 px-3.5 text-[15px] text-cream transition-colors hover:border-gold hover:text-gold sm:px-[18px]";

/**
 * Details of one tattoo, over a dimmed and blurred page: the photo on the left;
 * its style, the artist, a booking button and previous / next on the right.
 * Closes on the cross, a click outside or Escape; the arrow keys step through.
 */
export function TattooModal({ lang, t, tattoo, position, onClose, onPrev, onNext }: Props) {
  const dialog = useRef<HTMLDivElement>(null);
  const m = t.modal;
  const { artist } = tattoo;

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
        className="absolute inset-0 h-full w-full border-0 bg-[rgba(5,4,4,0.84)] p-0 backdrop-blur-[6px]"
      />

      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label={m.aria}
        tabIndex={-1}
        className="relative flex max-h-[calc(100dvh-48px)] w-full max-w-[900px] flex-wrap overflow-auto rounded-[18px] border border-cream/18 bg-surface text-body shadow-[0_30px_80px_rgba(0,0,0,0.7)] outline-none"
      >
        {/* the whole photo, uncropped, on the dark ground */}
        <div className="relative aspect-[4/5] min-w-0 flex-[1_1_340px] bg-[linear-gradient(160deg,#24131b_0%,#150e11_55%,#0c0a0b_100%)]">
          <Image
            key={tattoo.id}
            src={tattoo.image.full}
            alt={tattooAlt(tattoo, t, lang)}
            fill
            unoptimized
            className="object-contain"
            draggable={false}
          />
        </div>

        <div className="flex min-w-0 flex-[1_1_300px] flex-col px-6 pb-[30px] pt-[46px] sm:px-[38px]">
          <p className="caps eyebrow">{displayCase(m.eyebrow, lang)}</p>

          <p className="caps label-caps mt-8">{displayCase(t.styleLabel, lang)}</p>
          <h2
            className={`mt-2 font-display text-[length:calc(46px*var(--display-scale))] leading-[48px] tracking-[0.5px] text-cream ${
              // the lighter Georgian cut matches Italiana's strokes
              lang === "ka" ? "font-light" : "font-normal"
            }`}
          >
            {tattoo.style ? localized(tattoo.style.name, lang) : ""}
          </h2>

          <StarRule className="-ml-[5px] mt-5" star="h-[26px] w-[26px]" />

          {artist && (
            <>
              <p className="caps label-caps mt-[26px]">{displayCase(m.tattooedBy, lang)}</p>
              <div className="mb-6 mt-3 flex items-center gap-4">
                <span className="relative flex h-14 flex-[0_0_56px] items-center justify-center overflow-hidden rounded-full border border-cream/22 bg-[#1b1116]">
                  {artist.photo ? (
                    <Image src={artist.photo.thumb} alt="" fill unoptimized className="object-cover" />
                  ) : (
                    <PersonIcon strokeWidth={1.8} className="h-[26px] w-[26px] text-rose" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-[19px] font-medium leading-6 text-cream">{localized(artist.nickname, lang)}</p>
                  <Link
                    href={localePath(lang, `/artists/${artist.slug}`)}
                    className="link-arrow min-h-11 gap-2.5 text-[15px]"
                  >
                    {m.viewProfile}
                    <ArrowRightIcon className="h-3 w-[18px]" />
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* closes the window on the way to the booking page, so coming back finds the gallery */}
          <Link href={bookPath(lang)} onClick={onClose} className="btn btn-gold mt-auto flex px-6">
            {m.bookSimilar} <ArrowUpRightIcon className="h-[13px] w-[13px]" />
          </Link>

          <div className="mt-[18px] flex items-center justify-between gap-2 sm:gap-3">
            <button type="button" onClick={onPrev} className={step}>
              <ArrowLeftIcon className="h-3 w-[18px]" />
              {m.previous}
            </button>
            <span className="whitespace-nowrap text-[14px] leading-5 text-muted">{position}</span>
            <button type="button" onClick={onNext} className={step}>
              {m.next}
              <ArrowRightIcon className="h-3 w-[18px]" />
            </button>
          </div>
        </div>

        <button
          type="button"
          aria-label={m.close}
          onClick={onClose}
          className="absolute right-3.5 top-3.5 flex h-11 w-11 items-center justify-center rounded-full border border-cream/28 bg-surface p-0 text-cream transition-colors hover:border-gold hover:text-gold"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
