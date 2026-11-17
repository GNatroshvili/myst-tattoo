import { useId, type ReactNode } from "react";
import { displayCase, type Locale } from "@/lib/i18n/config";

type Props = {
  lang: Locale;
  titleLine1: string;
  titleLine2: string;
  text: string;
  className?: string;
  /** the button(s) on the right */
  children: ReactNode;
};

/**
 * Closing call-to-action of an inner page: the glowing panel from the gift
 * vouchers with a two-line title on the left and buttons on the right.
 * Carries the `book` anchor that the "Book" buttons on the page scroll to.
 */
export function CtaPanel({ lang, titleLine1, titleLine2, text, className = "", children }: Props) {
  const titleId = useId();

  return (
    <section
      id="book"
      aria-labelledby={titleId}
      className={`voucher-panel relative isolate flex min-h-[220px] scroll-mt-6 flex-wrap items-center justify-between gap-x-7 gap-y-6 overflow-hidden px-6 py-9 md:pl-[52px] md:pr-11 ${className}`}
    >
      {/* Georgian titles run longer, so their column is a little wider */}
      <div className={`relative ${lang === "ka" ? "flex-[0_1_540px]" : "flex-[0_1_440px]"}`}>
        <h2
          id={titleId}
          className="display text-[length:calc(clamp(38px,4.2vw,54px)*var(--display-scale))] leading-[0.98] tracking-[0.5px] text-cream"
        >
          {displayCase(titleLine1, lang)}
          <br />
          {displayCase(titleLine2, lang)}
        </h2>
        <p className="mt-4 text-[18px] font-light leading-[26px] text-body">{text}</p>
      </div>

      {children}
    </section>
  );
}
