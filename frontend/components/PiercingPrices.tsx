"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { PiercingZone } from "@/lib/types";

/**
 * Piercing zones beside the price list: the zones on the left, and on the
 * right the places of the picked zone with their prices. The first zone is
 * picked to begin with. Zones, places and prices come from the admin panel.
 */
export function PiercingPrices({ t, zones }: { t: Dictionary["piercing"]; zones: PiercingZone[] }) {
  const [picked, setPicked] = useState(zones[0]?.id);
  const zone = zones.find((z) => z.id === picked) ?? zones[0];
  if (!zone) return null;

  return (
    <section
      aria-label={t.pricesAria}
      className="flex flex-wrap items-start justify-between gap-x-16 gap-y-8 pt-[30px] lg:pl-5"
    >
      <div role="group" aria-label={t.zonesAria} className="flex flex-none flex-col items-stretch gap-4 pt-1">
        {zones.map(({ id, name }) => {
          const on = id === zone.id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => setPicked(id)}
              className={`h-12 min-w-[190px] rounded-full border-[1.5px] border-gold px-7 text-left text-[18px] font-medium transition-colors ${
                on ? "bg-gold text-on-gold" : "text-gold hover:bg-gold/10"
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>

      <div className="min-w-0 flex-[0_1_600px]">
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
              {zone.places.map((place) => (
                <li
                  key={place.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-cream/18 px-1 py-4"
                >
                  <div className="min-w-0">
                    <h3 className="break-words text-[20px] font-medium leading-[26px] text-cream">
                      {place.name}
                    </h3>
                    {place.note && (
                      <p className="mt-[3px] text-[14.5px] font-light leading-5 text-muted">{place.note}</p>
                    )}
                  </div>
                  <span className="whitespace-nowrap text-[16px] leading-[26px] text-cream">{place.price}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
