"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { localized, type PiercingZone } from "@/lib/types";

/**
 * Piercing zones and the price list of the picked one. The first zone is
 * picked to begin with. Zones, places and prices come from the admin panel,
 * with their names in both languages; the page shows its own.
 *
 * From 918px, where both fit, the zones stand in a column on the left and the
 * list on the right. Below that the zones lie in one row above the list, which
 * takes the page's full width; a row too long for the screen scrolls sideways.
 */
export function PiercingPrices({
  lang,
  t,
  zones,
}: {
  lang: Locale;
  t: Dictionary["piercing"];
  zones: PiercingZone[];
}) {
  const [picked, setPicked] = useState(zones[0]?.id);
  const zone = zones.find((z) => z.id === picked) ?? zones[0];
  if (!zone) return null;

  return (
    <section
      aria-label={t.pricesAria}
      className="flex flex-col gap-y-8 pt-[30px] min-[918px]:flex-row min-[918px]:items-start min-[918px]:justify-between min-[918px]:gap-x-16 lg:pl-5"
    >
      {/* The padding (undone by the margin) leaves room for a button's focus
          ring, which a scrolling box would otherwise cut off. On phones the
          buttons are a little tighter, so three Georgian names fit on 360px.
          The row scrolls without showing a scrollbar. */}
      <div
        role="group"
        aria-label={t.zonesAria}
        className="-m-1 flex gap-3 overflow-x-auto p-1 [scrollbar-width:none] max-sm:gap-2.5 [&::-webkit-scrollbar]:hidden min-[918px]:m-0 min-[918px]:flex-none min-[918px]:flex-col min-[918px]:items-stretch min-[918px]:gap-4 min-[918px]:overflow-visible min-[918px]:p-0 min-[918px]:pt-1"
      >
        {zones.map(({ id, name }) => {
          const on = id === zone.id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => setPicked(id)}
              className={`h-12 shrink-0 whitespace-nowrap rounded-full border-[1.5px] border-gold px-5 text-left text-[17px] font-medium sm:px-7 sm:text-[18px] transition-colors min-[918px]:min-w-[190px] ${
                on ? "bg-gold text-on-gold" : "text-gold hover:bg-gold/10"
              }`}
            >
              {localized(name, lang)}
            </button>
          );
        })}
      </div>

      <div className="min-w-0 min-[918px]:flex-[0_1_600px]">
        <p className="mx-1 mb-[22px] text-[18px] font-light leading-[26px] text-cream lg:text-right">
          {t.priceNote}
        </p>
        <div aria-live="polite">
          {zone.places.length === 0 ? (
            <p className="border-y border-cream/18 px-1 py-6 text-[16px] font-light leading-6 text-muted">
              {t.noPlaces}
            </p>
          ) : (
            <ul className="border-t border-cream/18">
              {zone.places.map((place) => {
                const note = localized(place.note, lang);
                return (
                  <li
                    key={place.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-cream/18 px-1 py-4"
                  >
                    <div className="min-w-0">
                      <h3 className="break-words text-[20px] font-medium leading-[26px] text-cream">
                        {localized(place.name, lang)}
                      </h3>
                      {note && (
                        <p className="mt-[3px] text-[14.5px] font-light leading-5 text-muted">{note}</p>
                      )}
                    </div>
                    <span className="whitespace-nowrap text-[16px] leading-[26px] text-cream">
                      {place.price}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
