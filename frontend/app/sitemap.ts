import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getArtists, getBlogPosts, getPiercings, getTattoos } from "@/lib/api";
import { defaultLocale, localePath, locales, type Locale } from "@/lib/i18n/config";
import { siteOrigin } from "@/lib/site-url";
import type { Photo } from "@/lib/types";

/**
 * /sitemap.xml: every public page, in both languages, for search engines.
 *
 * The pages that are always there, then one profile per artist and one page
 * per blog article, read from the backend each time the sitemap is asked for,
 * so what the admin panel adds is listed straight away. If the backend cannot
 * be reached those are missing until the next time; the rest is still listed.
 *
 * Each address names its counterpart in the other language, and the photos
 * its page shows, which is how they are found in image search.
 */

/** The pages that exist whatever the admin panel holds; a new page is added here. */
const pages = ["/", "/about", "/artists", "/tattoos", "/piercing", "/course", "/blog", "/privacy"];

/** A sitemap may name at most this many photos for one page. */
const IMAGES_MAX = 1000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // asked for by a crawler, not built ahead: the lists below are today's
  await connection();

  const origin = siteOrigin();
  const address = (lang: Locale, path: string) => `${origin}${localePath(lang, path)}`;
  // a photo on the backend's disk is "/uploads/…"; one kept in Blob already has its full address
  const photos = (list: (Photo | null | undefined)[]) =>
    list
      .filter((photo): photo is Photo => !!photo)
      .slice(0, IMAGES_MAX)
      .map((photo) => new URL(photo.full, origin).href);

  /**
   * One page as the sitemap lists it: once for each language it is written
   * in, each naming the others. An address without a language opens the
   * default one, so that is the one named for every other language.
   */
  const entries = (
    path: string,
    { langs = locales, lastModified, images = [] }: { langs?: readonly Locale[]; lastModified?: string; images?: string[] } = {},
  ): MetadataRoute.Sitemap => {
    const languages: Record<string, string> = Object.fromEntries(langs.map((lang) => [lang, address(lang, path)]));
    if (langs.includes(defaultLocale)) languages["x-default"] = address(defaultLocale, path);
    return langs.map((lang) => ({
      url: address(lang, path),
      lastModified,
      alternates: { languages },
      ...(images.length > 0 && { images }),
    }));
  };

  const [artists, tattoos, piercings, posts] = await Promise.all([
    getArtists(),
    getTattoos(),
    getPiercings(),
    getBlogPosts(),
  ]);

  const gallery: Record<string, string[]> = {
    "/tattoos": photos(tattoos.map((tattoo) => tattoo.image)),
    "/piercing": photos(piercings.map((piercing) => piercing.image)),
  };

  return [
    ...pages.flatMap((path) => entries(path, { images: gallery[path] })),

    // a profile shows the artist's photo and everything they have done
    ...artists.flatMap((artist) =>
      entries(`/artists/${artist.slug}`, {
        images: photos([
          artist.photo,
          ...tattoos.filter((tattoo) => tattoo.artist?.id === artist.id).map((tattoo) => tattoo.image),
          ...piercings.filter((piercing) => piercing.artist?.id === artist.id).map((piercing) => piercing.image),
        ]),
      }),
    ),

    // An article written in one language only shows that text on both sites.
    // It is listed where it is written, so the same text is not offered twice.
    ...posts.flatMap((post) => {
      const written = locales.filter((lang) => post.body[lang]?.trim());
      return entries(`/blog/${post.slug}`, {
        langs: written.length > 0 ? written : locales,
        lastModified: post.updatedAt,
        images: photos([post.image]),
      });
    }),
  ];
}
