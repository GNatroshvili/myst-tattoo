import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Backdrop } from "@/components/Backdrop";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SectionDivider } from "@/components/SectionDivider";
import { ArrowLeftIcon } from "@/components/ui/Icons";
import { getBlogPost } from "@/lib/api";
import { excerpt, paragraphs, postBody, postDate } from "@/lib/blog";
import { dictionaryFor, getDictionary } from "@/lib/i18n";
import { displayCase, hasLocale, localePath } from "@/lib/i18n/config";
import { localized } from "@/lib/types";

/**
 * One blog article: its topic, the date and time it was added, its title,
 * image and text, in a narrow centred column.
 *
 * The article is read from the backend on every request, and the page waits
 * for it rather than showing a placeholder first. An address with no article
 * behind it shows the "not found" page; once built, the response has already
 * begun by then, so it goes out as 200 marked "noindex" rather than as a 404.
 */
export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/blog/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  if (!hasLocale(lang)) return {};
  const t = dictionaryFor(lang).blog;
  const post = await getBlogPost(id);
  if (!post) return { title: t.metaTitle, description: t.metaDescription };
  return {
    title: localized(post.title, lang),
    description: excerpt(postBody(post, lang), 160) || t.metaDescription,
  };
}

export default async function BlogArticlePage({ params }: PageProps<"/[lang]/blog/[id]">) {
  const { id } = await params;
  const post = await getBlogPost(id);
  if (!post) notFound();

  const { lang, dict } = await getDictionary();
  const t = dict.blog.article;
  const title = localized(post.title, lang);
  const topic = post.topic ? localized(post.topic.name, lang) : "";

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
              {topic && <p className="caps label-caps text-gold">{displayCase(topic, lang)}</p>}
              <p className="caps mt-3 text-[15px] leading-[22px] tracking-[3.2px] text-muted">
                <time dateTime={post.createdAt}>{displayCase(postDate(post.createdAt, lang), lang)}</time>
              </p>
              {/* a little smaller on phones; the lines break where they balance best */}
              <h1 className="display mt-5 text-balance break-words text-[length:calc(clamp(32px,9.4vw,40px)*var(--display-scale))] leading-[1.06] tracking-[0.5px] text-cream sm:text-[length:calc(clamp(40px,4.8vw,62px)*var(--display-scale))]">
                {displayCase(title, lang)}
              </h1>
              <SectionDivider className="mt-[26px]" />
            </header>

            {/* The frame describes nothing by itself: the title above already
                says what the article is about. */}
            <div className="relative mt-10 aspect-video w-full overflow-hidden rounded-[18px] border border-cream/16 bg-[linear-gradient(160deg,#24131b_0%,#150e11_55%,#0e0b0c_100%)]">
              <Image
                src={post.image.full}
                alt=""
                fill
                unoptimized
                preload
                className="object-cover"
                draggable={false}
              />
            </div>

            <div className="mx-auto max-w-[720px] pt-9">
              {paragraphs(postBody(post, lang)).map((paragraph, i) => (
                <p
                  key={i}
                  className={`whitespace-pre-line break-words text-[18px] font-light leading-[30px] text-body ${
                    i > 0 ? "mt-[22px]" : ""
                  }`}
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
