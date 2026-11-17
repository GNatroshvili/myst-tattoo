import { useId } from "react";
import Link from "next/link";
import { displayCase, localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { works } from "@/lib/portfolio";
import { StarRule } from "./StarRule";
import { ArrowRightIcon } from "./ui/Icons";
import { WorkTile } from "./WorkTile";

/** How many pieces the home page shows: one row on a wide screen. */
const PICKS = 4;

/**
 * A taste of the portfolio on the home page: the first few pieces from
 * lib/portfolio.ts. Each of them, and the link beside the title, opens the
 * full gallery.
 */
export function FeaturedWorks({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.featured;
  const tattoos = dict.tattoos;
  const titleId = useId();
  const gallery = localePath(lang, "/tattoos");

  return (
    <section id="featured" aria-labelledby={titleId} className="scroll-mt-6 pt-16 lg:pt-[84px]">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 lg:pl-5">
        <div>
          <p className="caps eyebrow">{displayCase(t.eyebrow, lang)}</p>
          <h2
            id={titleId}
            className="display mt-5 text-[length:calc(clamp(38px,4.2vw,54px)*var(--display-scale))] leading-none tracking-[0.5px] text-cream"
          >
            {displayCase(t.title, lang)}
          </h2>
          <StarRule className="-ml-[5px] mt-5" star="h-[26px] w-[26px]" />
        </div>

        <Link href={gallery} className="link-arrow min-h-11 gap-3 text-[17px]">
          {t.viewAll} <ArrowRightIcon className="h-3 w-[18px]" />
        </Link>
      </div>

      {/* two to a row on phones, then as many 226px tiles as fit */}
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-[30px] sm:grid-cols-[repeat(auto-fill,minmax(226px,1fr))] sm:gap-x-6">
        {works.slice(0, PICKS).map((work, i) => (
          <WorkTile
            key={i}
            ratio="3 / 4"
            aria={t.openGallery}
            photoLabel={displayCase(tattoos.photoLabel, lang)}
            title={tattoos.styles[work.style]}
            note={tattoos.artistPlaceholder.replace("{n}", String(work.artist + 1))}
            href={gallery}
            className=""
          />
        ))}
      </div>
    </section>
  );
}
