import Image from "next/image";
import Link from "next/link";
import lily from "@/public/images/hero-lily.png";
import { displayCase, localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { ArrowUpRightIcon, StarIcon } from "./ui/Icons";

export function Hero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.hero;

  return (
    <section className="flex flex-col lg:flex-row lg:items-start lg:gap-x-6 lg:pl-7">
      <div className="min-w-0 pt-10 sm:pt-14 lg:flex-[1_1_400px] lg:pb-9 lg:pt-[70px]">
        <p
          className={`caps text-[12px] leading-4 text-[#d3bbdb] ${
            // the Georgian line is longer: tighter on phones so it stays on one line
            lang === "ka" ? "tracking-[2.6px] sm:tracking-[4.4px]" : "tracking-[4.4px]"
          }`}
        >
          {displayCase(t.eyebrow, lang)}
        </p>

        <h1 className="display mt-[18px] text-[length:calc(clamp(40px,12vw,64px)*var(--display-scale))] leading-[1.1] tracking-[1px] text-petal-200 lg:text-[length:calc(clamp(46px,5.7vw,73px)*var(--display-scale))]">
          {displayCase(t.titleLine1, lang)}
          <br />
          {displayCase(t.titleLine2, lang)}
        </h1>
        <p className="caps mt-[22px] text-[20px] leading-6 tracking-[11px] text-[#c7a9d0]">
          {displayCase(t.subtitle, lang)}
        </p>

        {/* gold star with a line fading out to the right */}
        <div aria-hidden className="-ml-2.5 mt-[22px] flex items-center gap-1.5">
          <StarIcon className="h-[34px] w-[34px] text-gold drop-shadow-[0_0_6px_rgba(250,225,40,0.55)]" />
          <span className="block h-[1.5px] w-[130px] bg-gradient-to-r from-gold to-gold/0" />
        </div>

        <p className="mt-[22px] max-w-[350px] text-[18px] leading-[27px] text-mist-400">
          {t.tagline}
        </p>

        {/* phones: two full-width buttons; from 640px they sit side by side as drawn */}
        <div className="mt-[30px] flex flex-col gap-x-[30px] gap-y-3.5 sm:flex-row sm:flex-wrap">
          <Link href={localePath(lang, "#idea")} className="btn btn-gold">
            {dict.common.bookAppointment} <ArrowUpRightIcon className="h-3.5 w-3.5" />
          </Link>
          <Link href={localePath(lang, "/artists")} className="btn btn-outline">
            {dict.common.ourArtists}
          </Link>
        </div>
      </div>

      {/* the artwork bleeds past the column on wide screens, as in the design */}
      <div className="-mx-3 mt-4 flex min-w-0 justify-center sm:mx-0 lg:-mb-5 lg:-mr-[84px] lg:-mt-3 lg:flex-[1_1_420px] lg:justify-end">
        <Image
          src={lily}
          alt={t.lilyAlt}
          preload
          quality={90}
          sizes="(min-width: 1280px) 534px, (min-width: 1024px) 50vw, (min-width: 640px) 560px, 100vw"
          className="block h-auto w-full max-w-[560px] select-none lg:max-w-[656px]"
          draggable={false}
        />
      </div>
    </section>
  );
}
