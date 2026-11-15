import type { Metadata, Viewport } from "next";
import { Inter, Italiana, Noto_Sans_Georgian, Noto_Serif_Georgian } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, locales, localeTags } from "@/lib/i18n/config";
import { dictionaryFor } from "@/lib/i18n";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const italiana = Italiana({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-italiana",
  display: "swap",
});

// Georgian companions: Inter and Italiana have no Georgian letters, so these
// take over for them. Not preloaded, so English visitors never download them.
const georgianSans = Noto_Sans_Georgian({
  subsets: ["georgian"],
  variable: "--font-georgian-sans",
  display: "swap",
  preload: false,
});

const georgianSerif = Noto_Serif_Georgian({
  subsets: ["georgian"],
  variable: "--font-georgian-serif",
  display: "swap",
  preload: false,
});

/** One static page per language: /en and /ka. */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = dictionaryFor(lang);
  return {
    title: { default: meta.title, template: "%s | Myst Tattoo Studio" },
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.ogDescription,
      type: "website",
      locale: localeTags[lang].og,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#10060f",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html
      lang={lang}
      className={`${inter.variable} ${italiana.variable} ${georgianSans.variable} ${georgianSerif.variable}`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
