import type { ReactNode } from "react";
import { displayCase, type Locale } from "@/lib/i18n/config";

type Props = {
  lang: Locale;
  title: string;
  text: string;
  className?: string;
  /** an optional button under the text */
  children?: ReactNode;
};

/** Outlined panel shown where a list has nothing in it. */
export function EmptyNote({ lang, title, text, className = "", children }: Props) {
  return (
    <div
      className={`flex flex-col items-center gap-3.5 rounded-[18px] border border-cream/18 px-6 py-12 text-center ${className}`}
    >
      <p className="display text-[length:calc(32px*var(--display-scale))] leading-9 text-cream">
        {displayCase(title, lang)}
      </p>
      <p className="max-w-[460px] text-[16px] font-light leading-6 text-body">{text}</p>
      {children}
    </div>
  );
}
