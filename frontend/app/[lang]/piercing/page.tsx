import type { Metadata } from "next";
import Link from "next/link";
import { Backdrop } from "@/components/Backdrop";
import { CtaPanel } from "@/components/CtaPanel";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageIntro } from "@/components/PageIntro";
import { PiercingPrices } from "@/components/PiercingPrices";
import { PiercingWorks } from "@/components/PiercingWorks";
import { SectionDivider } from "@/components/SectionDivider";
import { ArrowUpRightIcon } from "@/components/ui/Icons";
import { dictionaryFor, getDictionary } from "@/lib/i18n";
import { displayCase, hasLocale, localePath } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/piercing">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = dictionaryFor(lang).piercing;
  return { title: t.metaTitle, description: t.metaDescription };
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

          <PiercingPrices t={t} />

          <section id="works" aria-labelledby="works-title" className="scroll-mt-6 pt-16 lg:pt-[84px]">
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

            <PiercingWorks lang={lang} t={t} />
          </section>

          <CtaPanel
            lang={lang}
            titleLine1={t.ctaTitleLine1}
            titleLine2={t.ctaTitleLine2}
            text={t.ctaText}
            className="mt-11"
          >
            <Link href={localePath(lang, "#idea")} className="btn btn-gold relative">
              {dict.common.bookAppointment} <ArrowUpRightIcon className="h-[13px] w-[13px]" />
            </Link>
          </CtaPanel>
        </main>
        <Footer lang={lang} dict={dict} />
      </div>
    </div>
  );
}
