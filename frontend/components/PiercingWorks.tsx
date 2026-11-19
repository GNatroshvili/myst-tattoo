"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { piercingAlt } from "@/lib/piercing";
import { localized, type Piercing } from "@/lib/types";
import { FilterChip } from "./FilterChip";
import { WorkTile } from "./WorkTile";

/**
 * Piercings done at the studio: one row of zone filters (only the zones that
 * have photos), a count, and the masonry gallery. Each tile names the place
 * and, when the piercing is attached to one, the artist.
 */
export function PiercingWorks({
  lang,
  t,
  piercings,
}: {
  lang: Locale;
  t: Dictionary["piercing"];
  piercings: Piercing[];
}) {
  const [zone, setZone] = useState("all");

  const zones = new Map<string, string>();
  for (const { place } of piercings) {
    if (place?.zone) zones.set(place.zone.id, localized(place.zone.name, lang));
  }
  const shown = piercings.filter((piercing) => zone === "all" || piercing.place?.zone?.id === zone);
  const countLabel =
    shown.length === 1 ? t.countOne : t.countMany.replace("{count}", String(shown.length));

  return (
    <>
      <div
        role="group"
        aria-label={t.filterAria}
        className="mt-[26px] flex flex-wrap justify-center gap-2.5"
      >
        <FilterChip on={zone === "all"} onPick={() => setZone("all")}>
          {t.all}
        </FilterChip>
        {[...zones].map(([id, name]) => (
          <FilterChip key={id} on={zone === id} onPick={() => setZone(id)}>
            {name}
          </FilterChip>
        ))}
      </div>

      <p aria-live="polite" className="ml-1 mt-6 text-[14px] leading-5 text-muted">
        {countLabel}
      </p>

      <div className="work-grid mt-3.5">
        {shown.map((piercing) => (
          <WorkTile
            key={piercing.id}
            photo={piercing.image}
            aria={piercingAlt(piercing, t, lang)}
            title={piercing.place ? localized(piercing.place.name, lang) : ""}
            note={piercing.artist ? localized(piercing.artist.nickname, lang) : undefined}
          />
        ))}
      </div>
    </>
  );
}
