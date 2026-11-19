import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n/config";

/**
 * Every public page lives under /en or /ka. An address without a language is
 * sent to the English one, always: neither the browser's own language nor an
 * earlier choice is consulted, because the studio wants every visit to start
 * in English. Georgian is one click away, in the switcher.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasPrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasPrefix) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // public pages only: skip Next internals, the API, the admin panel (it has
  // one language and no prefix) and anything with a file extension
  matcher: ["/((?!_next|api|admin|.*\\..*).*)"],
};
