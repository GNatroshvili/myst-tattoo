import { Suspense } from "react";
import { getStats } from "@/lib/api";
import { displayCase, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { localized } from "@/lib/types";
import { StatNumber } from "./StatNumber";

type Props = { lang: Locale; dict: Dictionary };

const band = "scroll-mt-6 pt-14 lg:pt-[72px]";
const row = "grid border-y border-cream/18 py-9 sm:py-11";

/**
 * How the row is divided, by how many figures it holds (one to four). Up to
 * three stand side by side on every screen; four stand two by two on phones.
 */
const columns: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 gap-y-9 md:grid-cols-4",
};

/**
 * The studio in a few figures, between the quick links and the featured
 * projects: every figure added in the admin panel, in the order it gives
 * them, each over its line of text ("700+" over "Reviews on Google"), in a
 * band between two hairlines. The section is left out entirely while there
 * are no figures.
 */
async function Figures({ lang, dict }: Props) {
  const stats = (await getStats()).slice(0, 4);
  if (stats.length === 0) return null;

  return (
    <section id="numbers" aria-label={dict.stats.aria} className={band}>
      <ul className={`${row} ${columns[stats.length]}`}>
        {stats.map((stat) => (
          <li
            key={stat.id}
            className="flex min-w-0 flex-col items-center px-2 text-center sm:px-5"
          >
            {/* three share a phone's width: smaller there, so "5,000+" still fits its column */}
            <p className="display text-[length:clamp(34px,10.5vw,58px)] leading-none tracking-[0.5px] text-cream md:text-[length:clamp(58px,6.6vw,84px)]">
              <StatNumber text={stat.value} />
            </p>
            <p className="caps mt-3.5 max-w-[300px] text-balance break-words text-[10.5px] leading-[16px] tracking-[1.6px] text-body sm:mt-5 sm:text-[13px] sm:leading-5 sm:tracking-[3.2px]">
              {displayCase(localized(stat.label, lang), lang)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The figures are read from the backend when the page is requested. */
export function StudioStats(props: Props) {
  return (
    <Suspense
      fallback={
        <div aria-hidden className={band}>
          <div className={`${row} ${columns[3]} animate-pulse`}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center px-2">
                <div className="h-[34px] w-3/5 max-w-[150px] rounded-full bg-surface md:h-[70px]" />
                <div className="mt-3.5 h-4 w-4/5 max-w-[180px] rounded-full bg-surface sm:mt-5 sm:h-5" />
              </div>
            ))}
          </div>
        </div>
      }
    >
      <Figures {...props} />
    </Suspense>
  );
}
