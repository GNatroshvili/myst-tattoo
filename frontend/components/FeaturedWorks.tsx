import { Suspense, useId } from "react";
import Link from "next/link";
import { getFeaturedTattoos } from "@/lib/api";
import { displayCase, localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { tattooAlt } from "@/lib/tattoos";
import { localized } from "@/lib/types";
import { FeaturedSlider } from "./FeaturedSlider";
import { Reveal } from "./motion/Reveal";
import { StarRule } from "./StarRule";
import { ArrowRightIcon } from "./ui/Icons";
import { WorkTile } from "./WorkTile";

/** How many pieces fit in one row on a wide screen; more than that become a slider. */
const ROW = 4;

type Props = { lang: Locale; dict: Dictionary };

const grid = "work-grid mt-10";

/** One slide: two and a bit to a screen on phones (the bit hints at more), three on tablets, four on wide screens. */
const slide =
  "min-w-0 shrink-0 basis-[42%] snap-start sm:basis-[calc((100%-48px)/3)] lg:basis-[calc((100%-72px)/4)]";

/**
 * A taste of the portfolio on the home page: the tattoos marked "featured" in
 * the admin panel, newest first. Up to four stand in the usual grid; more than
 * that become one row that slides sideways (see FeaturedSlider), so every one
 * of them can be reached. Each tile, and the link beside the title, opens the
 * full gallery. The section is left out entirely while nothing is featured.
 */
async function Featured({ lang, dict }: Props) {
  const tattoos = await getFeaturedTattoos();
  if (tattoos.length === 0) return null;
  const gallery = localePath(lang, "/tattoos");
  const t = dict.featured;

  const tiles = tattoos.map((tattoo, i) => (
    <WorkTile
      key={tattoo.id}
      order={i}
      photo={tattoo.image}
      aria={`${t.openGallery}: ${tattooAlt(tattoo, dict.tattoos, lang)}`}
      title={tattoo.style ? localized(tattoo.style.name, lang) : ""}
      note={tattoo.artist ? localized(tattoo.artist.nickname, lang) : undefined}
      href={gallery}
    />
  ));

  return (
    <Section lang={lang} dict={dict}>
      {tattoos.length <= ROW ? (
        <div className={grid}>{tiles}</div>
      ) : (
        <FeaturedSlider previous={t.previous} next={t.next}>
          {tiles.map((tile) => (
            <div key={tile.key} className={slide}>
              {tile}
            </div>
          ))}
        </FeaturedSlider>
      )}
    </Section>
  );
}

/** The section's heading and "view all" link, around whatever fills the grid. */
function Section({ lang, dict, children }: Props & { children: React.ReactNode }) {
  const t = dict.featured;
  const titleId = useId();

  return (
    <section id="featured" aria-labelledby={titleId} className="scroll-mt-6 pt-16 lg:pt-[84px]">
      <Reveal className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 lg:pl-5">
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
      </Reveal>
      {children}
    </section>
  );
}

/** The featured tattoos are read from the backend when the page is requested. */
export function FeaturedWorks(props: Props) {
  return (
    <Suspense
      fallback={
        <Section {...props}>
          <div aria-hidden className={`${grid} animate-pulse`}>
            {Array.from({ length: ROW }).map((_, i) => (
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
