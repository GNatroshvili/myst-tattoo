import Image from "next/image";
import Link from "next/link";
import silkBottom from "@/public/images/silk-bottom.webp";
import { site } from "@/lib/site";
import { ArrowUpRightIcon, CalendarIcon, InstagramIcon, MapPinIcon } from "./ui/Icons";

export function Footer() {
  return (
    <footer className="container-x relative mt-8 border-t border-lilac-400/15 py-10">
      {/* magenta light silk rising from the footer's right edge, behind the columns */}
      <Image
        src={silkBottom}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute right-[calc(50%-50vw)] top-[-110px] -z-10 h-auto w-[220px] select-none lg:top-[-140px] lg:w-[332px]"
      />
      <div className="grid gap-8 md:grid-cols-3 md:divide-x md:divide-lilac-400/20">
        <div className="flex items-start gap-4 md:pr-8">
          <MapPinIcon className="mt-0.5 h-6 w-6 shrink-0 text-lilac-300" />
          <div className="text-sm leading-relaxed">
            <p className="text-lilac-50">{site.city}</p>
            <p className="text-lilac-200/80">{site.name}</p>
          </div>
        </div>

        <div className="flex items-start gap-4 md:px-8">
          <InstagramIcon className="mt-0.5 h-6 w-6 shrink-0 text-lilac-300" />
          <div className="text-sm leading-relaxed">
            <p className="text-lilac-50">Follow us</p>
            <p className="flex flex-wrap gap-x-4 text-lilac-200/80">
              {site.instagram.map((acc) => (
                <a
                  key={acc.handle}
                  href={acc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-gold"
                >
                  {acc.handle}
                </a>
              ))}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 md:pl-8">
          <CalendarIcon className="mt-0.5 h-6 w-6 shrink-0 text-lilac-300" />
          <div className="text-sm leading-relaxed">
            <p className="text-lilac-50">Book an Appointment</p>
            <Link
              href="#idea"
              className="inline-flex items-center gap-1.5 text-lilac-200/80 transition hover:text-gold"
            >
              Online <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-10 text-center text-xs tracking-wide text-lilac-300/50">
        &copy; {site.name}. All rights reserved.
      </p>
    </footer>
  );
}
