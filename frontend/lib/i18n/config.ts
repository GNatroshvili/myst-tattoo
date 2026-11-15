/** Languages the site is published in. */
export const locales = ["en", "ka"] as const;
export type Locale = (typeof locales)[number];

/** Used when a visitor's browser asks for neither language. */
export const defaultLocale: Locale = "en";

/** Remembers the language a visitor picked with the switcher. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** Tags used for date formatting and Open Graph. */
export const localeTags: Record<Locale, { intl: string; og: string }> = {
  en: { intl: "en-GB", og: "en_US" },
  ka: { intl: "ka-GE", og: "ka_GE" },
};

/** Short names shown in the language switcher. */
export const localeLabels: Record<Locale, { short: string; name: string }> = {
  en: { short: "ENG", name: "English" },
  ka: { short: "ქარ", name: "ქართული" },
};

/**
 * Text for headings that the design sets in capitals. English is capitalised
 * by CSS (`text-transform: uppercase`), but browsers leave Georgian alone, so
 * Georgian is converted here to its capital letterforms (Mtavruli).
 */
export function displayCase(text: string, lang: Locale) {
  return lang === "ka" ? text.toLocaleUpperCase("ka") : text;
}

/**
 * Puts the language in front of an in-site path:
 * ("ka", "/") → "/ka", ("ka", "/artists") → "/ka/artists", ("ka", "#idea") → "/ka#idea".
 */
export function localePath(lang: Locale, path = "/") {
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}
