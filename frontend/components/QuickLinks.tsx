import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { ArrowRightIcon, ArtistsIcon, InfoIcon, PiercingIcon, TattooIcon } from "./ui/Icons";

const links = [
  { key: "tattoos", href: "/tattoos", Icon: TattooIcon },
  { key: "piercing", href: "/piercing", Icon: PiercingIcon },
  { key: "artists", href: "/artists", Icon: ArtistsIcon },
  { key: "info", href: "/info", Icon: InfoIcon },
] as const;

export function QuickLinks({ lang, t }: { lang: Locale; t: Dictionary["quickLinks"] }) {
  return (
    <section id="links" aria-label={t.aria} className="scroll-mt-6 pt-9">
      <ul className="grid grid-cols-2 gap-y-7 md:grid-cols-4">
        {links.map(({ key, href, Icon }) => (
          <li key={href} className="border-cream/18 even:border-l md:border-l md:first:border-l-0">
            <Link
              href={localePath(lang, href)}
              className="group flex h-full flex-col items-center gap-3.5 px-3 pb-2 pt-1.5 text-center text-cream transition-colors hover:text-gold"
            >
              <Icon strokeWidth={1.2} className="h-[50px] w-[50px]" />
              <span className="text-[21px] leading-7">{t[key]}</span>
              <ArrowRightIcon className="mt-auto h-3 w-[18px] shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
