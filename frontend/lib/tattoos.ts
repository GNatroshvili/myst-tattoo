import type { Locale } from "./i18n/config";
import type { Dictionary } from "./i18n/dictionaries/en";
import { localized, type Tattoo } from "./types";

/** What a tattoo's photo shows, in words: "Fine line tattoo by Nino". */
export function tattooAlt(tattoo: Tattoo, t: Dictionary["tattoos"], lang: Locale) {
  const style = tattoo.style ? localized(tattoo.style.name, lang) : "";
  return tattoo.artist
    ? t.photoAltBy.replace("{style}", style).replace("{artist}", tattoo.artist.nickname)
    : t.photoAlt.replace("{style}", style);
}
