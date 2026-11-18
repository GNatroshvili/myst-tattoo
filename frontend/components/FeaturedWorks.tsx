import { Suspense, useId } from "react";
import Link from "next/link";
import { getTattoos } from "@/lib/api";
import { displayCase, localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { tattooAlt } from "@/lib/tattoos";
import { localized } from "@/lib/types";
import { StarRule } from "./StarRule";
import { ArrowRightIcon } from "./ui/Icons";
import { WorkTile } from "./WorkTile";

/** How many pieces the home page shows: one row on a wide screen. */
const PICKS = 4;

type Props = { lang: Locale; dict: Dictionary };

// two to a row on phones, then as many 226px tiles as fit
const grid =
  "mt-10 grid grid-cols-2 gap-x-4 gap-y-[30px] sm:grid-cols-[repeat(auto-fill,minmax(226px,1fr))] sm:gap-x-6";

/**
 * A taste of the portfolio on the home page: the newest few tattoos. Each of
 * them, and the link beside the title, opens the full gallery. The section is
 * left out entirely while the gallery is still empty.
 */
async function Featured({ lang, dict }: Props) {
  const tattoos = await getTattoos(PICKS);
  if (tattoos.length === 0) return null;
  const gallery = localePath(lang, "/tattoos");

  return (
    <Section lang={lang} dict={dict}>
      <div className={grid}>
        {tattoos.map((tattoo) => (
          <WorkTile
            key={tattoo.id}
            ratio="3 / 4"
            photo={tattoo.image}
            aria={`${dict.featured.openGallery}: ${tattooAlt(tattoo, dict.tattoos, lang)}`}
            title={tattoo.style ? localized(tattoo.style.name, lang) : ""}
            note={tattoo.artist?.nickname}
            href={gallery}
            className=""
          />
        ))}
      </div>
    </Section>
  );
}

/** The section's heading and "view all" link, around whatever fills the grid. */
function Section({ lang, dict, children }: Props & { children: React.ReactNode }) {
  const t = dict.featured;
  const titleId = useId();

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

        <Link href={localePath(lang, "/tattoos")} className="link-arrow min-h-11 gap-3 text-[17px]">
          {t.viewAll} <ArrowRightIcon className="h-3 w-[18px]" />
        </Link>
      </div>
      {children}
    </section>
  );
}

/** The tattoos are read from the backend when the page is requested. */
export function FeaturedWorks(props: Props) {
  return (
    <Suspense
      fallback={
        <Section {...props}>
          <div aria-hidden className={`${grid} animate-pulse`}>
            {Array.from({ length: PICKS }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-[14px] border border-cream/10 bg-surface" />
            ))}
          </div>
        </Section>
      }
    >
      <Featured {...props} />
    </Suspense>
  );
}
