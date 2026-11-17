import Image from "next/image";
import Link from "next/link";
import lily from "@/public/images/hero-lily.jpg";
import { displayCase, localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { StarRule } from "./StarRule";
import { ArrowUpRightIcon } from "./ui/Icons";

export function Hero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.hero;

  return (
    <section className="flex flex-col lg:flex-row lg:items-center lg:gap-x-6 lg:pl-5">
      <div className="min-w-0 pt-10 sm:pt-14 lg:flex-[1_1_400px] lg:pb-[60px] lg:pt-[70px]">
        <p
          className={`caps eyebrow ${
            // the Georgian line is longer: tighter on phones so it stays on one line
            lang === "ka" ? "max-sm:tracking-[2.6px]" : ""
          }`}
        >
          {displayCase(t.eyebrow, lang)}
        </p>

        <h1 className="display mt-[26px] text-[length:calc(clamp(40px,12vw,64px)*var(--display-scale))] leading-[1.02] tracking-[0.5px] text-cream lg:text-[length:calc(clamp(48px,5.9vw,76px)*var(--display-scale))] lg:leading-none">
          {displayCase(t.titleLine1, lang)}
          <br />
          {displayCase(t.titleLine2, lang)}
        </h1>
        <p className="caps mt-[26px] text-[22px] font-light leading-[26px] tracking-[10px] text-cream">
          {displayCase(t.subtitle, lang)}
        </p>

        <StarRule className="-ml-1.5 mt-[30px]" star="h-8 w-8" />

        <p className="mt-7 max-w-[380px] text-[19px] font-light leading-7 text-body">{t.tagline}</p>

        {/* phones: two full-width buttons; from 640px they sit side by side as drawn */}
        <div className="mt-[34px] flex flex-col gap-x-7 gap-y-3.5 sm:flex-row sm:flex-wrap">
          <Link href={localePath(lang, "#idea")} className="btn btn-gold">
            {dict.common.bookAppointment} <ArrowUpRightIcon className="h-[13px] w-[13px]" />
          </Link>
          <Link href={localePath(lang, "/artists")} className="btn btn-outline">
            {dict.common.ourArtists}
          </Link>
        </div>
      </div>

      {/* The artwork is painted on black: `lighten` drops that black into the
          page, the mask softens its left and right edges, and on wide screens
          it reaches past the column into the gutter, as in the design. */}
      <div className="mt-6 flex min-w-0 justify-center lg:-mb-[30px] lg:-mr-[30px] lg:-mt-[50px] lg:flex-[1_1_440px] lg:justify-end">
        <Image
          src={lily}
          alt={t.lilyAlt}
          preload
          quality={90}
          sizes="(min-width: 1280px) 596px, (min-width: 1024px) 50vw, (min-width: 640px) 560px, 100vw"
          className="block h-auto w-full max-w-[560px] select-none mix-blend-lighten [mask-image:linear-gradient(90deg,transparent_0%,#000_9%,#000_93%,transparent_100%)] lg:max-w-[640px]"
          draggable={false}
        />
      </div>
    </section>
  );
}
