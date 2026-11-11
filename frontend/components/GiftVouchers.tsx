import Image from "next/image";
import Link from "next/link";
import silkRight from "@/public/images/silk-right.webp";
import voucherCard from "@/public/images/voucher-card.webp";
import { ArrowUpRightIcon } from "./ui/Icons";

export function GiftVouchers() {
  return (
    <section id="vouchers" className="container-x relative scroll-mt-24 py-10">
      {/* magenta light silk sweeping past the box's top-right corner, behind the box */}
      <Image
        src={silkRight}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute -top-36 right-[calc(50%-50vw)] -z-10 h-auto w-[72px] select-none lg:-top-44 lg:w-[104px]"
      />

      <div className="relative overflow-hidden rounded-[28px] border border-lilac-400/25 bg-plum-900/40 px-5 py-7 shadow-glow-violet sm:px-8 sm:py-8 md:px-10 lg:px-12">
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

          {/* card from the design, with its magenta silk glow; the glow bleeds to the
              box edges on wider screens via the negative vertical margin */}
          <Image
            src={voucherCard}
            alt="Myst gift voucher card"
            draggable={false}
            sizes="(min-width: 1024px) 400px, 300px"
            className="mx-auto h-auto w-[300px] max-w-full select-none md:-my-10 lg:w-[400px]"
          />

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
