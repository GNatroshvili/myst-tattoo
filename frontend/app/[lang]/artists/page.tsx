import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Backdrop } from "@/components/Backdrop";
import { CtaPanel } from "@/components/CtaPanel";
import { EmptyNote } from "@/components/EmptyNote";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Reveal } from "@/components/motion/Reveal";
import { PageIntro } from "@/components/PageIntro";
import { PhotoFrame } from "@/components/PhotoFrame";
import { ArrowRightIcon, PersonIcon } from "@/components/ui/Icons";
import { getArtists } from "@/lib/api";
import { cascade } from "@/lib/cascade";
import { dictionaryFor, getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { displayCase, hasLocale, localePath } from "@/lib/i18n/config";
import { instagramHandle, localized } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/[lang]/artists">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = dictionaryFor(lang).artists;
  return { title: t.metaTitle, description: t.metaDescription };
}

const grid = "grid grid-cols-[repeat(auto-fill,minmax(226px,1fr))] gap-x-6 gap-y-11 pt-[60px]";

/** The artists, read from the backend when the page is requested. */
async function ArtistsGrid({ lang, t }: { lang: Locale; t: Dictionary["artists"] }) {
  const artists = await getArtists();

  if (artists.length === 0) {
    return <EmptyNote lang={lang} title={t.emptyTitle} text={t.emptyText} className="mt-[60px]" />;
  }

  return (
    <section aria-label={t.gridAria} className={grid}>
      {artists.map((artist, i) => {
        const profile = localePath(lang, `/artists/${artist.slug}`);
        const name = localized(artist.nickname, lang);
        const bio = localized(artist.bio, lang);
        // tattoo styles, and "Piercing" for an artist who has piercings attached
        const tags = artist.styles.map((style) => localized(style.name, lang));
        if (artist.piercingCount) tags.push(t.piercingTag);
        return (
          // Like the gallery tiles, the card grows a touch under the mouse. It
          // reveals on a wrapper of its own, which leaves that growing alone.
          <Reveal key={artist.id} delay={cascade(i)} className="flex min-w-0">
            <article className="flex w-full min-w-0 flex-col transition-transform duration-200 hover:scale-[1.03]">
              <PhotoFrame
                ratio="3 / 4"
                aria={`${t.openProfile}: ${name}`}
                photo={artist.photo}
                label={displayCase(t.photoLabel, lang)}
                icon={<PersonIcon className="h-11 w-11 text-rose" />}
                href={profile}
              />
              <div className="flex flex-wrap items-baseline justify-between gap-x-2.5 gap-y-0.5 px-1 pt-3">
                <h2 className="text-[18px] font-medium leading-6 text-cream">{name}</h2>
                <span className="text-[13px] leading-5 text-muted">
                  {tags.join(" / ")}
                </span>
              </div>
              {bio && (
                <p className="mx-1 mt-2 line-clamp-3 text-[14.5px] font-light leading-[22px] text-body">
                  {bio}
                </p>
              )}
              {artist.instagramUrl && (
                <a
                  href={artist.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 inline-flex min-h-11 items-center self-start text-[14.5px] text-cream transition-colors hover:text-gold"
                >
                  {instagramHandle(artist.instagramUrl)}
                </a>
              )}
              {/* pinned to the bottom so the buttons line up across a row of cards */}
              <div className="mt-auto flex flex-wrap items-center justify-between gap-x-[18px] gap-y-2 px-1 pt-1">
                <Link href={profile} className="link-arrow h-11 gap-2.5 text-[15px]">
                  {t.viewProfile}
                  <ArrowRightIcon className="h-3 w-[18px]" />
                </Link>
                <a href="#book" className="btn btn-outline-gold btn-sm">
                  {t.book}
                </a>
              </div>
            </article>
          </Reveal>
        );
      })}
    </section>
  );
}

/** Shown while the artists load: four empty cards in the grid's shape. */
function ArtistsGridSkeleton() {
  return (
    <div aria-hidden className={`${grid} animate-pulse`}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[3/4] rounded-[14px] border border-cream/10 bg-surface" />
          <div className="mx-1 mt-4 h-5 w-32 rounded bg-cream/[0.07]" />
          <div className="mx-1 mt-3 h-4 rounded bg-cream/[0.05]" />
          <div className="mx-1 mt-2 h-4 w-2/3 rounded bg-cream/[0.05]" />
        </div>
      ))}
    </div>
  );
}

export default async function ArtistsPage() {
  const { lang, dict } = await getDictionary();
  const t = dict.artists;

  return (
    <div className="page-ground relative isolate min-h-dvh overflow-hidden">
      <Backdrop scope="artists" />
      <div className="container-x">
        <Header lang={lang} nav={dict.nav} common={dict.common} switcherLabel={dict.langSwitcher.aria} />
        <main>
          <PageIntro
            lang={lang}
            eyebrow={t.eyebrow}
            title={t.title}
            subtitle={t.subtitle}
            lead={t.lead}
          />

          <Suspense fallback={<ArtistsGridSkeleton />}>
            <ArtistsGrid lang={lang} t={t} />
          </Suspense>

          <CtaPanel
            lang={lang}
            titleLine1={t.ctaTitleLine1}
            titleLine2={t.ctaTitleLine2}
            text={t.ctaText}
            className="mt-[60px]"
          >
            <Link href={localePath(lang, "#idea")} className="btn btn-outline-gold relative">
              {t.cta} <ArrowRightIcon className="h-3 w-[18px]" />
            </Link>
          </CtaPanel>
        </main>
        <Footer lang={lang} dict={dict} />
      </div>
    </div>
  );
}
