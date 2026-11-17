"use client";

import { usePathname } from "next/navigation";
import { LOCALE_COOKIE, localeLabels, locales, type Locale } from "@/lib/i18n/config";

/** Saves the picked language for a year; proxy.ts reads it on visits to "/". */
function remember(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

/**
 * ENG / ქარ toggle. Each side links to the same page in that language and
 * remembers the choice, so a later visit to "/" opens in it.
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
  // "/en/artists" → "/artists"; the bare "/en" → ""
  const rest = pathname.replace(/^\/[^/]+/, "");

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
            onClick={() => remember(locale)}
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
