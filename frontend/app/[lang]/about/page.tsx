import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Backdrop } from "@/components/Backdrop";
import { EmptyNote } from "@/components/EmptyNote";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Reveal } from "@/components/motion/Reveal";
import { PageIntro } from "@/components/PageIntro";
import { getAboutSections } from "@/lib/api";
import { paragraphs } from "@/lib/blog";
import { dictionaryFor, getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { displayCase, hasLocale } from "@/lib/i18n/config";
import { localized } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = dictionaryFor(lang).about;
  return { title: t.metaTitle, description: t.metaDescription };
}

type Copy = { lang: Locale; t: Dictionary["about"] };

const list = "flex flex-col gap-16 pt-14 sm:pt-[72px] lg:gap-24";
/** a section's two halves: stacked, and side by side on wide screens */
const row = "flex flex-col gap-6 lg:gap-16";
/** the photo's frame: wide while it sits over the text, nearer square beside it */
const frame =
  "relative aspect-[4/3] overflow-hidden rounded-[14px] border border-cream/16 bg-[linear-gradient(160deg,#24131b_0%,#150e11_55%,#0e0b0c_100%)] sm:aspect-[16/9] lg:aspect-[5/4] lg:flex-1 lg:self-start";

/**
 * The page's sections, read from the backend when the page is requested: each
 * a photo with its number, its title (if it has one) and its text. On wide
 * screens the photo and the text sit side by side and swap sides from one
 * section to the next; on narrow ones the photo comes first and the text under it.
 */
async function Sections({ lang, t }: Copy) {
  const sections = await getAboutSections();

  if (sections.length === 0) {
    return <EmptyNote lang={lang} title={t.emptyTitle} text={t.emptyText} className="mt-[60px]" />;
  }

  return (
    <section aria-label={t.sectionsAria} className={list}>
      {sections.map((section, i) => {
        const title = localized(section.title, lang);
        return (
          <Reveal
            as="article"
            key={section.id}
            className={`${row} ${i % 2 ? "lg:flex-row-reverse" : "lg:flex-row"}`}
          >
            <div role="img" aria-label={t.photoAria.replace("{number}", String(i + 1))} className={frame}>
              {/* Already sized and compressed by the backend. */}
              <Image
                src={section.image.full}
                alt=""
                fill
                unoptimized
                preload={i === 0}
                className="object-cover"
                draggable={false}
              />
            </div>

            {/* centred against the photo while it is the shorter of the two */}
            <div className="min-w-0 lg:flex-1 lg:self-center">
              <div aria-hidden className="flex items-center gap-3.5">
                <span className="font-display text-[34px] leading-none text-gold sm:text-[40px]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="block h-px w-[110px] bg-gradient-to-r from-gold to-gold/0" />
              </div>
              {title && (
                <h2 className="display mt-5 text-balance break-words text-[length:calc(clamp(29px,3.4vw,36px)*var(--display-scale))] leading-[1.22] tracking-[0.5px] text-cream">
                  {displayCase(title, lang)}
                </h2>
              )}
              {paragraphs(localized(section.body, lang)).map((paragraph, n) => (
                <p
                  key={n}
                  className={`whitespace-pre-line break-words text-[17px] font-light leading-7 text-body sm:text-[18px] sm:leading-[30px] ${
                    n > 0 ? "mt-[22px]" : title ? "mt-[18px]" : "mt-5"
                  }`}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        );
      })}
    </section>
  );
}

/** Shown while the sections load: two of them, in the page's shape. */
function SectionsSkeleton() {
  return (
    <div aria-hidden className={`${list} animate-pulse`}>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className={`${row} ${i % 2 ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
          <div className="aspect-[4/3] rounded-[14px] border border-cream/10 bg-surface sm:aspect-[16/9] lg:aspect-[5/4] lg:flex-1" />
          <div className="lg:flex-1 lg:self-center">
            <div className="h-9 w-40 rounded bg-cream/[0.07]" />
            <div className="mt-5 h-8 w-[min(320px,80%)] rounded bg-cream/[0.07]" />
            {Array.from({ length: 4 }).map((_, n) => (
              <div key={n} className="mt-4 h-5 rounded bg-cream/[0.05]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function AboutPage() {
  const { lang, dict } = await getDictionary();
  const t = dict.about;

  return (
    <div className="page-ground relative isolate min-h-dvh overflow-hidden">
      <Backdrop scope="about" />
      <div className="container-x">
        <Header lang={lang} nav={dict.nav} common={dict.common} switcherLabel={dict.langSwitcher.aria} />
        <main>
          <PageIntro lang={lang} eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} lead={t.lead} />

          <Suspense fallback={<SectionsSkeleton />}>
            <Sections lang={lang} t={t} />
          </Suspense>
        </main>
        <Footer lang={lang} dict={dict} />
      </div>
    </div>
  );
}
