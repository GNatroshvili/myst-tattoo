/**
 * The site's own public address, as scheme and host only:
 * "https://myst-tattoo.example". It is what search engines are told the pages
 * live at: every address in /sitemap.xml and the sitemap's address in
 * /robots.txt start with it.
 *
 * Taken from the SITE_URL setting (see .env.example). Without it, on Vercel,
 * the project's production domain is used: Vercel names it in
 * VERCEL_PROJECT_PRODUCTION_URL, and it is the custom domain once the project
 * has one. Anywhere else nothing set means the local site.
 *
 * Whatever else was typed is dropped: a slash at the end, a path, spaces. A
 * missing "https://" is added.
 */
export function siteOrigin(
  value: string | undefined = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL,
): string {
  const raw = (value ?? "").trim();
  if (!raw) return "http://localhost:3000";
  try {
    return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).origin;
  } catch {
    throw new Error(`SITE_URL is not a valid address: "${raw}". Expected something like https://myst-tattoo.example`);
  }
}
