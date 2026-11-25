import Link from "next/link";
import { displayCase, localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { HeroLily } from "./HeroLily";
import { StarRule } from "./StarRule";
import { ArrowUpRightIcon } from "./ui/Icons";

export function Hero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.hero;

  return (
    <section className="flex flex-col lg:flex-row lg:items-center lg:gap-x-6 lg:pl-5">
      <div className="min-w-0 pt-10 sm:pt-14 lg:flex-[1_1_400px] lg:pb-[60px] lg:pt-[70px]">
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

      {/* the artwork; on wide screens it reaches past the column into the
          gutter, as in the design */}
      <div className="enter-fade mt-6 flex min-w-0 justify-center lg:-mb-[30px] lg:-mr-[30px] lg:-mt-[50px] lg:flex-[1_1_440px] lg:justify-end">
        <HeroLily alt={t.lilyAlt} />
      </div>
    </section>
  );
}
