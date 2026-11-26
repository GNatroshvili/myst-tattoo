"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { localeLabels, locales, type Locale } from "@/lib/i18n/config";

/** the address's query does not change under a page that is up: nothing to listen for */
const noSubscription = () => () => {};

/**
 * ENG / ქარ toggle. Each side links to the same page in that language. The
 * choice is not remembered: an address without a language always opens in
 * English (see proxy.ts).
 *
 * Plain links on purpose: changing language reloads the page, so the document
 * language, fonts and every piece of copy switch together.
 */
export function LangSwitcher({
  lang,
  label,
  className = "",
}: {
  lang: Locale;
  label: string;
  className?: string;
}) {
  const pathname = usePathname();
  // What follows "?" in the address (the booking page's "?artist=…") goes along
  // to the other language. The server does not know it when it draws the page,
  // so it is read in the browser, once the page is up.
  const query = useSyncExternalStore(
    noSubscription,
    () => window.location.search,
    () => "",
  );
  // "/en/artists" → "/artists"; the bare "/en" → ""
  const rest = pathname.replace(/^\/[^/]+/, "") + query;

  return (
    <nav
      aria-label={label}
      className={`flex h-11 shrink-0 items-center rounded-full border border-cream/28 p-1 text-[12px] font-medium leading-none ${className}`}
    >
      {locales.map((locale) => {
        const active = locale === lang;
        return (
          <a
            key={locale}
            href={`/${locale}${rest}`}
            hrefLang={locale}
            lang={locale}
            title={localeLabels[locale].name}
            aria-label={localeLabels[locale].name}
            aria-current={active ? "true" : undefined}
            className={`flex h-full min-w-[42px] items-center justify-center rounded-full px-2.5 tracking-[0.6px] sm:px-3 transition-colors ${
              active ? "bg-raised text-gold" : "text-cream hover:text-gold"
            }`}
          >
            {localeLabels[locale].short}
          </a>
        );
      })}
    </nav>
  );
}
