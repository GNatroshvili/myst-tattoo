import { useId } from "react";
import Link from "next/link";
import { displayCase, localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { ArrowRightIcon } from "./ui/Icons";
import { VoucherCard } from "./VoucherCard";

export function GiftVouchers({ lang, t }: { lang: Locale; t: Dictionary["vouchers"] }) {
  // unique per instance: a hidden copy of the page can share the document
  const id = useId();

  return (
    <section
      id="vouchers"
      aria-labelledby={`${id}-title`}
      className="voucher-panel relative isolate mt-14 grid min-h-[220px] scroll-mt-6 grid-cols-[minmax(0,1fr)] items-center justify-items-center gap-y-7 overflow-hidden px-6 py-9 text-center md:grid-cols-[minmax(0,1fr)_auto] md:justify-items-start md:gap-x-7 md:gap-y-6 md:pl-[52px] md:pr-11 md:text-left lg:mt-16 lg:grid-cols-[minmax(0,440px)_auto_auto] lg:justify-between"
    >
      <div className="relative z-[1] md:self-end lg:self-center">
        <h2
          id={`${id}-title`}
          className="display text-[length:calc(clamp(38px,4.2vw,54px)*var(--display-scale))] leading-[0.98] tracking-[0.5px] text-cream"
        >
          {displayCase(t.titleLine1, lang)}
          <br />
          {displayCase(t.titleLine2, lang)}
        </h2>
        <p className="mt-4 text-[18px] font-light leading-[26px] text-body">{t.text}</p>
      </div>

      {/* the voucher itself: a dark card with the studio mark, tilted */}
      <VoucherCard />

      <Link
        href={localePath(lang, "#idea")}
        className="btn btn-outline-gold relative z-[1] md:col-start-1 md:row-start-2 md:self-start lg:col-start-3 lg:row-start-1 lg:self-center"
      >
        {t.cta} <ArrowRightIcon className="h-3 w-[18px]" />
      </Link>
    </section>
  );
}
