"use client";

import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { piercingAlt } from "@/lib/piercing";
import { localized, type Piercing } from "@/lib/types";
import { WorkModal } from "./WorkModal";

type Props = {
  lang: Locale;
  t: Dictionary["piercing"];
  piercing: Piercing;
  /** place among the piercings now showing, e.g. "3 / 16" */
  position: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

/**
 * Details of one piercing, in the window the tattoos open (WorkModal): the
 * photo; where it sits, under the zone it belongs to; the artist, a booking
 * button and previous / next.
 */
export function PiercingModal({ lang, t, piercing, ...rest }: Props) {
  const m = t.modal;
  const { place } = piercing;

  return (
    <WorkModal
      lang={lang}
      copy={{
        aria: m.aria,
        eyebrow: m.eyebrow,
        by: m.piercedBy,
        viewProfile: m.viewProfile,
        book: m.bookSimilar,
        previous: m.previous,
        next: m.next,
        close: m.close,
      }}
      id={piercing.id}
      photo={piercing.image}
      alt={piercingAlt(piercing, t, lang)}
      // "Ear" over "Helix"; a place outside any zone is simply the "Placement"
      label={place?.zone ? localized(place.zone.name, lang) : m.placeLabel}
      heading={place ? localized(place.name, lang) : ""}
      artist={piercing.artist}
      // the booking form opens with "Piercing" picked
      service="piercing"
      {...rest}
    />
  );
}
