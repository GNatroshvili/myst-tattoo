"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { nav } from "@/lib/site";
import { LangSwitcher } from "./LangSwitcher";
import { Logo } from "./Logo";
import { ArrowRightIcon, CloseIcon, MenuIcon } from "./ui/Icons";

type Props = {
  lang: Locale;
  nav: Dictionary["nav"];
  common: Dictionary["common"];
  switcherLabel: string;
};

export function Header({ lang, nav: t, common, switcherLabel }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = nav.map((item) => ({ ...item, href: localePath(lang, item.href), label: t[item.key] }));
  const bookHref = localePath(lang, "#idea");
  // a page under a section (an artist's profile) keeps that section lit
  const isActive = (item: (typeof items)[number]) =>
    pathname === item.href || (item.key !== "home" && pathname.startsWith(`${item.href}/`));

  return (
    <header className="relative z-30">
      <div className="flex items-center justify-between gap-x-3 pb-2 pt-4 sm:gap-x-5 sm:pt-6">
        <Logo href={localePath(lang)} label={common.homeAria} />

        <nav
          aria-label={t.mainAria}
          className={`hidden items-center lg:flex ${
            // Georgian labels are longer, so they sit a little closer together;
            // on the narrowest screens that show this menu they are also a touch
            // smaller, or the row would not fit beside the "Book" button
            lang === "ka"
              ? "gap-x-3.5 text-[15px] min-[1120px]:gap-x-6 min-[1120px]:text-[16px] xl:gap-x-9"
              : "gap-x-8 text-[16px] xl:gap-x-[46px]"
          }`}
        >
          {items.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap border-b-[1.5px] pb-2 pt-3 leading-[normal] transition-colors ${
                  active ? "border-gold text-white" : "border-transparent text-cream hover:text-gold"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {/* on the narrowest phones the switcher moves into the menu below */}
          <LangSwitcher lang={lang} label={switcherLabel} className="max-[359px]:hidden" />

          <Link href={bookHref} className="btn btn-outline-gold hidden sm:inline-flex">
            {common.bookNow} <ArrowRightIcon className="h-3 w-[18px]" />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cream/28 text-cream transition-colors hover:border-gold hover:text-gold lg:hidden"
          >
            <span className="sr-only">{open ? t.closeMenu : t.openMenu}</span>
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label={t.mobileAria}
          className="mb-2 mt-3 flex flex-col rounded-[18px] border border-cream/16 bg-surface p-2.5 text-[16px] lg:hidden"
        >
          {items.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 items-center rounded-xl px-4 transition-colors hover:bg-white/[0.04] ${
                  active ? "text-gold" : "text-cream"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href={bookHref}
            onClick={() => setOpen(false)}
            className="btn btn-outline-gold mt-2 sm:hidden"
          >
            {common.bookNow} <ArrowRightIcon className="h-3 w-[18px]" />
          </Link>
          <LangSwitcher
            lang={lang}
            label={switcherLabel}
            className="mt-2.5 self-start min-[360px]:hidden"
          />
        </nav>
      )}
    </header>
  );
}
