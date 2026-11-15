import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import {
  ArrowRightIcon,
  ArtistsIcon,
  PiercingIcon,
  TattooIcon,
  WhyMystIcon,
} from "./ui/Icons";

const links = [
  { key: "tattoos", href: "/tattoos", Icon: TattooIcon, wide: false },
  { key: "piercing", href: "/piercing", Icon: PiercingIcon, wide: false },
  { key: "artists", href: "/artists", Icon: ArtistsIcon, wide: true },
  { key: "whyMyst", href: "/why-myst", Icon: WhyMystIcon, wide: false },
] as const;

export function QuickLinks({ lang, t }: { lang: Locale; t: Dictionary["quickLinks"] }) {
  return (
    <section id="links" aria-label={t.aria} className="scroll-mt-6 pt-8 lg:pt-1.5">
      <ul className="grid grid-cols-2 gap-y-7 md:grid-cols-4">
        {links.map(({ key, href, Icon, wide }) => (
          <li
            key={href}
            className="border-line/28 even:border-l md:border-l md:first:border-l-0"
          >
            <Link
              href={localePath(lang, href)}
              className="group flex h-full flex-col items-center gap-2.5 px-3 pb-2.5 pt-2 text-center text-mist-100 transition-colors hover:text-gold"
            >
              <Icon
                className={`h-[46px] text-orchid transition-colors group-hover:text-gold ${
                  wide ? "w-[54px]" : "w-[46px]"
                }`}
              />
              <span className="text-[21px] font-medium leading-7">{t[key]}</span>
              <ArrowRightIcon className="mt-auto h-3.5 w-5 shrink-0 text-orchid-soft transition group-hover:translate-x-1 group-hover:text-gold" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
