import { displayCase, type Locale } from "@/lib/i18n/config";
import { StarRule } from "./StarRule";

type Props = {
  lang: Locale;
  eyebrow: string;
  title: string;
  subtitle: string;
  /** short paragraph on the right; the piercing page has none */
  lead?: string;
};

/**
 * Opening of an inner page (artists, tattoos, piercing, blog): eyebrow, display
 * title, spaced subtitle and the gold star on the left, and on most pages a
 * short lead paragraph on the right.
 */
export function PageIntro({ lang, eyebrow, title, subtitle, lead }: Props) {
  return (
    <section className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6 pt-10 sm:pt-16 lg:pl-5">
      <div className="min-w-0 flex-[1_1_420px]">
        <p className="caps eyebrow enter">{displayCase(eyebrow, lang)}</p>
        <h1 className="display enter enter-1 mt-[22px] text-[length:calc(clamp(46px,5.6vw,70px)*var(--display-scale))] leading-[1.02] tracking-[0.5px] text-cream">
          {displayCase(title, lang)}
        </h1>
        {/* tighter on phones so the longer subtitles stay on one line */}
        <p
          className={`caps enter enter-2 mt-[22px] text-[20px] font-light leading-6 text-cream sm:tracking-[9px] ${
            lang === "ka" ? "tracking-[5px]" : "tracking-[7px]"
          }`}
        >
          {displayCase(subtitle, lang)}
        </p>

        <StarRule className="enter enter-3 -ml-1.5 mt-6" star="h-[30px] w-[30px]" />
      </div>

      {lead && (
        <p className="enter enter-4 mb-1.5 flex-[0_1_380px] text-[18px] font-light leading-[26px] text-body">{lead}</p>
      )}
    </section>
  );
}
