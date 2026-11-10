import Link from "next/link";
import { site } from "@/lib/site";
import { LilyArt } from "./LilyArt";
import { ArrowUpRightIcon, SparkleIcon } from "./ui/Icons";

export function Hero() {
  return (
    <section className="container-x relative pb-14 pt-4 lg:pb-16 lg:pt-6">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-6">
        <div className="relative z-10 max-w-xl">
          <p className="eyebrow">
            Tattoo <span className="mx-1 text-lilac-400/60">/</span> Piercing{" "}
            <span className="mx-1 text-lilac-400/60">/</span> Art
          </p>

          <h1 className="display text-gradient-lilac mt-6 text-[clamp(3.25rem,7.2vw,5.9rem)] leading-[0.92] tracking-[0.02em]">
            Tattoos &amp;
            <br />
            Piercings
          </h1>
          <p className="display mt-5 text-[clamp(1.05rem,2.2vw,1.65rem)] font-light tracking-[0.5em] text-lilac-200">
            In Tbilisi
          </p>

          <div className="mt-7 flex items-center gap-3 text-gold">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-lilac-400/70" />
            <SparkleIcon className="h-4 w-4 animate-twinkle" />
            <span className="h-px w-44 bg-gradient-to-r from-lilac-400/70 to-transparent" />
          </div>

          <p className="mt-7 max-w-[300px] text-[15px] leading-relaxed text-lilac-200/90">
            {site.tagline}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="#idea" className="btn btn-primary">
              Book an Appointment <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
            <Link href="/artists" className="btn btn-outline">
              Our Artists
            </Link>
          </div>
        </div>

        <div className="relative -mx-4 lg:mx-0">
          <LilyArt />
        </div>
      </div>
    </section>
  );
}
