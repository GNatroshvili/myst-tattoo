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
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  InstagramIcon,
  PersonIcon,
  StarIcon,
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
      <Backdrop scope="artist" fade="long" />
      <div className="container-x">
        <Header lang={lang} nav={dict.nav} common={dict.common} switcherLabel={dict.langSwitcher.aria} />
        <main>
          <Link
            href={localePath(lang, "/artists")}
            className="group mt-[26px] inline-flex h-11 items-center gap-2.5 text-[14px] font-medium text-mist-500 transition-colors hover:text-gold lg:ml-7"
          >
            <ArrowLeftIcon className="h-3 w-[18px] text-orchid-soft transition group-hover:-translate-x-1 group-hover:text-gold" />
            {t.back}
          </Link>

          <section className="flex flex-wrap items-center gap-x-16 gap-y-9 pt-[18px] lg:pl-7">
            <PhotoPlaceholder
              ratio="3 / 4"
              aria={dict.artists.photoAria}
              label={displayCase(dict.artists.photoLabel, lang)}
              icon={<PersonIcon className="h-[52px] w-[52px] text-orchid" />}
              className="min-w-[240px] flex-[0_1_340px]"
            />

            <div className="min-w-0 flex-[1_1_420px]">
              <p className="caps text-[12px] leading-4 tracking-[4.4px] text-[#d3bbdb]">
                {displayCase(t.eyebrow, lang)}
              </p>
              <h1 className="display mt-[18px] text-[length:calc(clamp(42px,5vw,64px)*var(--display-scale))] leading-[1.1] tracking-[1px] text-petal-200">
                {displayCase(t.placeholder.firstName, lang)}
                <br />
                {displayCase(t.placeholder.lastName, lang)}
              </h1>
              <p className="caps mt-[18px] text-[16px] leading-[22px] tracking-[5px] text-[#c7a9d0] sm:tracking-[7px]">
                {displayCase(t.placeholder.styles, lang)}
              </p>

              {/* gold star with a line fading out to the right */}
              <div aria-hidden className="-ml-2.5 mt-5 flex items-center gap-1.5">
                <StarIcon className="h-[34px] w-[34px] text-gold drop-shadow-[0_0_6px_rgba(250,225,40,0.55)]" />
                <span className="block h-[1.5px] w-[130px] bg-gradient-to-r from-gold to-gold/0" />
              </div>

              <p className="mt-5 max-w-[520px] text-[17px] leading-[27px] text-mist-400">
                {t.placeholder.bio}
              </p>
              <a
                href={artist.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3.5 inline-flex min-h-11 items-center gap-3 text-[16px] font-medium text-mist-200 transition-colors hover:text-gold"
              >
                <InstagramIcon strokeWidth={1.6} className="h-[26px] w-[26px] text-orchid" />
                {t.placeholder.instagram}
              </a>

              <div className="mt-[22px] flex flex-wrap gap-x-5 gap-y-3.5">
                <a href="#book" className="btn btn-gold">
                  {t.book} <ArrowUpRightIcon className="h-3.5 w-3.5" />
                </a>
                <a href="#works" className="btn btn-outline px-[30px]">
                  {t.seeWorks}
                </a>
              </div>
            </div>
          </section>

          <section id="works" aria-labelledby="works-title" className="scroll-mt-6 pt-[60px]">
            <SectionDivider />
            <h2
              id="works-title"
              className="display mt-5 text-center text-[length:calc(clamp(34px,3.75vw,48px)*var(--display-scale))] leading-[1.1] tracking-[0.5px] text-mist-50"
            >
              {displayCase(t.worksTitle, lang)}
            </h2>
            <p className="mx-auto mt-3.5 max-w-[470px] text-center text-[14.5px] leading-[23px] text-mist-300">
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
              <Link href={localePath(lang, "/tattoos")} className="btn btn-outline px-[30px]">
                {t.allTattoos}
              </Link>
              <Link href={localePath(lang, "#idea")} className="btn btn-gold">
                {dict.common.bookAppointment} <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CtaPanel>
        </main>
        <Footer lang={lang} dict={dict} />
      </div>
    </div>
  );
}
