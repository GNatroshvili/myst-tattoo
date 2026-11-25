/**
 * Central place for studio details and navigation.
 * Values prefixed NEXT_PUBLIC_ can be overridden from .env.local.
 * Everything a visitor reads lives in lib/i18n/dictionaries instead.
 */
/** The studio's WhatsApp number, used when NEXT_PUBLIC_WHATSAPP_NUMBER is not set. */
const WHATSAPP_NUMBER = "995505052449";

/**
 * A number as wa.me links need it: digits only, with the country code. Spaces,
 * "+" and dashes are dropped, and a Georgian mobile number written the local
 * way ("599 21 01 85") gets its 995 in front. An empty setting falls back to
 * the studio's number above.
 */
function whatsappNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  const full = /^5\d{8}$/.test(digits) ? `995${digits}` : digits;
  // the made-up number this project's example settings used to carry: a
  // deployment still set to it gets the studio's real one
  return full === "995555000000" ? WHATSAPP_NUMBER : full;
}

export const site = {
  name: "Myst Tattoo Studio",
  shortName: "Myst",
  /** international format, digits only, e.g. 995505052449 */
  whatsappNumber: whatsappNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || WHATSAPP_NUMBER),
  instagram: [
    // the studio's own account comes first: the "Instagram DM" button writes to it
    { handle: "@myst.tattoostudio", url: "https://www.instagram.com/myst.tattoostudio/" },
    { handle: "@myst.piercings", url: "https://instagram.com/myst.piercings" },
  ],
  timeZone: "Asia/Tbilisi",
} as const;

/** Main navigation; `key` picks the label from the dictionary's `nav` section. */
export const nav = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "artists", href: "/artists" },
  { key: "tattoos", href: "/tattoos" },
  { key: "piercing", href: "/piercing" },
  { key: "course", href: "/course" },
  { key: "blog", href: "/blog" },
] as const;

/**
 * The address that opens a private chat with the account: in the app on a
 * phone, on instagram.com otherwise (after signing in, if the visitor is not).
 * It is where Instagram's short ig.me links lead; the short domain itself does
 * not open for everyone, so the button goes to instagram.com directly.
 */
export function instagramDmUrl(handle: string) {
  return `https://www.instagram.com/m/${handle.replace(/^@/, "")}`;
}
