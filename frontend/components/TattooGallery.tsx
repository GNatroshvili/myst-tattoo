"use client";

import { useId, useState } from "react";
import { displayCase, localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { artists, tattooStyles, works, type TattooStyle } from "@/lib/portfolio";
import { FilterChip } from "./FilterChip";
import { TattooModal } from "./TattooModal";
import { WorkTile } from "./WorkTile";

/**
 * The tattoos page's portfolio: artist and style filters, a count of what is
 * showing, the masonry gallery, and a prompt when a combination has no work.
 * Picking a tattoo opens its details, which step through what is showing.
 */
export function TattooGallery({ lang, t }: { lang: Locale; t: Dictionary["tattoos"] }) {
  const [artist, setArtist] = useState<number | "all">("all");
  const [style, setStyle] = useState<TattooStyle | "all">("all");
  /** position, among the tattoos showing, of the one whose details are open */
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();

  const artistNames = artists.map((_, i) => t.artistPlaceholder.replace("{n}", String(i + 1)));
  const shown = works
    .map((work, index) => ({ ...work, index }))
    .filter(
      (work) => (artist === "all" || work.artist === artist) && (style === "all" || work.style === style)
    );
  const countLabel =
    shown.length === 1 ? t.countOne : t.countMany.replace("{count}", String(shown.length));
  const opened = open !== null && open < shown.length ? shown[open] : null;

  // Georgian labels are longer, so their column is a little wider
  const label = `caps label-caps ${lang === "ka" ? "flex-[0_0_88px]" : "flex-[0_0_66px]"}`;
  const row = "flex flex-wrap items-center gap-x-[18px] gap-y-2.5";
  const chips = "flex flex-[1_1_300px] flex-wrap gap-2.5";

  return (
    <>
      <section
        aria-label={t.filtersAria}
        className="mt-[52px] flex flex-col gap-3.5 border-y border-cream/18 py-[22px]"
      >
        <div className={row}>
          <span id={`${id}-artist`} className={label}>
            {displayCase(t.artistLabel, lang)}
          </span>
          <div role="group" aria-labelledby={`${id}-artist`} className={chips}>
            <FilterChip on={artist === "all"} onPick={() => setArtist("all")}>
              {t.allArtists}
            </FilterChip>
            {artistNames.map((name, i) => (
              <FilterChip key={artists[i].id} on={artist === i} onPick={() => setArtist(i)}>
                {name}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className={row}>
          <span id={`${id}-style`} className={label}>
            {displayCase(t.styleLabel, lang)}
          </span>
          <div role="group" aria-labelledby={`${id}-style`} className={chips}>
            <FilterChip on={style === "all"} onPick={() => setStyle("all")}>
              {t.allStyles}
            </FilterChip>
            {tattooStyles.map((key) => (
              <FilterChip key={key} on={style === key} onPick={() => setStyle(key)}>
                {t.styles[key]}
              </FilterChip>
            ))}
          </div>
        </div>
      </section>

      <p aria-live="polite" className="ml-1 mt-[22px] text-[14px] leading-5 text-muted">
        {countLabel}
      </p>

      <section aria-label={t.galleryAria} className="mt-3.5 columns-[4_220px] gap-x-6">
        {shown.map((work, position) => (
          <WorkTile
            key={work.index}
            ratio={work.ratio}
            aria={t.modal.open}
            photoLabel={displayCase(t.photoLabel, lang)}
            title={t.styles[work.style]}
            note={artistNames[work.artist]}
            onOpen={() => setOpen(position)}
          />
        ))}
      </section>

      {shown.length === 0 && (
        <div className="mt-1.5 flex flex-col items-center gap-3.5 rounded-[18px] border border-cream/18 px-6 py-12 text-center">
          <p className="display text-[length:calc(32px*var(--display-scale))] leading-9 text-cream">
            {displayCase(t.emptyTitle, lang)}
          </p>
          <p className="text-[16px] font-light leading-6 text-body">{t.emptyText}</p>
          <button
            type="button"
            onClick={() => {
              setArtist("all");
              setStyle("all");
            }}
            className="btn btn-outline px-7"
          >
            {t.showAll}
          </button>
        </div>
      )}

      {opened && open !== null && (
        <TattooModal
          lang={lang}
          t={t}
          style={t.styles[opened.style]}
          artist={artistNames[opened.artist]}
          artistHref={localePath(lang, `/artists/${artists[opened.artist].id}`)}
          position={`${open + 1} / ${shown.length}`}
          onClose={() => setOpen(null)}
          onPrev={() => setOpen((at) => at === null ? at : (at - 1 + shown.length) % shown.length)}
          onNext={() => setOpen((at) => at === null ? at : (at + 1) % shown.length)}
        />
      )}
    </>
  );
}
