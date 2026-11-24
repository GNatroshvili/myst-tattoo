import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { site } from "@/lib/site";
import { ArrowRightIcon, CalendarIcon, InstagramIcon, MapPinIcon } from "./ui/Icons";

const column = "flex min-w-0 items-center gap-6 py-1.5";
const divided = "md:border-l md:border-cream/18 md:pl-7 lg:pl-16";
const icon = "h-[34px] w-[34px] shrink-0";
const link = "transition-colors hover:text-gold";

/**
 * Three columns. On wide screens their widths follow the design exactly: it
 * sizes each column by its content (260 / 320 / 260px) and adds the left inset
 * (and the 1px divider) on top, so the starting widths here include both.
 * Under them, on a hairline, the studio's name and the link to the privacy policy.
 */
export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.footer;

  return (
    <footer className="pb-10 pt-[72px] text-[16px] font-light leading-[22px] text-cream">
      <div className="flex flex-col gap-y-6 md:flex-row md:items-center">
        <div className={`${column} md:flex-[1_1_260px] md:pl-2 lg:basis-[304px] lg:pl-11`}>
          <MapPinIcon className={icon} />
          <p>
            {t.city}
            <br />
            {site.name}
          </p>
        </div>

        <div className={`${column} ${divided} md:flex-[1.3_1_320px] lg:basis-[385px]`}>
          <InstagramIcon className={icon} />
          <p>
            {t.follow}
            <br />
            <span className="flex flex-wrap gap-x-[14px]">
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

        <div className={`${column} ${divided} md:flex-[1_1_260px] lg:basis-[325px]`}>
          <CalendarIcon className={icon} />
          <p>
            {t.question}
            <br />
            <Link href={localePath(lang, "#idea")} className="link-arrow min-h-6 gap-3">
              {t.contact} <ArrowRightIcon className="h-3 w-[18px]" />
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-1 border-t border-cream/12 pt-5 text-[14px] leading-5 text-muted md:px-2 lg:px-11">
        <p>© {site.name}</p>
        <Link href={localePath(lang, "/privacy")} className={`flex min-h-11 items-center ${link}`}>
          {t.privacy}
        </Link>
      </div>
    </footer>
  );
}
