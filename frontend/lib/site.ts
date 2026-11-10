/**
 * Central place for studio details and navigation.
 * Values prefixed NEXT_PUBLIC_ can be overridden from .env.local.
 */
export const site = {
  name: "Myst Tattoo Studio",
  shortName: "Myst",
  city: "Tbilisi, Georgia",
  tagline:
    "Myst Tattoo Studio — a creative space for self-expression, unique ideas and high-quality body art.",
  /** International format, digits only (no "+" or spaces), e.g. 995555123456 */
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "995555000000",
  instagram: [
    { handle: "@mysttattoo", url: "https://instagram.com/mysttattoo" },
    { handle: "@myst.piercings", url: "https://instagram.com/myst.piercings" },
  ],
  timeZone: "Asia/Tbilisi",
} as const;

export const nav = [
  { label: "Home", href: "/" },
  { label: "Artists", href: "/artists" },
  { label: "Tattoos", href: "/tattoos" },
  { label: "Piercing", href: "/piercing" },
  { label: "Why Myst", href: "/why-myst" },
] as const;

export const services = ["Tattoo", "Piercing", "Cover-up", "Consultation"] as const;
export type Service = (typeof services)[number];

export const timesOfDay = ["Morning", "Afternoon", "Evening"] as const;
export type TimeOfDay = (typeof timesOfDay)[number];

export function instagramDmUrl(handle: string) {
  return `https://ig.me/m/${handle.replace(/^@/, "")}`;
}
