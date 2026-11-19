"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { tattooAlt } from "@/lib/tattoos";
import { localized, type Style, type Tattoo } from "@/lib/types";
import { FilterChip } from "./FilterChip";
import { WorkTile } from "./WorkTile";

type Props = {
  lang: Locale;
  t: Dictionary["artist"];
  tattoosCopy: Dictionary["tattoos"];
  /** everything this artist has tattooed, newest first */
  tattoos: Tattoo[];
};

/**
 * An artist's own work on their profile: one row of style filters (only the
 * styles this artist has tattooed), a count, and the masonry gallery.
 */
export function ArtistWorks({ lang, t, tattoosCopy, tattoos }: Props) {
  const [style, setStyle] = useState("all");

  if (tattoos.length === 0) {
    return <p className="mt-9 text-center text-[16px] font-light leading-6 text-muted">{t.noWorks}</p>;
  }

  const styles = new Map<string, Style>();
  for (const tattoo of tattoos) if (tattoo.style) styles.set(tattoo.style.id, tattoo.style);
  const shown = tattoos.filter((tattoo) => style === "all" || tattoo.style?.id === style);
  const countLabel =
    shown.length === 1 ? t.countOne : t.countMany.replace("{count}", String(shown.length));

  return (
    <>
      <div role="group" aria-label={t.filterAria} className="mt-7 flex flex-wrap justify-center gap-2.5">
        <FilterChip on={style === "all"} onPick={() => setStyle("all")}>
          {t.allWorks}
        </FilterChip>
        {[...styles.values()].map((s) => (
          <FilterChip key={s.id} on={style === s.id} onPick={() => setStyle(s.id)}>
            {localized(s.name, lang)}
          </FilterChip>
        ))}
      </div>

      <p aria-live="polite" className="ml-1 mt-6 text-[14px] leading-5 text-muted">
        {countLabel}
      </p>

      <div className="work-grid mt-3.5">
        {shown.map((tattoo) => (
          <WorkTile
            key={tattoo.id}
            photo={tattoo.image}
            aria={tattooAlt(tattoo, tattoosCopy, lang)}
            title={tattoo.style ? localized(tattoo.style.name, lang) : ""}
          />
        ))}
      </div>
    </>
  );
}
