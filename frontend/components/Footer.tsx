import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { site } from "@/lib/site";
import { ArrowUpRightIcon, CalendarIcon, InstagramIcon, MapPinIcon } from "./ui/Icons";

const column = "flex min-w-0 items-center gap-6 py-1 lg:gap-[30px]";
const divided = "md:border-l md:border-line/28 md:pl-7";
const icon = "h-[34px] w-[34px] shrink-0 text-orchid";
const link = "transition-colors hover:text-gold";

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.footer;

  return (
    <footer className="flex flex-col gap-y-5 pb-[50px] pt-11 text-[15px] leading-6 text-mist-200 md:flex-row md:items-center">
      <div className={`${column} md:flex-[1_1_280px] md:pl-2 lg:pl-5`}>
        <MapPinIcon className={icon} />
        <p>
          {t.city}
          <br />
          {site.name}
        </p>
      </div>

      {/* a little less inset than its neighbours so both handles sit on one line */}
      <div className={`${column} ${divided} md:flex-[1.2_1_320px] lg:gap-7 lg:pl-[60px]`}>
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

      <div className={`${column} ${divided} md:flex-[1_1_280px] lg:pl-[76px]`}>
        <CalendarIcon className={icon} />
        <Link href={localePath(lang, "#idea")} className={link}>
          {t.bookLine1}
          <br />
          {t.bookLine2} <ArrowUpRightIcon className="ml-1.5 inline-block h-[13px] w-[13px] align-[-1px]" />
        </Link>
      </div>
    </footer>
  );
}
