"use client";

import { useState } from "react";
import { displayCase, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { piercingWorks, placements, type Placement } from "@/lib/piercing";
import { FilterChip } from "./FilterChip";
import { WorkTile } from "./WorkTile";

/**
 * Piercings done at the studio: one row of placement filters, a count, and the
 * masonry gallery.
 */
export function PiercingWorks({ lang, t }: { lang: Locale; t: Dictionary["piercing"] }) {
  const [placement, setPlacement] = useState<Placement | "all">("all");

  const shown = piercingWorks
    .map((work, index) => ({ ...work, index }))
    .filter((work) => placement === "all" || work.placement === placement);
  const countLabel =
    shown.length === 1 ? t.countOne : t.countMany.replace("{count}", String(shown.length));

  return (
    <>
      <div
        role="group"
        aria-label={t.filterAria}
        className="mt-[26px] flex flex-wrap justify-center gap-2.5"
      >
        <FilterChip on={placement === "all"} onPick={() => setPlacement("all")}>
          {t.all}
        </FilterChip>
        {placements.map((key) => (
          <FilterChip key={key} on={placement === key} onPick={() => setPlacement(key)}>
            {t.placements[key]}
          </FilterChip>
        ))}
      </div>

      <p aria-live="polite" className="ml-1 mt-6 text-[14px] leading-5 text-muted">
        {countLabel}
      </p>

      <div className="mt-3.5 columns-[4_220px] gap-x-6">
        {shown.map((work) => (
          <WorkTile
            key={work.index}
            ratio={work.ratio}
            aria={t.photoAria}
            photoLabel={displayCase(t.photoLabel, lang)}
            title={t.placements[work.placement]}
            note={t.placeholder.jewellery}
            tone="wine"
          />
        ))}
      </div>
    </>
  );
}
