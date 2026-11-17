import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { site } from "@/lib/site";
import { ArrowRightIcon, CalendarIcon, InstagramIcon, MapPinIcon } from "./ui/Icons";

const column = "flex min-w-0 items-center gap-6 py-1.5";
const divided = "md:border-l md:border-cream/18 md:pl-7 lg:pl-16";
const icon = "h-[34px] w-[34px] shrink-0";
const link = "transition-colors hover:text-gold";

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.footer;

  return (
    <footer className="flex flex-col gap-y-6 pb-16 pt-[72px] text-[16px] font-light leading-[22px] text-cream md:flex-row md:items-center">
      <div className={`${column} md:flex-[1_1_260px] md:pl-2 lg:pl-11`}>
        <MapPinIcon className={icon} />
        <p>
          {t.city}
          <br />
          {site.name}
        </p>
      </div>

      <div className={`${column} ${divided} md:flex-[1.3_1_320px]`}>
        <InstagramIcon className={icon} />
        <p>
          {t.follow}
          <br />
          <span className="flex flex-wrap gap-x-[18px]">
            {site.instagram.map((acc) => (
              <a
                key={acc.handle}
                href={acc.url}
                target="_blank"
                rel="noopener noreferrer"
                className={link}
              >
                {acc.handle}
              </a>
            ))}
          </span>
        </p>
      </div>

      <div className={`${column} ${divided} md:flex-[1_1_260px]`}>
        <CalendarIcon className={icon} />
        <p>
          {t.question}
          <br />
          <Link href={localePath(lang, "#idea")} className="link-arrow min-h-6 gap-3">
            {t.contact} <ArrowRightIcon className="h-3 w-[18px]" />
          </Link>
        </p>
      </div>
    </footer>
  );
}
