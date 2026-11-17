import type { Metadata } from "next";
import Link from "next/link";
import { Backdrop } from "@/components/Backdrop";
import { CtaPanel } from "@/components/CtaPanel";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageIntro } from "@/components/PageIntro";
import { TattooGallery } from "@/components/TattooGallery";
import { ArrowUpRightIcon } from "@/components/ui/Icons";
import { dictionaryFor, getDictionary } from "@/lib/i18n";
import { hasLocale, localePath } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/tattoos">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = dictionaryFor(lang).tattoos;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function TattoosPage() {
  const { lang, dict } = await getDictionary();
  const t = dict.tattoos;

  return (
    <div className="page-ground relative isolate overflow-hidden">
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

          <TattooGallery lang={lang} t={t} />

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
