import type { Metadata, Viewport } from "next";
import { fontVariables } from "../fonts";
import "../globals.css";

/**
 * The admin panel has its own root layout: it sits outside the /en and /ka
 * trees, is written in Georgian only, and is kept out of search engines.
 */
export const metadata: Metadata = {
  title: "ადმინ პანელი | Myst Tattoo Studio",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#090808",
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="ka" className={fontVariables}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
