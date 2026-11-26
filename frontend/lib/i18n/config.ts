/** Languages the site is published in. */
export const locales = ["en", "ka"] as const;
export type Locale = (typeof locales)[number];

/** The language an address without one opens in. */
export const defaultLocale: Locale = "en";

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

/**
 * What the booking form offers, in the order of the dictionaries'
 * `form.services`: the names an address uses for them ("?service=piercing").
 */
export const bookServices = ["tattoo", "piercing", "gift"] as const;
export type BookService = (typeof bookServices)[number];

/** What a "Book" button asks the booking form to start with. */
export type BookPreset = {
  /** the artist to book with, by the slug of their profile */
  artist?: string;
  /** the service picked in the form; without one it is the first, the tattoo consultation */
  service?: BookService;
};

/**
 * The booking page (app/[lang]/book): where every "Book" button outside the
 * home page leads. The home page's own buttons scroll to its form, "#idea".
 *
 * A button that belongs to one artist (their card, their profile) names them,
 * and the form then books with that artist. A button about piercing names the
 * service, and the form opens with it picked.
 */
export function bookPath(lang: Locale, { artist, service }: BookPreset = {}) {
  const query = new URLSearchParams();
  if (artist) query.set("artist", artist);
  if (service) query.set("service", service);
  const search = query.toString();
  return localePath(lang, search ? `/book?${search}` : "/book");
}
