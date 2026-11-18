import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Backdrop } from "@/components/Backdrop";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SectionDivider } from "@/components/SectionDivider";
import { ArrowLeftIcon, ImageIcon } from "@/components/ui/Icons";
import { articleIds } from "@/lib/blog";
import { dictionaryFor, getDictionary } from "@/lib/i18n";
import { displayCase, hasLocale, localePath } from "@/lib/i18n/config";

/**
 * One blog article: its date, title, photo and text, in a narrow centred
 * column. The articles are still placeholders, so every one of them reads the
 * same sample copy from the dictionary's `blog.article` section.
 */

/** A page for each article in lib/blog.ts; any other address is a 404. */
export function generateStaticParams() {
  return articleIds.map((id) => ({ id }));
}

/** Wait for the address to be checked rather than showing a shell first, so an unknown article gets a proper 404. */
export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/blog/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  if (!hasLocale(lang) || !articleIds.includes(id)) return {};
  const t = dictionaryFor(lang).blog;
  const { titleLine1, titleLine2 } = t.article.placeholder;
  return { title: `${titleLine1} ${titleLine2}`, description: t.metaDescription };
}

export default async function BlogArticlePage({ params }: PageProps<"/[lang]/blog/[id]">) {
  const { id } = await params;
  if (!articleIds.includes(id)) notFound();

  const { lang, dict } = await getDictionary();
  const t = dict.blog.article;
  const post = t.placeholder;

  return (
    <div className="page-ground relative isolate min-h-dvh overflow-hidden">
      <Backdrop scope="article" />
      <div className="container-x">
        <Header lang={lang} nav={dict.nav} common={dict.common} switcherLabel={dict.langSwitcher.aria} />
        <main>
          <Link
            href={localePath(lang, "/blog")}
            className="link-arrow link-back mt-7 h-11 gap-3 text-[15px] lg:ml-5"
          >
            <ArrowLeftIcon className="h-3 w-[18px]" />
            {t.back}
          </Link>

          <article className="mx-auto max-w-[860px] pt-[26px]">
            <header className="text-center">
              <p className="caps text-[15px] leading-[22px] tracking-[3.2px] text-muted">
                {displayCase(post.date, lang)}
              </p>
              {/* on phones the title is a little smaller and breaks where it fits;
                  from 640px it is set in the two lines drawn in the design */}
              <h1 className="display mt-5 text-balance text-[length:calc(clamp(32px,9.4vw,40px)*var(--display-scale))] leading-[1.06] tracking-[0.5px] text-cream sm:text-[length:calc(clamp(40px,4.8vw,62px)*var(--display-scale))]">
                {displayCase(post.titleLine1, lang)} <br className="hidden sm:block" />
                {displayCase(post.titleLine2, lang)}
              </h1>
              <SectionDivider className="mt-[26px]" />
            </header>

            {/* the article's photo; an icon and a caption hold its place for now */}
            <div
              role="img"
              aria-label={t.photoAria}
              className="mt-10 flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-[18px] border border-cream/16 bg-[linear-gradient(160deg,#24131b_0%,#150e11_55%,#0e0b0c_100%)]"
            >
              <ImageIcon strokeWidth={1.2} className="h-12 w-12 text-rose" />
              <span className="caps text-[10px] leading-[14px] tracking-[3.2px] text-muted">
                {displayCase(t.photoLabel, lang)}
              </span>
            </div>

            <div className="mx-auto max-w-[720px] pt-9">
              {post.paragraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className={`text-[18px] font-light leading-[30px] text-body ${i > 0 ? "mt-[22px]" : ""}`}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        </main>
        <Footer lang={lang} dict={dict} />
      </div>
    </div>
  );
}
