import { displayCase, type Locale } from "@/lib/i18n/config";
import { StarIcon } from "./ui/Icons";

type Props = {
  lang: Locale;
  eyebrow: string;
  title: string;
  subtitle: string;
  lead: string;
};

/**
 * Opening of an inner page (artists, tattoos): eyebrow, display title, spaced
 * subtitle and the gold star on the left, a short lead paragraph on the right.
 */
export function PageIntro({ lang, eyebrow, title, subtitle, lead }: Props) {
  return (
    <section className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6 pt-10 sm:pt-[58px] lg:pl-7">
      <div className="min-w-0 flex-[1_1_420px]">
        <p className="caps text-[12px] leading-4 tracking-[4.4px] text-[#d3bbdb]">
          {displayCase(eyebrow, lang)}
        </p>
        <h1 className="display mt-[18px] text-[length:calc(clamp(46px,5.7vw,73px)*var(--display-scale))] leading-[1.1] tracking-[1px] text-petal-200">
          {displayCase(title, lang)}
        </h1>
        {/* tighter on phones so the longer subtitles stay on one line */}
        <p
          className={`caps mt-5 text-[20px] leading-6 text-[#c7a9d0] sm:tracking-[11px] ${
            lang === "ka" ? "tracking-[5px]" : "tracking-[7px]"
          }`}
        >
          {displayCase(subtitle, lang)}
        </p>

        {/* gold star with a line fading out to the right */}
        <div aria-hidden className="-ml-2.5 mt-[22px] flex items-center gap-1.5">
          <StarIcon className="h-[34px] w-[34px] text-gold drop-shadow-[0_0_6px_rgba(250,225,40,0.55)]" />
          <span className="block h-[1.5px] w-[130px] bg-gradient-to-r from-gold to-gold/0" />
        </div>
      </div>

      <p className="mb-2 flex-[0_1_380px] text-[18px] leading-[27px] text-mist-400">{lead}</p>
    </section>
  );
}
