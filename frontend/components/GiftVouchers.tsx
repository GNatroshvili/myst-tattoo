import Link from "next/link";
import { CardLogo } from "./Logo";
import { ArrowUpRightIcon } from "./ui/Icons";

export function GiftVouchers() {
  return (
    <section
      id="vouchers"
      aria-labelledby="vouchers-title"
      className="voucher-panel relative mt-10 grid min-h-[182px] scroll-mt-6 grid-cols-[minmax(0,1fr)] items-center justify-items-center gap-y-7 overflow-hidden px-6 py-9 text-center md:grid-cols-[minmax(0,1fr)_auto] md:justify-items-start md:gap-x-6 md:gap-y-5 md:py-6 md:pl-[58px] md:pr-[38px] md:text-left lg:mt-[34px] lg:grid-cols-[minmax(0,330px)_auto_auto] lg:justify-between"
    >
      {/* blurred orchid streaks crossing the panel */}
      <svg
        aria-hidden
        viewBox="0 0 1064 182"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="gv-streak" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#D46CF2" stopOpacity="0" />
            <stop offset="0.5" stopColor="#D46CF2" stopOpacity="0.6" />
            <stop offset="1" stopColor="#D46CF2" stopOpacity="0" />
          </linearGradient>
          <filter id="gv-soft" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        <g fill="none" stroke="url(#gv-streak)" filter="url(#gv-soft)">
          <path d="M420 200C520 120 560 40 660 -10" strokeWidth="7" />
          <path d="M700 200C800 150 860 70 840 -10" strokeWidth="9" />
          <path d="M610 190C760 170 900 110 1000 20" strokeWidth="5" />
        </g>
      </svg>

      <div className="relative md:self-end lg:self-center">
        <h2
          id="vouchers-title"
          className="display text-[clamp(42px,12vw,54px)] leading-[0.93] tracking-[0.5px] text-petal-100"
        >
          Gift
          <br />
          Vouchers
        </h2>
        <p className="mt-3.5 text-[15px] leading-[22px] text-mist-400">
          A meaningful gift for someone special.
        </p>
      </div>

      {/* the voucher itself: a dark card with the studio mark, tilted and glowing.
          The outer box keeps the resting tilt and is the hover target, so the hit
          area stays put while the card inside straightens, lifts and catches light. */}
      <div
        aria-hidden
        className="voucher-tilt relative my-5 shrink-0 -rotate-[14deg] md:col-start-2 md:row-span-2 md:row-start-1 md:mb-[-30px] md:mt-[-6px] lg:row-span-1"
      >
        <div className="voucher-card relative flex h-[158px] w-[262px] flex-col items-center justify-center overflow-hidden text-petal-300">
          <CardLogo />
          <span className="voucher-sheen" />
        </div>
      </div>

      <Link
        href="/#idea"
        className="btn btn-outline-gold relative md:col-start-1 md:row-start-2 md:self-start lg:col-start-3 lg:row-start-1 lg:self-center"
      >
        Get a Voucher <ArrowUpRightIcon className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}
