import Link from "next/link";
import { LogoMark } from "./Logo";
import { ArrowUpRightIcon } from "./ui/Icons";

function VoucherCard() {
  return (
    <div className="relative mx-auto w-full max-w-[230px] py-6 sm:max-w-[250px]">
      <div
        aria-hidden
        className="absolute inset-x-6 bottom-2 h-10 rounded-full bg-violet-500/40 blur-2xl"
      />
      <div className="relative aspect-[1.68] -rotate-[7deg] overflow-hidden rounded-2xl border border-lilac-300/30 bg-[linear-gradient(135deg,#2a0f33_0%,#160a1b_45%,#3a1447_100%)] shadow-card transition duration-500 hover:-rotate-[4deg]">
        {/* glossy sweep */}
        <div
          aria-hidden
          className="absolute -inset-10 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.08)_48%,transparent_60%)]"
        />
        <div className="relative flex h-full flex-col items-center justify-center">
          <LogoMark scale={0.95} />
        </div>
        <span
          aria-hidden
          className="absolute bottom-3 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-lilac-300/70"
        />
      </div>
    </div>
  );
}

export function GiftVouchers() {
  return (
    <section id="vouchers" className="container-x scroll-mt-24 py-10">
      <div className="relative overflow-hidden rounded-[28px] border border-lilac-400/25 bg-plum-900/40 px-5 py-7 shadow-glow-violet sm:px-8 sm:py-8 md:px-10 lg:px-12">
        <div aria-hidden className="streak -left-20 -top-24 h-72 w-[520px] -rotate-12" />
        <div aria-hidden className="streak -bottom-32 right-0 h-72 w-[560px] rotate-12" />

        {/* phones: stacked; tablets: text + card, button below; desktop: three columns */}
        <div className="relative grid grid-cols-[minmax(0,1fr)] items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div>
            <h2 className="display text-gradient-lilac text-[clamp(2.4rem,7vw,3.6rem)] leading-[0.95] lg:text-[clamp(2.6rem,5.2vw,3.6rem)]">
              Gift
              <br />
              Vouchers
            </h2>
            <p className="mt-3 text-sm text-lilac-200/90">
              A meaningful gift for someone special.
            </p>
          </div>

          <VoucherCard />

          <div className="md:col-span-2 lg:col-span-1 lg:justify-self-end">
            <Link href="#idea" className="btn btn-outline-gold">
              Get a Voucher <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
