import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-url";

/**
 * /robots.txt: every public page may be crawled, and the sitemap is named.
 *
 * Only the backend's JSON under /api is closed: it is data for the pages, not
 * something to show in search results. The photos under /uploads stay open,
 * so they can be found in image search.
 *
 * The admin panel is deliberately not listed. It keeps itself out of search
 * engines with "noindex" (app/admin/layout.tsx), which a crawler can only read
 * if it is allowed to open the page; and a line here would point at it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
