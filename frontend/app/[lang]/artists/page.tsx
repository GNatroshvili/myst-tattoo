import type { Metadata } from "next";
import Link from "next/link";
import { Backdrop } from "@/components/Backdrop";
import { CtaPanel } from "@/components/CtaPanel";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageIntro } from "@/components/PageIntro";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { ArrowRightIcon, PersonIcon } from "@/components/ui/Icons";
import { dictionaryFor, getDictionary } from "@/lib/i18n";
import { displayCase, hasLocale, localePath } from "@/lib/i18n/config";
import { artists } from "@/lib/portfolio";

export async function generateMetadata({ params }: PageProps<"/[lang]/artists">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = dictionaryFor(lang).artists;
  return { title: t.metaTitle, description: t.metaDescription };
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

          <section
            aria-label={t.gridAria}
            className="grid grid-cols-[repeat(auto-fill,minmax(226px,1fr))] gap-x-6 gap-y-11 pt-[60px]"
          >
            {artists.map((artist) => {
              const profile = localePath(lang, `/artists/${artist.id}`);
              return (
                <article key={artist.id} className="flex flex-col">
                  <PhotoPlaceholder
                    ratio="3 / 4"
                    aria={t.openProfile}
                    label={displayCase(t.photoLabel, lang)}
                    icon={<PersonIcon className="h-11 w-11 text-rose" />}
                    href={profile}
                  />
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2.5 gap-y-0.5 px-1 pt-3">
                    <h2 className="text-[18px] font-medium leading-6 text-cream">
                      {t.placeholder.name}
                    </h2>
                    <span className="text-[13px] leading-5 text-muted">{t.placeholder.style}</span>
                  </div>
                  <p className="mx-1 mt-2 text-[14.5px] font-light leading-[22px] text-body">
                    {t.placeholder.bio}
                  </p>
                  <a
                    href={artist.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 inline-flex min-h-11 items-center self-start text-[14.5px] text-cream transition-colors hover:text-gold"
                  >
                    {t.placeholder.instagram}
                  </a>
                  <div className="flex flex-wrap items-center justify-between gap-x-[18px] gap-y-2 px-1">
                    <Link
                      href={profile}
                      className="link-arrow h-11 gap-2.5 text-[15px]"
                    >
                      {t.viewProfile}
                      <ArrowRightIcon className="h-3 w-[18px]" />
                    </Link>
                    <a href="#book" className="btn btn-outline-gold btn-sm">
                      {t.book}
                    </a>
                  </div>
                </article>
              );
            })}
          </section>

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
