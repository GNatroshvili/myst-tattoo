"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { nav } from "@/lib/site";
import { MENU_EVENT } from "@/lib/site-menu";
import { LangSwitcher } from "./LangSwitcher";
import { Logo } from "./Logo";
import { ArrowRightIcon, CloseIcon, MenuIcon } from "./ui/Icons";

type Props = {
  lang: Locale;
  nav: Dictionary["nav"];
  common: Dictionary["common"];
  switcherLabel: string;
};

/** quick off the mark, then a soft landing: the same curve the pages reveal with */
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The top of every page. From 1024px the sections stand in a row; below that
 * they are in a menu behind the round button.
 *
 * The menu opens over the page, not in it: nothing below moves. While it is
 * open the page lies blurred under a dark veil and cannot be scrolled, and the
 * menu closes on a tap anywhere outside it, on Escape, when the keyboard's
 * focus leaves the header, and when the window grows wide enough for the row.
 */
export function Header({ lang, nav: t, common, switcherLabel }: Props) {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);

    const onClick = (event: MouseEvent) => {
      const at = event.target as Node;
      // the button opens and closes by itself; a link in the menu closes it as it is followed
      if (menu.current?.contains(at) || toggle.current?.contains(at)) return;
      close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      close();
      toggle.current?.focus();
    };
    const wide = window.matchMedia("(min-width: 1024px)");

    // The page stays where it is under the veil. Where a scrollbar takes room
    // of its own, that room is kept, so nothing jumps sideways.
    const root = document.documentElement;
    const body = document.body;
    const scrollbar = window.innerWidth - root.clientWidth;
    const before = { overflow: root.style.overflow, padding: body.style.paddingRight };
    root.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", close);
    window.dispatchEvent(new CustomEvent(MENU_EVENT, { detail: true }));

    return () => {
      root.style.overflow = before.overflow;
      body.style.paddingRight = before.padding;
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", close);
      window.dispatchEvent(new CustomEvent(MENU_EVENT, { detail: false }));
    };
  }, [open]);

  const items = nav.map((item) => ({ ...item, href: localePath(lang, item.href), label: t[item.key] }));
  const bookHref = localePath(lang, "#idea");
  // a page under a section (an artist's profile) keeps that section lit
  const isActive = (item: (typeof items)[number]) =>
    pathname === item.href || (item.key !== "home" && pathname.startsWith(`${item.href}/`));

  return (
    <header
      className="relative z-30"
      onBlur={(event) => {
        // tabbed out of the menu: it must not stay open over a page the focus is now in
        if (open && event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
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
            ref={toggle}
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

      <AnimatePresence>
        {/* The veil: the whole screen, under the header's own row (the logo
            and the button stay sharp above it) and over everything else. */}
        {open && (
          <m.div
            key="veil"
            aria-hidden
            className="fixed inset-0 -z-10 touch-none bg-ink/80 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
        )}
        {/* Hung under the header, out of the page's flow; on a screen too
            short for it (a phone on its side) it scrolls inside itself. */}
        {open && (
          <m.nav
            key="menu"
            ref={menu}
            id="mobile-nav"
            aria-label={t.mobileAria}
            className="absolute inset-x-0 top-full mt-1 flex max-h-[calc(100dvh_-_100%_-_20px)] flex-col overflow-y-auto overscroll-contain rounded-[18px] border border-cream/16 bg-surface p-2.5 text-[16px] shadow-[0_24px_60px_rgba(0,0,0,0.55)] lg:hidden"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
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
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
