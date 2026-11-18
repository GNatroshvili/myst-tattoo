"use client";

import { useState } from "react";
import Link from "next/link";
import { blogTopics, featuredPost, posts, type BlogTopic } from "@/lib/blog";
import { displayCase, localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { FilterChip } from "./FilterChip";
import { PhotoFrame } from "./PhotoFrame";
import { ArrowRightIcon, ImageIcon } from "./ui/Icons";

/**
 * The blog page's articles: one row of topic filters, the featured article
 * (only while every topic is showing), a count, and the grid of the rest.
 */
export function BlogPosts({ lang, t }: { lang: Locale; t: Dictionary["blog"] }) {
  const [topic, setTopic] = useState<BlogTopic | "all">("all");

  const shown = posts.filter((post) => topic === "all" || post.topic === topic);
  const countLabel =
    shown.length === 1 ? t.countOne : t.countMany.replace("{count}", String(shown.length));
  const address = (id: string) => localePath(lang, `/blog/${id}`);
  // the lighter Georgian cut matches Italiana's strokes
  const weight = lang === "ka" ? "font-light" : "font-normal";

  return (
    <>
      <div
        role="group"
        aria-label={t.filterAria}
        className="mt-[52px] flex flex-wrap gap-2.5 border-y border-cream/18 py-[22px]"
      >
        <FilterChip on={topic === "all"} onPick={() => setTopic("all")}>
          {t.all}
        </FilterChip>
        {blogTopics.map((key) => (
          <FilterChip key={key} on={topic === key} onPick={() => setTopic(key)}>
            {t.topics[key]}
          </FilterChip>
        ))}
      </div>

      {topic === "all" && (
        <article className="mt-9 flex flex-wrap items-stretch overflow-hidden rounded-[18px] border border-cream/16 bg-surface">
          <div
            role="img"
            aria-label={t.imageAria}
            className="flex min-h-[240px] min-w-0 flex-[1.2_1_380px] flex-col items-center justify-center gap-3 bg-[linear-gradient(160deg,#24131b_0%,#150e11_55%,#0e0b0c_100%)] sm:min-h-[340px]"
          >
            <ImageIcon strokeWidth={1.2} className="h-12 w-12 text-rose" />
            <span className="caps text-[10px] leading-[14px] tracking-[3.2px] text-muted">
              {displayCase(t.imageLabel, lang)}
            </span>
          </div>

          <div className="flex min-w-0 flex-[1_1_360px] flex-col px-6 pb-[34px] pt-8 sm:px-10 sm:pt-10">
            <p className="caps label-caps text-gold">
              {displayCase(t.featured, lang)} &nbsp;/&nbsp; {displayCase(t.placeholder.topic, lang)}
            </p>
            <h2 className="display mt-[18px] text-[length:calc(clamp(32px,3.4vw,44px)*var(--display-scale))] leading-[1.06] tracking-[0.5px] text-cream">
              {displayCase(t.placeholder.featuredTitle, lang)}
            </h2>
            <p className="mt-[18px] text-[17px] font-light leading-[26px] text-body">
              {t.placeholder.featuredExcerpt}
            </p>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-x-5 gap-y-2 pt-[26px]">
              <span className="text-[14px] leading-5 text-muted">
                {t.placeholder.date} &nbsp;·&nbsp; {t.placeholder.readTime}
              </span>
              <Link href={address(featuredPost.id)} className="link-arrow min-h-11 gap-3 text-[16px]">
                {t.readArticle} <ArrowRightIcon className="h-3 w-[18px]" />
              </Link>
            </div>
          </div>
        </article>
      )}

      <p aria-live="polite" className="ml-1 mt-[30px] text-[14px] leading-5 text-muted">
        {countLabel}
      </p>

      <section
        aria-label={t.articlesAria}
        className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-x-6 gap-y-10"
      >
        {shown.map((post) => (
          <article key={post.id} className="flex flex-col">
            <PhotoFrame
              ratio="4 / 3"
              aria={t.openArticle}
              label={displayCase(t.imageLabel, lang)}
              icon={<ImageIcon className="h-10 w-10 text-rose" />}
              href={address(post.id)}
            />
            <p className="caps label-caps mx-1 mt-[18px]">{displayCase(t.topics[post.topic], lang)}</p>
            <h2
              className={`mx-1 mt-2.5 font-display text-[length:calc(28px*var(--display-scale))] leading-8 tracking-[0.3px] text-cream ${weight}`}
            >
              {t.placeholder.title}
            </h2>
            <p className="mx-1 mt-2.5 text-[15.5px] font-light leading-6 text-body">
              {t.placeholder.excerpt}
            </p>
            <div className="mx-1 mt-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <span className="text-[14px] leading-5 text-muted">{t.placeholder.date}</span>
              <Link href={address(post.id)} className="link-arrow min-h-11 gap-2.5 text-[15px]">
                {t.read} <ArrowRightIcon className="h-3 w-[18px]" />
              </Link>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
