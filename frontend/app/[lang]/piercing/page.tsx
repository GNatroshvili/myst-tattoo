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
import { PiercingPrices } from "@/components/PiercingPrices";
import { PiercingWorks } from "@/components/PiercingWorks";
import { SectionDivider } from "@/components/SectionDivider";
import { ArrowUpRightIcon } from "@/components/ui/Icons";
import { getPiercings, getPiercingZones } from "@/lib/api";
import { dictionaryFor, getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { bookPath, displayCase, hasLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/piercing">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = dictionaryFor(lang).piercing;
  return { title: t.metaTitle, description: t.metaDescription };
}

type Copy = { lang: Locale; t: Dictionary["piercing"] };

/** Zones and prices, read from the backend when the page is requested. */
async function Prices({ lang, t }: Copy) {
  const zones = await getPiercingZones();
  if (zones.length === 0) {
    return <EmptyNote lang={lang} title={t.pricesEmptyTitle} text={t.pricesEmptyText} className="mt-[30px]" />;
  }
  return <PiercingPrices lang={lang} t={t} zones={zones} />;
}

/** Shown while the prices load: the zone buttons' and the list's outlines. */
function PricesSkeleton() {
  return (
    <div aria-hidden className="flex animate-pulse flex-wrap items-start justify-between gap-x-16 gap-y-8 pt-[30px] lg:pl-5">
      <div className="flex flex-col gap-4 pt-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 w-[190px] rounded-full border border-cream/10 bg-surface" />
        ))}
      </div>
      <div className="min-w-0 flex-[0_1_600px]">
        <div className="mb-[22px] h-[26px]" />
        <div className="border-t border-cream/18">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[59px] border-b border-cream/18" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** The gallery, with the photos read from the backend when the page is requested. */
async function Works({ lang, t }: Copy) {
  const piercings = await getPiercings();
  if (piercings.length === 0) {
    return <EmptyNote lang={lang} title={t.worksEmptyTitle} text={t.worksEmptyText} className="mt-9" />;
  }
  return <PiercingWorks lang={lang} t={t} piercings={piercings} />;
}

/** Shown while the photos load: a few empty tiles. */
function WorksSkeleton() {
  return (
    <div aria-hidden className="work-grid mt-[26px] animate-pulse pt-[78px]">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="aspect-[3/4] rounded-[14px] border border-cream/10 bg-surface" />
      ))}
    </div>
  );
}

export default async function PiercingPage() {
  const { lang, dict } = await getDictionary();
  const t = dict.piercing;

  return (
    <div className="page-ground relative isolate min-h-dvh overflow-hidden">
      <Backdrop scope="piercing" />
      <div className="container-x">
        <Header lang={lang} nav={dict.nav} common={dict.common} switcherLabel={dict.langSwitcher.aria} />
        <main>
          <PageIntro lang={lang} eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />

          <Reveal>
            <Suspense fallback={<PricesSkeleton />}>
              <Prices lang={lang} t={t} />
            </Suspense>
          </Reveal>

          <section id="works" aria-labelledby="works-title" className="scroll-mt-6 pt-16 lg:pt-[84px]">
            <Reveal>
              <SectionDivider />
              <h2
                id="works-title"
                className="display mt-5 text-balance text-center text-[length:calc(clamp(42px,5vw,64px)*var(--display-scale))] leading-[1.04] tracking-[1px] text-cream"
              >
                {displayCase(t.worksTitle, lang)}
              </h2>
              <p className="mx-auto mt-3.5 max-w-[470px] text-center text-[17px] font-light leading-[25px] text-body">
                {t.worksLead}
              </p>
            </Reveal>

            <Suspense fallback={<WorksSkeleton />}>
              <Works lang={lang} t={t} />
            </Suspense>
          </section>

          <CtaPanel
            lang={lang}
            titleLine1={t.ctaTitleLine1}
            titleLine2={t.ctaTitleLine2}
            text={t.ctaText}
            className="mt-11"
          >
            <Link href={bookPath(lang, { service: "piercing" })} className="btn btn-gold relative">
              {dict.common.bookAppointment} <ArrowUpRightIcon className="h-[13px] w-[13px]" />
            </Link>
          </CtaPanel>
        </main>
        <Footer lang={lang} dict={dict} />
      </div>
    </div>
  );
}
