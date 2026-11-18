import type { Metadata } from "next";
import Link from "next/link";
import { Backdrop } from "@/components/Backdrop";
import { BlogPosts } from "@/components/BlogPosts";
import { CtaPanel } from "@/components/CtaPanel";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageIntro } from "@/components/PageIntro";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { dictionaryFor, getDictionary } from "@/lib/i18n";
import { hasLocale, localePath } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/blog">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = dictionaryFor(lang).blog;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function BlogPage() {
  const { lang, dict } = await getDictionary();
  const t = dict.blog;

  return (
    <div className="page-ground relative isolate min-h-dvh overflow-hidden">
      <Backdrop scope="blog" />
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

          <BlogPosts lang={lang} t={t} />

          <CtaPanel
            lang={lang}
            titleLine1={t.ctaTitleLine1}
            titleLine2={t.ctaTitleLine2}
            text={t.ctaText}
            className="mt-16"
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
