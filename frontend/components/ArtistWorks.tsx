"use client";

import { useState } from "react";
import { displayCase, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { tattooStyles, works, type TattooStyle } from "@/lib/portfolio";
import { FilterChip } from "./FilterChip";
import { WorkTile } from "./WorkTile";

type Props = {
  lang: Locale;
  /** position of the artist in `artists` */
  artist: number;
  t: Dictionary["artist"];
  tattoos: Dictionary["tattoos"];
};

/**
 * An artist's own work on their profile: one row of style filters (only the
 * styles this artist has tattooed), a count, and the masonry gallery.
 */
export function ArtistWorks({ lang, artist, t, tattoos }: Props) {
  const [style, setStyle] = useState<TattooStyle | "all">("all");

  const mine = works.map((work, index) => ({ ...work, index })).filter((work) => work.artist === artist);
  const styles = tattooStyles.filter((key) => mine.some((work) => work.style === key));
  const shown = mine.filter((work) => style === "all" || work.style === style);
  const countLabel =
    shown.length === 1 ? t.countOne : t.countMany.replace("{count}", String(shown.length));

  return (
    <>
      <div role="group" aria-label={t.filterAria} className="mt-7 flex flex-wrap justify-center gap-2.5">
        <FilterChip on={style === "all"} onPick={() => setStyle("all")}>
          {t.allWorks}
        </FilterChip>
        {styles.map((key) => (
          <FilterChip key={key} on={style === key} onPick={() => setStyle(key)}>
            {tattoos.styles[key]}
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
            aria={tattoos.photoAria}
            photoLabel={displayCase(tattoos.photoLabel, lang)}
            title={tattoos.styles[work.style]}
            note={t.placeholder.placement}
          />
        ))}
      </div>
    </>
  );
}
