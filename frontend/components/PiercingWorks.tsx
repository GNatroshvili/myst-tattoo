"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { piercingAlt } from "@/lib/piercing";
import { photoRatio, type Piercing } from "@/lib/types";
import { FilterChip } from "./FilterChip";
import { WorkTile } from "./WorkTile";

/**
 * Piercings done at the studio: one row of zone filters (only the zones that
 * have photos), a count, and the masonry gallery. Each tile names the place
 * and, when the piercing is attached to one, the artist.
 */
export function PiercingWorks({ t, piercings }: { t: Dictionary["piercing"]; piercings: Piercing[] }) {
  const [zone, setZone] = useState("all");

  const zones = new Map<string, string>();
  for (const { place } of piercings) if (place?.zone) zones.set(place.zone.id, place.zone.name);
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

      <div className="mt-3.5 columns-[4_220px] gap-x-6">
        {shown.map((piercing) => (
          <WorkTile
            key={piercing.id}
            ratio={photoRatio(piercing.image)}
            photo={piercing.image}
            aria={piercingAlt(piercing, t)}
            title={piercing.place?.name ?? ""}
            note={piercing.artist?.nickname}
          />
        ))}
      </div>
    </>
  );
}
