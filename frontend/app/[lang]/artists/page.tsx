import type { Metadata } from "next";
import Link from "next/link";
import { Backdrop } from "@/components/Backdrop";
import { CtaPanel } from "@/components/CtaPanel";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageIntro } from "@/components/PageIntro";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { ArrowRightIcon, ArrowUpRightIcon, PersonIcon } from "@/components/ui/Icons";
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
      <Backdrop scope="artists" fade="long" />
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
            className="grid grid-cols-[repeat(auto-fill,minmax(226px,1fr))] gap-x-[22px] gap-y-11 pt-14"
          >
            {artists.map((artist) => (
              <article key={artist.id} className="flex flex-col">
                <PhotoPlaceholder
                  ratio="3 / 4"
                  aria={t.photoAria}
                  label={displayCase(t.photoLabel, lang)}
                  icon={<PersonIcon className="h-11 w-11 text-orchid" />}
                />
                <div className="flex flex-wrap items-baseline justify-between gap-x-2.5 gap-y-0.5 px-1 pt-2.5">
                  <h2 className="text-[16px] font-semibold leading-[22px] text-[#f3e9f6]">
                    {t.placeholder.name}
                  </h2>
                  <span className="text-[12.5px] leading-5 text-mist-600">{t.placeholder.style}</span>
                </div>
                <p className="mx-1 mt-2 text-[13.5px] leading-[21px] text-mist-400">
                  {t.placeholder.bio}
                </p>
                <a
                  href={artist.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 inline-flex min-h-11 items-center self-start text-[13.5px] font-medium text-mist-200 transition-colors hover:text-gold"
                >
                  {t.placeholder.instagram}
                </a>
                <div className="flex flex-wrap items-center justify-between gap-x-[18px] gap-y-2 px-1">
                  <Link
                    href={localePath(lang, "/tattoos")}
                    className="group inline-flex h-11 items-center gap-2 text-[14px] font-semibold text-[#f3e9f6] transition-colors hover:text-gold"
                  >
                    {t.viewWork}
                    <ArrowRightIcon className="h-3 w-[18px] text-orchid-soft transition group-hover:translate-x-1 group-hover:text-gold" />
                  </Link>
                  <a href="#book" className="btn btn-outline-gold px-[22px] text-[14px]">
                    {t.book}
                  </a>
                </div>
              </article>
            ))}
          </section>

          <CtaPanel
            lang={lang}
            titleLine1={t.ctaTitleLine1}
            titleLine2={t.ctaTitleLine2}
            text={t.ctaText}
            className="mt-16"
          >
            <Link href={localePath(lang, "#idea")} className="btn btn-gold relative">
              {t.cta} <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </Link>
          </CtaPanel>
        </main>
        <Footer lang={lang} dict={dict} />
      </div>
    </div>
  );
}
