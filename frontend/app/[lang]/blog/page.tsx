import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Backdrop } from "@/components/Backdrop";
import { BlogPosts, type BlogCard } from "@/components/BlogPosts";
import { CtaPanel } from "@/components/CtaPanel";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageIntro } from "@/components/PageIntro";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { getBlogPosts, getBlogTopics } from "@/lib/api";
import { excerpt, postBody, postDate, readMinutes } from "@/lib/blog";
import { dictionaryFor, getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { bookPath, hasLocale } from "@/lib/i18n/config";
import { localized } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/[lang]/blog">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = dictionaryFor(lang).blog;
  return { title: t.metaTitle, description: t.metaDescription };
}

/**
 * The articles, read from the backend when the page is requested. Everything
 * a card shows is worked out here, in the page's language: the title, the
 * opening of the text, and the date and time the article was added.
 */
async function Articles({ lang, t }: { lang: Locale; t: Dictionary["blog"] }) {
  const [posts, topics] = await Promise.all([getBlogPosts(), getBlogTopics()]);

  const cards: BlogCard[] = posts.map((post) => {
    const body = postBody(post, lang);
    return {
      slug: post.slug,
      title: localized(post.title, lang),
      topic: post.topic && { id: post.topic.id, name: localized(post.topic.name, lang) },
      excerpt: excerpt(body, 150),
      lead: excerpt(body, 260),
      date: postDate(post.createdAt, lang),
      readTime: t.readTime.replace("{minutes}", String(readMinutes(body))),
      image: post.image,
    };
  });
  const used = new Set(posts.map((post) => post.topic?.id));

  return (
    <BlogPosts
      lang={lang}
      t={t}
      posts={cards}
      topics={topics
        .filter((topic) => used.has(topic.id))
        .map((topic) => ({ id: topic.id, name: localized(topic.name, lang) }))}
    />
  );
}

/** Shown while the articles load: the filter bar's outline, the large article and a row of cards. */
function ArticlesSkeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="mt-[52px] h-[90px] border-y border-cream/18" />
      <div className="mt-9 h-[340px] rounded-[18px] border border-cream/10 bg-surface" />
      <div className="mt-[70px] grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-x-6 gap-y-10">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] rounded-[14px] border border-cream/10 bg-surface" />
        ))}
      </div>
    </div>
  );
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

          <Suspense fallback={<ArticlesSkeleton />}>
            <Articles lang={lang} t={t} />
          </Suspense>

          <CtaPanel
            lang={lang}
            titleLine1={t.ctaTitleLine1}
            titleLine2={t.ctaTitleLine2}
            text={t.ctaText}
            className="mt-16"
          >
            <Link href={bookPath(lang)} className="btn btn-outline-gold relative">
              {t.cta} <ArrowRightIcon className="h-3 w-[18px]" />
            </Link>
          </CtaPanel>
        </main>
        <Footer lang={lang} dict={dict} />
      </div>
    </div>
  );
}
