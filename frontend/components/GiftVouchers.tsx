import { useId } from "react";
import Link from "next/link";
import { displayCase, localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { PanelStreaks } from "./PanelStreaks";
import { ArrowUpRightIcon } from "./ui/Icons";
import { VoucherCard } from "./VoucherCard";

export function GiftVouchers({ lang, t }: { lang: Locale; t: Dictionary["vouchers"] }) {
  // unique per instance: a hidden copy of the page can share the document
  const id = useId();

  return (
    <section
      id="vouchers"
      aria-labelledby={`${id}-title`}
      className="voucher-panel relative isolate mt-10 grid min-h-[182px] scroll-mt-6 grid-cols-[minmax(0,1fr)] items-center justify-items-center gap-y-7 overflow-hidden px-6 py-9 text-center md:grid-cols-[minmax(0,1fr)_auto] md:justify-items-start md:gap-x-6 md:gap-y-5 md:py-6 md:pl-[58px] md:pr-[38px] md:text-left lg:mt-[34px] lg:grid-cols-[minmax(0,330px)_auto_auto] lg:justify-between"
    >
      <PanelStreaks />

      <div className="relative z-[1] md:self-end lg:self-center">
        <h2
          id={`${id}-title`}
          className="display text-[length:calc(clamp(42px,12vw,54px)*var(--display-scale))] leading-[0.93] tracking-[0.5px] text-petal-100"
        >
          {displayCase(t.titleLine1, lang)}
          <br />
          {displayCase(t.titleLine2, lang)}
        </h2>
        <p className="mt-3.5 text-[15px] leading-[22px] text-mist-400">
          {t.text}
        </p>
      </div>

      {/* the voucher itself: a dark card with the studio mark, tilted and glowing;
          hovering it sets off a lilac lightning strike across the panel */}
      <VoucherCard />

      <Link
        href={localePath(lang, "#idea")}
        className="btn btn-outline-gold relative z-[1] md:col-start-1 md:row-start-2 md:self-start lg:col-start-3 lg:row-start-1 lg:self-center"
      >
        {t.cta} <ArrowUpRightIcon className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}
