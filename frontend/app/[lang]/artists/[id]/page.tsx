import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtistWorks } from "@/components/ArtistWorks";
import { Backdrop } from "@/components/Backdrop";
import { CtaPanel } from "@/components/CtaPanel";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { SectionDivider } from "@/components/SectionDivider";
import { StarRule } from "@/components/StarRule";
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  InstagramIcon,
  PersonIcon,
} from "@/components/ui/Icons";
import { dictionaryFor, getDictionary } from "@/lib/i18n";
import { displayCase, hasLocale, localePath } from "@/lib/i18n/config";
import { artists } from "@/lib/portfolio";

/** One profile per artist, in each language: every real profile is prerendered. */
export function generateStaticParams() {
  return artists.map(({ id }) => ({ id }));
}

/**
 * An address with an id that is not in the list has nothing to show early, so
 * it is allowed to wait for the real answer: a proper 404 instead of a
 * placeholder shell.
 */
export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/artists/[id]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = dictionaryFor(lang).artist;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function ArtistPage({ params }: PageProps<"/[lang]/artists/[id]">) {
  const { id } = await params;
  const index = artists.findIndex((artist) => artist.id === id);
  if (index === -1) notFound();
  const artist = artists[index];

  const { lang, dict } = await getDictionary();
  const t = dict.artist;

  return (
    <div className="page-ground relative isolate min-h-dvh overflow-hidden">
      <Backdrop scope="artist" />
      <div className="container-x">
        <Header lang={lang} nav={dict.nav} common={dict.common} switcherLabel={dict.langSwitcher.aria} />
        <main>
          <Link
            href={localePath(lang, "/artists")}
            className="link-arrow link-back mt-7 h-11 gap-3 text-[15px] lg:ml-5"
          >
            <ArrowLeftIcon className="h-3 w-[18px]" />
            {t.back}
          </Link>

          <section className="flex flex-wrap items-center gap-x-16 gap-y-9 pt-[18px] lg:pl-5">
            <PhotoPlaceholder
              ratio="3 / 4"
              aria={dict.artists.photoAria}
              label={displayCase(dict.artists.photoLabel, lang)}
              icon={<PersonIcon strokeWidth={1.2} className="h-[52px] w-[52px] text-rose" />}
              className="min-w-[240px] flex-[0_1_350px]"
            />

            <div className="min-w-0 flex-[1_1_420px]">
              <p className="caps eyebrow">{displayCase(t.eyebrow, lang)}</p>
              <h1 className="display mt-[22px] text-[length:calc(clamp(44px,5.2vw,66px)*var(--display-scale))] leading-[1.02] tracking-[0.5px] text-cream">
                {displayCase(t.placeholder.firstName, lang)}
                <br />
                {displayCase(t.placeholder.lastName, lang)}
              </h1>
              <p className="caps mt-5 text-[17px] font-light leading-[22px] tracking-[5px] text-cream sm:tracking-[7px]">
                {displayCase(t.placeholder.styles, lang)}
              </p>

              <StarRule className="-ml-1.5 mt-6" star="h-[30px] w-[30px]" />

              <p className="mt-6 max-w-[520px] text-[18px] font-light leading-[27px] text-body">
                {t.placeholder.bio}
              </p>
              <a
                href={artist.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3.5 inline-flex min-h-11 items-center gap-3.5 text-[17px] text-cream transition-colors hover:text-gold"
              >
                <InstagramIcon className="h-7 w-7" />
                {t.placeholder.instagram}
              </a>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3.5">
                <a href="#book" className="btn btn-gold">
                  {t.book} <ArrowUpRightIcon className="h-[13px] w-[13px]" />
                </a>
                <a href="#works" className="btn btn-outline">
                  {t.seeWorks}
                </a>
              </div>
            </div>
          </section>

          <section id="works" aria-labelledby="works-title" className="scroll-mt-6 pt-[72px]">
            <SectionDivider />
            <h2
              id="works-title"
              className="display mt-[22px] text-center text-[length:calc(clamp(36px,4vw,52px)*var(--display-scale))] leading-[1.04] tracking-[0.5px] text-cream"
            >
              {displayCase(t.worksTitle, lang)}
            </h2>
            <p className="mx-auto mt-3.5 max-w-[470px] text-center text-[17px] font-light leading-[25px] text-body">
              {t.worksLead}
            </p>

            <ArtistWorks lang={lang} artist={index} t={t} tattoos={dict.tattoos} />
          </section>

          <CtaPanel
            lang={lang}
            titleLine1={t.ctaTitleLine1}
            titleLine2={t.ctaTitleLine2}
            text={t.ctaText}
            className="mt-11"
          >
            <div className="relative flex flex-wrap gap-x-4 gap-y-3">
              <Link href={localePath(lang, "/tattoos")} className="btn btn-outline">
                {t.allTattoos}
              </Link>
              <Link href={localePath(lang, "#idea")} className="btn btn-gold">
                {dict.common.bookAppointment} <ArrowUpRightIcon className="h-[13px] w-[13px]" />
              </Link>
            </div>
          </CtaPanel>
        </main>
        <Footer lang={lang} dict={dict} />
      </div>
    </div>
  );
}
