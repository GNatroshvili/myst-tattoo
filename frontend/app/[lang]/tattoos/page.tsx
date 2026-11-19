import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Backdrop } from "@/components/Backdrop";
import { CtaPanel } from "@/components/CtaPanel";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageIntro } from "@/components/PageIntro";
import { TattooGallery } from "@/components/TattooGallery";
import { ArrowUpRightIcon } from "@/components/ui/Icons";
import { getTattoos } from "@/lib/api";
import { dictionaryFor, getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { hasLocale, localePath } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/tattoos">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = dictionaryFor(lang).tattoos;
  return { title: t.metaTitle, description: t.metaDescription };
}

/** The gallery, with the tattoos read from the backend when the page is requested. */
async function Gallery({ lang, t }: { lang: Locale; t: Dictionary["tattoos"] }) {
  return <TattooGallery lang={lang} t={t} tattoos={await getTattoos()} />;
}

/** Shown while the tattoos load: the filter bar's outline and a few empty tiles. */
function GallerySkeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="mt-[52px] h-[146px] border-y border-cream/18" />
      <div className="work-grid mt-[56px]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-[14px] border border-cream/10 bg-surface" />
        ))}
      </div>
    </div>
  );
}

export default async function TattoosPage() {
  const { lang, dict } = await getDictionary();
  const t = dict.tattoos;

  return (
    <div className="page-ground relative isolate min-h-dvh overflow-hidden">
      <Backdrop scope="tattoos" />
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

          <Suspense fallback={<GallerySkeleton />}>
            <Gallery lang={lang} t={t} />
          </Suspense>

          <CtaPanel
            lang={lang}
            titleLine1={t.ctaTitleLine1}
            titleLine2={t.ctaTitleLine2}
            text={t.ctaText}
            className="mt-11"
          >
            <div className="relative flex flex-wrap gap-x-4 gap-y-3">
              <Link href={localePath(lang, "/artists")} className="btn btn-outline">
                {dict.common.ourArtists}
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
