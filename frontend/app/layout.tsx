import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Myst Tattoo Studio — Tattoos & Piercings in Tbilisi",
    template: "%s | Myst Tattoo Studio",
  },
  description:
    "Myst Tattoo Studio — a creative space in Tbilisi for self-expression, unique ideas and high-quality body art. Tattoos, piercings and gift vouchers.",
  keywords: ["tattoo", "piercing", "Tbilisi", "tattoo studio", "Myst"],
  openGraph: {
    title: "Myst Tattoo Studio — Tattoos & Piercings in Tbilisi",
    description:
      "A creative space for self-expression, unique ideas and high-quality body art.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
