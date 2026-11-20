import { CardLogo } from "./Logo";

/**
 * The gift voucher card: a dark card with the studio mark, resting at a tilt.
 * Under the pointer it straightens, lifts and gathers a rose glow (see
 * `.voucher-card` in globals.css).
 *
 * The outer box keeps the resting tilt and is the hover target, so the hit
 * area stays put while the card inside moves.
 */
export function VoucherCard() {
  return (
    <div
      aria-hidden
      className="voucher-tilt relative z-[1] my-5 shrink-0 -rotate-[14deg] md:col-start-2 md:row-span-2 md:row-start-1 md:mb-[-34px] md:mt-[-8px] lg:row-span-1"
    >
      <div className="voucher-card relative flex h-[168px] w-[280px] items-center justify-center overflow-hidden">
        <CardLogo />
      </div>
    </div>
  );
}
