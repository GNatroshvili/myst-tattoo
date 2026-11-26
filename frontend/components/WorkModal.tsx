"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { bookPath, displayCase, localePath, type BookService, type Locale } from "@/lib/i18n/config";
import { localized, type ArtistBrief, type Photo } from "@/lib/types";
import { StarRule } from "./StarRule";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  PersonIcon,
  XIcon,
} from "./ui/Icons";

/** The window's own words; a gallery passes its dictionary's. */
export type WorkModalCopy = {
  /** what a screen reader calls the window: "Tattoo details" */
  aria: string;
  /** the small line at the top: "Myst / Tattoo" */
  eyebrow: string;
  /** over the artist: "Tattooed by" */
  by: string;
  viewProfile: string;
  /** the booking button: "Book a similar tattoo" */
  book: string;
  previous: string;
  next: string;
  close: string;
};

type Props = {
  lang: Locale;
  copy: WorkModalCopy;
  /** the piece shown: tells one photo from the next as the window steps through */
  id: string;
  photo: Photo;
  /** what the photo shows, in words */
  alt: string;
  /** the small line over the heading: "Style", or the zone a piercing is in */
  label: string;
  /** the large line: the tattoo's style, or where the piercing sits */
  heading: string;
  /** who did it; without one that part is left out */
  artist: ArtistBrief | null;
  /** the service the booking form opens on; without one it is the form's first, the tattoo consultation */
  service?: BookService;
  /** place among the pieces now showing, e.g. "3 / 16" */
  position: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

const step =
  "inline-flex h-11 shrink-0 items-center gap-2.5 rounded-full border border-cream/28 px-3.5 text-[15px] text-cream transition-colors hover:border-gold hover:text-gold sm:px-[18px]";

/**
 * Details of one piece of work, over a dimmed and blurred page: the photo on
 * the left; what it is, the artist, a booking button and previous / next on
 * the right. The tattoo gallery and the piercing gallery both open it
 * (TattooModal, PiercingModal).
 * Closes on the cross, a click outside or Escape; the arrow keys step through.
 */
export function WorkModal({
  lang,
  copy,
  id,
  photo,
  alt,
  label,
  heading,
  artist,
  service,
  position,
  onClose,
  onPrev,
  onNext,
}: Props) {
  const dialog = useRef<HTMLDivElement>(null);

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
        aria-label={copy.close}
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 h-full w-full border-0 bg-[rgba(5,4,4,0.84)] p-0 backdrop-blur-[6px]"
      />

      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label={copy.aria}
        tabIndex={-1}
        className="relative flex max-h-[calc(100dvh-48px)] w-full max-w-[900px] flex-wrap overflow-auto rounded-[18px] border border-cream/18 bg-surface text-body shadow-[0_30px_80px_rgba(0,0,0,0.7)] outline-none"
      >
        {/* the whole photo, uncropped, on the dark ground */}
        <div className="relative aspect-[4/5] min-w-0 flex-[1_1_340px] bg-[linear-gradient(160deg,#24131b_0%,#150e11_55%,#0c0a0b_100%)]">
          <Image
            key={id}
            src={photo.full}
            alt={alt}
            fill
            unoptimized
            className="object-contain"
            draggable={false}
          />
        </div>

        <div className="flex min-w-0 flex-[1_1_300px] flex-col px-6 pb-[30px] pt-[46px] sm:px-[38px]">
          <p className="caps eyebrow">{displayCase(copy.eyebrow, lang)}</p>

          <p className="caps label-caps mt-8">{displayCase(label, lang)}</p>
          <h2
            className={`mt-2 font-display text-[length:calc(46px*var(--display-scale))] leading-[48px] tracking-[0.5px] text-cream ${
              // the lighter Georgian cut matches Italiana's strokes
              lang === "ka" ? "font-light" : "font-normal"
            }`}
          >
            {heading}
          </h2>

          <StarRule className="-ml-[5px] mt-5" star="h-[26px] w-[26px]" />

          {artist && (
            <>
              <p className="caps label-caps mt-[26px]">{displayCase(copy.by, lang)}</p>
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
                    {copy.viewProfile}
                    <ArrowRightIcon className="h-3 w-[18px]" />
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* closes the window on the way to the booking page, so coming back finds the gallery */}
          <Link href={bookPath(lang, { service })} onClick={onClose} className="btn btn-gold mt-auto flex px-6">
            {copy.book} <ArrowUpRightIcon className="h-[13px] w-[13px]" />
          </Link>

          <div className="mt-[18px] flex items-center justify-between gap-2 sm:gap-3">
            <button type="button" onClick={onPrev} className={step}>
              <ArrowLeftIcon className="h-3 w-[18px]" />
              {copy.previous}
            </button>
            <span className="whitespace-nowrap text-[14px] leading-5 text-muted">{position}</span>
            <button type="button" onClick={onNext} className={step}>
              {copy.next}
              <ArrowRightIcon className="h-3 w-[18px]" />
            </button>
          </div>
        </div>

        <button
          type="button"
          aria-label={copy.close}
          onClick={onClose}
          className="absolute right-3.5 top-3.5 flex h-11 w-11 items-center justify-center rounded-full border border-cream/28 bg-surface p-0 text-cream transition-colors hover:border-gold hover:text-gold"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
