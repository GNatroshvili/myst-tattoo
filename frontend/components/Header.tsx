"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { nav } from "@/lib/site";
import { LangSwitcher } from "./LangSwitcher";
import { Logo } from "./Logo";
import { ArrowUpRightIcon, CloseIcon, MenuIcon } from "./ui/Icons";

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

  return (
    <header className="relative z-30">
      <div className="flex items-center justify-between gap-x-3 pb-1.5 pt-3.5 sm:gap-x-5 lg:pl-4">
        <Logo href={localePath(lang)} label={common.homeAria} />

        <nav
          aria-label={t.mainAria}
          className={`hidden items-center text-[15px] font-medium lg:flex ${
            // Georgian labels are longer, so they sit a little closer together
            lang === "ka" ? "gap-x-6 xl:gap-x-9" : "gap-x-9 xl:gap-x-[58px]"
          }`}
        >
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap border-b-2 pb-2.5 pt-3 transition-colors ${
                  active
                    ? "border-gold text-white"
                    : "border-transparent text-mist-100 hover:text-gold"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 lg:-mr-3">
          {/* on the narrowest phones the switcher moves into the menu below */}
          <LangSwitcher lang={lang} label={switcherLabel} className="max-[359px]:hidden" />

          <Link href={bookHref} className="btn btn-outline-gold hidden sm:inline-flex">
            {common.bookNow} <ArrowUpRightIcon className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line/40 text-mist-100 transition-colors hover:border-gold hover:text-gold lg:hidden"
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
          className="mb-2 mt-3 flex flex-col rounded-[18px] border border-line/20 bg-surface p-2.5 text-[16px] font-medium lg:hidden"
        >
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 items-center rounded-xl px-4 transition-colors hover:bg-white/[0.04] ${
                  active ? "text-gold" : "text-mist-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href={bookHref}
            onClick={() => setOpen(false)}
            className="btn btn-gold mt-2 sm:hidden"
          >
            {common.bookNow} <ArrowUpRightIcon className="h-3.5 w-3.5" />
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
