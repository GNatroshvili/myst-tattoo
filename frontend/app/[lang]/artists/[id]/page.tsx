import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtistWorks } from "@/components/ArtistWorks";
import { Backdrop } from "@/components/Backdrop";
import { CtaPanel } from "@/components/CtaPanel";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Reveal } from "@/components/motion/Reveal";
import { PhotoFrame } from "@/components/PhotoFrame";
import { SectionDivider } from "@/components/SectionDivider";
import { StarRule } from "@/components/StarRule";
import { WorkTile } from "@/components/WorkTile";
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  InstagramIcon,
  PersonIcon,
} from "@/components/ui/Icons";
import { getArtist } from "@/lib/api";
import { dictionaryFor, getDictionary } from "@/lib/i18n";
import { displayCase, hasLocale, localePath } from "@/lib/i18n/config";
import { piercingAlt } from "@/lib/piercing";
import { instagramHandle, localized } from "@/lib/types";

/**
 * The profile is read from the backend on every request, and the page waits
 * for it rather than showing a placeholder first. An address with no artist
 * behind it shows the "not found" page; once built, the response has already
 * begun by then, so it goes out as 200 marked "noindex" rather than as a 404.
 */
export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/artists/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  if (!hasLocale(lang)) return {};
  const t = dictionaryFor(lang).artist;
  const artist = await getArtist(id);
  if (!artist) return { title: t.metaTitle, description: t.metaDescription };
  return {
    title: localized(artist.nickname, lang),
    description: localized(artist.bio, lang) || t.metaDescription,
  };
}

export default async function ArtistPage({ params }: PageProps<"/[lang]/artists/[id]">) {
  const { id } = await params;
  const artist = await getArtist(id);
  if (!artist) notFound();

  const { lang, dict } = await getDictionary();
  const t = dict.artist;
  // the same artist on both sites: the nickname and the bio in the page's language
  const name = localized(artist.nickname, lang);
  const bio = localized(artist.bio, lang);
  const tattoos = artist.tattoos ?? [];
  const piercings = artist.piercings ?? [];
  // A piercer's profile shows their piercings in place of the (empty) tattoo
  // section; an artist with both gets both, tattoos first.
  const showTattoos = tattoos.length > 0 || piercings.length === 0;
  const tags = artist.styles.map((style) => localized(style.name, lang));
  if (piercings.length > 0) tags.push(dict.artists.piercingTag);
  const styles = tags.join(" / ");

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

          {/* Side by side while both fit (from 898px). Below that the photo is
              centred above the text, as wide as the page allows while the
              screen still shows it whole together with the name and styles
              under it (the 400px are the header above and those lines below).
              Never narrower than 240px, for phones held sideways. */}
          <section className="flex flex-col gap-y-9 pt-[18px] min-[898px]:flex-row min-[898px]:items-center min-[898px]:gap-x-16 lg:pl-5">
            <PhotoFrame
              ratio="3 / 4"
              aria={artist.photo ? name : dict.artists.photoAria}
              photo={artist.photo}
              size="full"
              label={displayCase(dict.artists.photoLabel, lang)}
              icon={<PersonIcon strokeWidth={1.2} className="h-[52px] w-[52px] text-rose" />}
              className="enter mx-auto w-[min(100%,max(240px,(100svh_-_400px)_*_0.75))] min-[898px]:mx-0 min-[898px]:w-auto min-[898px]:min-w-[240px] min-[898px]:flex-[0_1_350px]"
            />

            <div className="enter enter-1 min-w-0 min-[898px]:flex-[1_1_420px]">
              <p className="caps eyebrow">{displayCase(t.eyebrow, lang)}</p>
              <h1 className="display mt-[22px] break-words text-[length:calc(clamp(44px,5.2vw,66px)*var(--display-scale))] leading-[1.02] tracking-[0.5px] text-cream">
                {displayCase(name, lang)}
              </h1>
              {styles && (
                <p className="caps mt-5 text-[17px] font-light leading-[22px] tracking-[5px] text-cream sm:tracking-[7px]">
                  {displayCase(styles, lang)}
                </p>
              )}

              <StarRule className="-ml-1.5 mt-6" star="h-[30px] w-[30px]" />

              {bio && (
                <p className="mt-6 max-w-[520px] whitespace-pre-line text-[18px] font-light leading-[27px] text-body">
                  {bio}
                </p>
              )}
              {artist.instagramUrl && (
                <a
                  href={artist.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3.5 inline-flex min-h-11 items-center gap-3.5 text-[17px] text-cream transition-colors hover:text-gold"
                >
                  <InstagramIcon className="h-7 w-7" />
                  {instagramHandle(artist.instagramUrl)}
                </a>
              )}

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

          {showTattoos && (
            <section id="works" aria-labelledby="works-title" className="scroll-mt-6 pt-[72px]">
              <Reveal>
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
              </Reveal>

              <ArtistWorks lang={lang} t={t} tattoosCopy={dict.tattoos} tattoos={tattoos} />
            </section>
          )}

          {piercings.length > 0 && (
            // "See works" above jumps to #works: that is this section when there are no tattoos
            <section
              id={showTattoos ? "piercings" : "works"}
              aria-labelledby="piercings-title"
              className="scroll-mt-6 pt-[72px]"
            >
              <Reveal>
                <SectionDivider />
                <h2
                  id="piercings-title"
                  className="display mt-[22px] text-center text-[length:calc(clamp(36px,4vw,52px)*var(--display-scale))] leading-[1.04] tracking-[0.5px] text-cream"
                >
                  {displayCase(t.piercingsTitle, lang)}
                </h2>
                <p className="mx-auto mt-3.5 max-w-[470px] text-center text-[17px] font-light leading-[25px] text-body">
                  {t.piercingsLead}
                </p>
              </Reveal>

              <div className="work-grid mt-9">
                {piercings.map((piercing, i) => (
                  <WorkTile
                    key={piercing.id}
                    order={i}
                    photo={piercing.image}
                    aria={piercingAlt(piercing, dict.piercing, lang)}
                    title={piercing.place ? localized(piercing.place.name, lang) : ""}
                    note={piercing.place?.zone ? localized(piercing.place.zone.name, lang) : undefined}
                  />
                ))}
              </div>
            </section>
          )}

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
