import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, locales, localeTags } from "@/lib/i18n/config";
import { dictionaryFor } from "@/lib/i18n";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { fontVariables } from "../fonts";
import "../globals.css";

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
  themeColor: "#090808",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html lang={lang} className={fontVariables}>
      <body className="min-h-dvh">
        {/* Parts that reveal on scroll are transparent until a script shows them:
            without scripts they are simply shown. */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
