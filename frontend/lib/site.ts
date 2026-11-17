/**
 * Central place for studio details and navigation.
 * Values prefixed NEXT_PUBLIC_ can be overridden from .env.local.
 * Everything a visitor reads lives in lib/i18n/dictionaries instead.
 */
export const site = {
  name: "Myst Tattoo Studio",
  shortName: "Myst",
  /** International format, digits only (no "+" or spaces), e.g. 995555123456 */
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "995555000000",
  instagram: [
    { handle: "@mysttattoo", url: "https://instagram.com/mysttattoo" },
    { handle: "@myst.piercings", url: "https://instagram.com/myst.piercings" },
  ],
  timeZone: "Asia/Tbilisi",
} as const;

/** Main navigation; `key` picks the label from the dictionary's `nav` section. */
export const nav = [
  { key: "home", href: "/" },
  { key: "artists", href: "/artists" },
  { key: "tattoos", href: "/tattoos" },
  { key: "piercing", href: "/piercing" },
  { key: "info", href: "/info" },
] as const;

export function instagramDmUrl(handle: string) {
  return `https://ig.me/m/${handle.replace(/^@/, "")}`;
}
