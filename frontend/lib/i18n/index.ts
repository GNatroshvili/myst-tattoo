import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { hasLocale, type Locale } from "./config";
import { en, type Dictionary } from "./dictionaries/en";
import { ka } from "./dictionaries/ka";

const dictionaries: Record<Locale, Dictionary> = { en, ka };

/** Copy for a known language. */
export const dictionaryFor = (locale: Locale): Dictionary => dictionaries[locale];

/**
 * Language and copy for the current request, read from the `[lang]` root
 * segment. Server Components only; Client Components get what they need as props.
 */
export async function getDictionary(): Promise<{ lang: Locale; dict: Dictionary }> {
  const locale = await lang();
  // undefined outside the /en and /ka trees (the admin panel has no language)
  if (!locale || !hasLocale(locale)) notFound();
  return { lang: locale, dict: dictionaries[locale] };
}

export type { Dictionary, Locale };
