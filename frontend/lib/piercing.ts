import type { Dictionary } from "./i18n/dictionaries/en";
import type { Piercing } from "./types";

/** What a piercing's photo shows, in words: "Nose piercing by Nino". */
export function piercingAlt(piercing: Piercing, t: Dictionary["piercing"]) {
  const place = piercing.place?.name ?? "";
  return piercing.artist
    ? t.photoAltBy.replace("{place}", place).replace("{artist}", piercing.artist.nickname)
    : t.photoAlt.replace("{place}", place);
}
