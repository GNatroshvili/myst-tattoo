"use client";

import { useId, useState, type ReactNode } from "react";
import { displayCase, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { artists, tattooStyles, works, type TattooStyle } from "@/lib/portfolio";
import { PhotoPlaceholder } from "./PhotoPlaceholder";
import { TattooIcon } from "./ui/Icons";

/** Filter pill; the picked one gets the form's gold "selected" look. */
function Chip({ on, onPick, children }: { on: boolean; onPick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onPick}
      className={`h-11 rounded-full border px-5 text-[13.5px] font-semibold text-white transition-colors ${
        on ? "border-gold bg-raised" : "border-line/35 bg-well hover:border-line/60"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * The tattoos page's portfolio: artist and style filters, a count of what is
 * showing, the masonry gallery, and a prompt when a combination has no work.
 */
export function TattooGallery({ lang, t }: { lang: Locale; t: Dictionary["tattoos"] }) {
  const [artist, setArtist] = useState<number | "all">("all");
  const [style, setStyle] = useState<TattooStyle | "all">("all");
  const id = useId();

  const artistNames = artists.map((_, i) => t.artistPlaceholder.replace("{n}", String(i + 1)));
  const shown = works
    .map((work, index) => ({ ...work, index }))
    .filter(
      (work) => (artist === "all" || work.artist === artist) && (style === "all" || work.style === style)
    );
  const countLabel =
    shown.length === 1 ? t.countOne : t.countMany.replace("{count}", String(shown.length));

  // Georgian labels are longer, so their column is a little wider
  const label = `caps text-[11px] leading-4 tracking-[3px] text-petal-500 ${
    lang === "ka" ? "flex-[0_0_84px]" : "flex-[0_0_62px]"
  }`;
  const row = "flex flex-wrap items-center gap-x-[18px] gap-y-2.5";
  const chips = "flex flex-[1_1_300px] flex-wrap gap-[9px]";

  return (
    <>
      <section
        aria-label={t.filtersAria}
        className="mt-12 flex flex-col gap-3.5 rounded-[18px] border border-white/[0.03] bg-surface px-6 py-5"
      >
        <div className={row}>
          <span id={`${id}-artist`} className={label}>
            {displayCase(t.artistLabel, lang)}
          </span>
          <div role="group" aria-labelledby={`${id}-artist`} className={chips}>
            <Chip on={artist === "all"} onPick={() => setArtist("all")}>
              {t.allArtists}
            </Chip>
            {artistNames.map((name, i) => (
              <Chip key={artists[i].id} on={artist === i} onPick={() => setArtist(i)}>
                {name}
              </Chip>
            ))}
          </div>
        </div>

        <div className={row}>
          <span id={`${id}-style`} className={label}>
            {displayCase(t.styleLabel, lang)}
          </span>
          <div role="group" aria-labelledby={`${id}-style`} className={chips}>
            <Chip on={style === "all"} onPick={() => setStyle("all")}>
              {t.allStyles}
            </Chip>
            {tattooStyles.map((key) => (
              <Chip key={key} on={style === key} onPick={() => setStyle(key)}>
                {t.styles[key]}
              </Chip>
            ))}
          </div>
        </div>
      </section>

      <p aria-live="polite" className="ml-1 mt-[22px] text-[13px] leading-5 text-mist-600">
        {countLabel}
      </p>

      <section aria-label={t.galleryAria} className="mt-3.5 columns-[4_220px] gap-x-[22px]">
        {shown.map((work) => (
          <figure key={work.index} className="mb-6 break-inside-avoid">
            <PhotoPlaceholder
              ratio={work.ratio}
              aria={t.photoAria}
              label={displayCase(t.photoLabel, lang)}
              icon={<TattooIcon className="h-10 w-10 text-orchid" />}
            />
            <figcaption className="flex flex-wrap items-baseline justify-between gap-x-2.5 gap-y-0.5 px-1 pt-2.5">
              <span className="text-[14px] font-semibold leading-5 text-[#f3e9f6]">
                {t.styles[work.style]}
              </span>
              <span className="text-[12.5px] leading-5 text-mist-600">{artistNames[work.artist]}</span>
            </figcaption>
          </figure>
        ))}
      </section>

      {shown.length === 0 && (
        <div className="mt-1.5 flex flex-col items-center gap-3.5 rounded-[18px] border border-line/28 px-6 py-11 text-center">
          <p className="display text-[length:calc(30px*var(--display-scale))] leading-[34px] text-petal-100">
            {displayCase(t.emptyTitle, lang)}
          </p>
          <p className="text-[14px] leading-[22px] text-mist-400">{t.emptyText}</p>
          <button
            type="button"
            onClick={() => {
              setArtist("all");
              setStyle("all");
            }}
            className="btn btn-outline h-11 px-6 text-[14px]"
          >
            {t.showAll}
          </button>
        </div>
      )}
    </>
  );
}
