import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, hasLocale, LOCALE_COOKIE, locales, type Locale } from "@/lib/i18n/config";

/**
 * Picks a language for a visitor who arrived without one in the URL:
 * the one they chose with the switcher, else their browser's preference,
 * else the default.
 */
function pickLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && hasLocale(saved)) return saved;

  const header = request.headers.get("accept-language") ?? "";
  const preferred = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { base: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .filter((entry) => entry.base && !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q);

  for (const { base } of preferred) if (hasLocale(base)) return base;
  return defaultLocale;
}

/** Every page lives under /en or /ka; anything else is redirected there. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasPrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasPrefix) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${pickLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // pages only: skip Next internals, API routes and anything with a file extension
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
