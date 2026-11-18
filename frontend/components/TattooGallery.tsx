"use client";

import { useId, useState } from "react";
import { displayCase, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { tattooAlt } from "@/lib/tattoos";
import { localized, photoRatio, type ArtistBrief, type Style, type Tattoo } from "@/lib/types";
import { EmptyNote } from "./EmptyNote";
import { FilterChip } from "./FilterChip";
import { TattooModal } from "./TattooModal";
import { WorkTile } from "./WorkTile";

type Props = {
  lang: Locale;
  t: Dictionary["tattoos"];
  /** every tattoo, newest first */
  tattoos: Tattoo[];
};

/** The distinct values of `pick` across the tattoos, in the order they first appear. */
function distinct<T extends { id: string }>(tattoos: Tattoo[], pick: (tattoo: Tattoo) => T | null) {
  const seen = new Map<string, T>();
  for (const tattoo of tattoos) {
    const value = pick(tattoo);
    if (value && !seen.has(value.id)) seen.set(value.id, value);
  }
  return [...seen.values()];
}

/**
 * The tattoos page's portfolio: artist and style filters, a count of what is
 * showing, the masonry gallery, and a prompt when a combination has no work.
 * Picking a tattoo opens its details, which step through what is showing.
 */
export function TattooGallery({ lang, t, tattoos }: Props) {
  const [artist, setArtist] = useState("all");
  const [style, setStyle] = useState("all");
  /** position, among the tattoos showing, of the one whose details are open */
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();

  if (tattoos.length === 0) {
    return <EmptyNote lang={lang} title={t.noneTitle} text={t.noneText} className="mt-[52px]" />;
  }

  // only artists and styles that have work here, so no filter starts out empty
  const artists = distinct<ArtistBrief>(tattoos, (tattoo) => tattoo.artist);
  const styles = distinct<Style>(tattoos, (tattoo) => tattoo.style);
  const shown = tattoos.filter(
    (tattoo) =>
      (artist === "all" || tattoo.artist?.id === artist) && (style === "all" || tattoo.style?.id === style)
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
        {artists.length > 0 && (
          <div className={row}>
            <span id={`${id}-artist`} className={label}>
              {displayCase(t.artistLabel, lang)}
            </span>
            <div role="group" aria-labelledby={`${id}-artist`} className={chips}>
              <FilterChip on={artist === "all"} onPick={() => setArtist("all")}>
                {t.allArtists}
              </FilterChip>
              {artists.map((a) => (
                <FilterChip key={a.id} on={artist === a.id} onPick={() => setArtist(a.id)}>
                  {localized(a.nickname, lang)}
                </FilterChip>
              ))}
            </div>
          </div>
        )}

        <div className={row}>
          <span id={`${id}-style`} className={label}>
            {displayCase(t.styleLabel, lang)}
          </span>
          <div role="group" aria-labelledby={`${id}-style`} className={chips}>
            <FilterChip on={style === "all"} onPick={() => setStyle("all")}>
              {t.allStyles}
            </FilterChip>
            {styles.map((s) => (
              <FilterChip key={s.id} on={style === s.id} onPick={() => setStyle(s.id)}>
                {localized(s.name, lang)}
              </FilterChip>
            ))}
          </div>
        </div>
      </section>

      <p aria-live="polite" className="ml-1 mt-[22px] text-[14px] leading-5 text-muted">
        {countLabel}
      </p>

      <section aria-label={t.galleryAria} className="mt-3.5 columns-[4_220px] gap-x-6">
        {shown.map((tattoo, position) => (
          <WorkTile
            key={tattoo.id}
            ratio={photoRatio(tattoo.image)}
            photo={tattoo.image}
            aria={`${t.modal.open}: ${tattooAlt(tattoo, t, lang)}`}
            title={tattoo.style ? localized(tattoo.style.name, lang) : ""}
            note={tattoo.artist ? localized(tattoo.artist.nickname, lang) : undefined}
            onOpen={() => setOpen(position)}
          />
        ))}
      </section>

      {shown.length === 0 && (
        <EmptyNote lang={lang} title={t.emptyTitle} text={t.emptyText} className="mt-1.5">
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
        </EmptyNote>
      )}

      {opened && open !== null && (
        <TattooModal
          lang={lang}
          t={t}
          tattoo={opened}
          position={`${open + 1} / ${shown.length}`}
          onClose={() => setOpen(null)}
          onPrev={() => setOpen((at) => (at === null ? at : (at - 1 + shown.length) % shown.length))}
          onNext={() => setOpen((at) => (at === null ? at : (at + 1) % shown.length))}
        />
      )}
    </>
  );
}
