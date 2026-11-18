import type { Locale } from "./i18n/config";
import type { Dictionary } from "./i18n/dictionaries/en";
import { localized, type Piercing } from "./types";

/** What a piercing's photo shows, in words: "Nose piercing by Nino". */
export function piercingAlt(piercing: Piercing, t: Dictionary["piercing"], lang: Locale) {
  const place = piercing.place ? localized(piercing.place.name, lang) : "";
  return piercing.artist
    ? t.photoAltBy.replace("{place}", place).replace("{artist}", localized(piercing.artist.nickname, lang))
    : t.photoAlt.replace("{place}", place);
}
