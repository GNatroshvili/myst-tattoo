import type { Metadata } from "next";
import Link from "next/link";
import { Backdrop } from "@/components/Backdrop";
import { IdeaSection } from "@/components/IdeaSection";
import { LangSwitcher } from "@/components/LangSwitcher";
import { Logo } from "@/components/Logo";
import { ArrowLeftIcon } from "@/components/ui/Icons";
import { dictionaryFor, getDictionary } from "@/lib/i18n";
import { bookServices, hasLocale, localePath, type BookPreset } from "@/lib/i18n/config";

/**
 * The booking page: the home page's "Tell us your idea" form on a page of its
 * own, with a way back home and nothing else. Every "Book" button outside the
 * home page leads here (`bookPath`), so a visitor books in one step instead of
 * being walked to the home page's form. An artist's own buttons add
 * "?artist=<slug>", and the form then books with that artist; the piercing
 * page's add "?service=piercing", and the form opens with that service picked.
 *
 * It is reached from those buttons only: it is not in the menu, not in the
 * sitemap, and asks search engines not to list it.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]/book">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = dictionaryFor(lang);
  return {
    title: dict.book.metaTitle,
    description: dict.idea.lead,
    robots: { index: false, follow: false },
  };
}

export default async function BookPage({ searchParams }: PageProps<"/[lang]/book">) {
  const { lang, dict } = await getDictionary();
  const home = localePath(lang);
  // "?artist=<slug>" and "?service=<name>", set by the "Book" button that led
  // here. Not awaited here: the form reads them as it streams in, and the page
  // around it does not wait. Anything the form does not know is left out.
  const preset = searchParams.then(
    ({ artist, service }): BookPreset => ({
      artist: typeof artist === "string" ? artist : undefined,
      service: bookServices.find((known) => known === service),
    }),
  );

  return (
    <div className="page-ground relative isolate min-h-dvh overflow-hidden">
      <Backdrop scope="book" />
      <div className="container-x">
        {/* the header's own row, without the menu: the logo, the languages and the way back */}
        <header className="flex items-center justify-between gap-x-3 pb-2 pt-4 sm:gap-x-5 sm:pt-6">
          <Logo href={home} label={dict.common.homeAria} />
          <div className="flex items-center gap-2 min-[360px]:gap-3">
            <LangSwitcher lang={lang} label={dict.langSwitcher.aria} />
            {/* phones have room for one word; from 640px the button says where it leads */}
            <Link href={home} className="btn btn-outline-gold max-sm:h-11 max-sm:gap-2 max-sm:px-4 max-sm:text-[15px]">
              <ArrowLeftIcon className="h-3 w-[18px] max-[359px]:hidden" />
              <span className="sm:hidden">{dict.nav.home}</span>
              <span className="max-sm:hidden">{dict.book.backHome}</span>
            </Link>
          </div>
        </header>
        {/* the room under the last card lets it reveal: see Reveal */}
        <main className="pb-24">
          <IdeaSection lang={lang} dict={dict} page preset={preset} />
        </main>
      </div>
    </div>
  );
}
