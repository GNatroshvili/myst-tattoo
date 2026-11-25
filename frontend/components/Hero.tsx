import Link from "next/link";
import { displayCase, localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { HeroVideo } from "./HeroVideo";
import { StarRule } from "./StarRule";
import { ArrowUpRightIcon } from "./ui/Icons";

/**
 * The opening of the home page: the headline and the two buttons over a film
 * of the studio that fills the whole section, edge to edge of the screen and
 * up behind the header.
 *
 * On wide screens the text stands on the left, where the film is dark, and
 * the film shows on the right. Below 1024px there is no room beside the film:
 * the text starts right under the header, as close as it always has, and the
 * section is only as tall as the text, so the film is simply scaled down to
 * that size and lies behind it under a dark veil.
 */
export function Hero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.hero;

  return (
    // No height of its own at any width: the text sets it, with the same space
    // above it under the header as before the film (40 / 56 / 70px).
    <section className="relative isolate flex flex-col pb-10 sm:pb-14 lg:pb-0 lg:pl-5">
      {/* The film and the veils over it. The box is as wide as the screen,
          wall to wall, whatever the page's column is, and starts above the
          section so it also lies behind the header; what would stick out
          above the page is cut off by the page itself. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 bottom-0 left-1/2 -z-10 w-screen -translate-x-1/2 overflow-hidden"
      >
        <HeroVideo />
        {/* below 1024px the text covers the whole film: dark enough behind it for any frame, bright ones too */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(9,8,8,0.5)_0%,rgba(9,8,8,0.62)_45%,rgba(9,8,8,0.82)_82%,#090808_100%)] lg:hidden" />
        {/* wide screens: the picture reaches the left wall, and darkens towards it under the text */}
        <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(9,8,8,0.9)_0%,rgba(9,8,8,0.78)_30%,rgba(9,8,8,0.5)_50%,rgba(9,8,8,0)_72%)] lg:block" />
        {/* behind the header, and down into the page so the film ends on no line */}
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-ink/85 to-ink/0" />
        <div className="absolute inset-x-0 bottom-0 hidden h-[30%] bg-gradient-to-t from-ink to-ink/0 lg:block" />
      </div>

      <div className="min-w-0 pt-10 sm:pt-14 lg:max-w-[560px] lg:pb-[60px] lg:pt-[70px]">
        <p
          className={`caps eyebrow enter ${
            // the Georgian line is longer: tighter on phones so it stays on one line
            lang === "ka" ? "max-sm:tracking-[2.6px]" : ""
          }`}
        >
          {displayCase(t.eyebrow, lang)}
        </p>

        <h1 className="display enter enter-1 mt-[26px] text-[length:calc(clamp(40px,12vw,64px)*var(--display-scale))] leading-[1.02] tracking-[0.5px] text-cream lg:text-[length:calc(clamp(48px,5.9vw,76px)*var(--display-scale))] lg:leading-none">
          {displayCase(t.titleLine1, lang)}
          <br />
          {displayCase(t.titleLine2, lang)}
        </h1>
        <p className="caps enter enter-2 mt-[26px] text-[22px] font-light leading-[26px] tracking-[10px] text-cream">
          {displayCase(t.subtitle, lang)}
        </p>

        <StarRule className="enter enter-3 -ml-1.5 mt-[30px]" star="h-8 w-8" />

        <p className="enter enter-4 mt-7 max-w-[380px] text-[19px] font-light leading-7 text-body">{t.tagline}</p>

        {/* phones: two full-width buttons; from 640px they sit side by side as drawn */}
        <div className="enter enter-5 mt-[34px] flex flex-col gap-x-7 gap-y-3.5 sm:flex-row sm:flex-wrap">
          <Link href={localePath(lang, "#idea")} className="btn btn-gold">
            {dict.common.bookAppointment} <ArrowUpRightIcon className="h-[13px] w-[13px]" />
          </Link>
          <Link href={localePath(lang, "/artists")} className="btn btn-outline">
            {dict.common.ourArtists}
          </Link>
        </div>
      </div>
    </section>
  );
}
