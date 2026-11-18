"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { placements, zones, type ZoneKey } from "@/lib/piercing";

/**
 * Piercing zones beside the price list. With no zone picked the list shows the
 * common placements; picking a zone swaps in that zone's own list, and picking
 * it again goes back.
 */
export function PiercingPrices({ t }: { t: Dictionary["piercing"] }) {
  const [zone, setZone] = useState<ZoneKey | null>(null);

  const picked = zones.find((z) => z.key === zone);
  const rows = picked
    ? Array.from({ length: picked.rows }, (_, i) => ({
        key: `${picked.key}-${i}`,
        name: t.placeholder.zonePlacement[picked.key],
      }))
    : placements.map((key) => ({ key, name: t.placements[key] }));

  return (
    <section
      aria-label={t.pricesAria}
      className="flex flex-wrap items-start justify-between gap-x-16 gap-y-8 pt-[30px] lg:pl-5"
    >
      <div role="group" aria-label={t.zonesAria} className="flex flex-none flex-col items-start gap-4 pt-1">
        {zones.map(({ key }) => {
          const on = key === zone;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => setZone(on ? null : key)}
              className={`h-12 min-w-[190px] rounded-full border-[1.5px] border-gold px-7 text-left text-[18px] font-medium transition-colors ${
                on ? "bg-gold text-on-gold" : "text-gold hover:bg-gold/10"
              }`}
            >
              {t.zones[key]}
            </button>
          );
        })}
      </div>

      <div className="min-w-0 flex-[0_1_600px]">
        <p className="mx-1 mb-[22px] text-[18px] font-light leading-[26px] text-cream lg:text-right">
          {t.priceNote}
        </p>
        <ul aria-live="polite" className="border-t border-cream/18">
          {rows.map((row) => (
            <li
              key={row.key}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-cream/18 px-1 py-4"
            >
              <div>
                <h3 className="text-[20px] font-medium leading-[26px] text-cream">{row.name}</h3>
                <p className="mt-[3px] text-[14.5px] font-light leading-5 text-muted">
                  {t.placeholder.rowNote}
                </p>
              </div>
              <span className="text-[16px] leading-[26px] text-cream">{t.placeholder.price}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
