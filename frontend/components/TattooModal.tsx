"use client";

import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { tattooAlt } from "@/lib/tattoos";
import { localized, type Tattoo } from "@/lib/types";
import { WorkModal } from "./WorkModal";

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

/**
 * Details of one tattoo: the photo; its style, the artist, a booking button
 * and previous / next. The window itself is WorkModal, shared with piercings.
 */
export function TattooModal({ lang, t, tattoo, ...rest }: Props) {
  const m = t.modal;

  return (
    <WorkModal
      lang={lang}
      copy={{
        aria: m.aria,
        eyebrow: m.eyebrow,
        by: m.tattooedBy,
        viewProfile: m.viewProfile,
        book: m.bookSimilar,
        previous: m.previous,
        next: m.next,
        close: m.close,
      }}
      id={tattoo.id}
      photo={tattoo.image}
      alt={tattooAlt(tattoo, t, lang)}
      label={t.styleLabel}
      heading={tattoo.style ? localized(tattoo.style.name, lang) : ""}
      artist={tattoo.artist}
      {...rest}
    />
  );
}
