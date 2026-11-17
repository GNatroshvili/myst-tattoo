import { useId, type ReactNode } from "react";
import { displayCase, type Locale } from "@/lib/i18n/config";
import { PanelStreaks } from "./PanelStreaks";

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
      className={`voucher-panel relative isolate flex min-h-[182px] scroll-mt-6 flex-wrap items-center justify-between gap-x-6 gap-y-5 overflow-hidden px-6 py-7 md:pl-[58px] md:pr-[38px] ${className}`}
    >
      <PanelStreaks />

      <div className="relative flex-[0_1_520px]">
        <h2
          id={titleId}
          className="display text-[length:calc(clamp(36px,4.2vw,54px)*var(--display-scale))] leading-none tracking-[0.5px] text-petal-100"
        >
          {displayCase(titleLine1, lang)}
          <br />
          {displayCase(titleLine2, lang)}
        </h2>
        <p className="mt-3.5 text-[15px] leading-[22px] text-mist-400">{text}</p>
      </div>

      {children}
    </section>
  );
}
