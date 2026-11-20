"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { displayCase, localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import type { Photo } from "@/lib/types";
import { EmptyNote } from "./EmptyNote";
import { FilterChip } from "./FilterChip";
import { PhotoFrame } from "./PhotoFrame";
import { ArrowRightIcon, ImageIcon } from "./ui/Icons";

/** One article as the list shows it; the page puts every text in its own language first. */
export type BlogCard = {
  slug: string;
  title: string;
  /** null only if the article's topic was deleted */
  topic: { id: string; name: string } | null;
  /** the opening of the text: a short one for a card, a longer one for the large article */
  excerpt: string;
  lead: string;
  /** when it was added, to the minute, as text */
  date: string;
  /** "4 min read" */
  readTime: string;
  image: Photo;
};

type Props = {
  lang: Locale;
  t: Dictionary["blog"];
  /** newest first */
  posts: BlogCard[];
  /** the topics that have articles, in the order the admin panel lists them */
  topics: { id: string; name: string }[];
};

/**
 * The blog page's articles: one row of topic filters, the newest article shown
 * large (only while every topic is showing), a count, and the grid of the rest.
 * A picked topic shows all of its articles in the grid.
 */
export function BlogPosts({ lang, t, posts, topics }: Props) {
  const [topic, setTopic] = useState("all");

  if (posts.length === 0) {
    return <EmptyNote lang={lang} title={t.emptyTitle} text={t.emptyText} className="mt-[52px]" />;
  }

  const matching = posts.filter((post) => topic === "all" || post.topic?.id === topic);
  const latest = topic === "all" ? posts[0] : null;
  const inGrid = latest ? matching.slice(1) : matching;
  const countLabel =
    matching.length === 1 ? t.countOne : t.countMany.replace("{count}", String(matching.length));
  const address = (slug: string) => localePath(lang, `/blog/${slug}`);
  // the lighter Georgian cut matches Italiana's strokes
  const weight = lang === "ka" ? "font-light" : "font-normal";

  return (
    <>
      {topics.length > 1 && (
        <div
          role="group"
          aria-label={t.filterAria}
          className="mt-[52px] flex flex-wrap gap-2.5 border-y border-cream/18 py-[22px]"
        >
          <FilterChip on={topic === "all"} onPick={() => setTopic("all")}>
            {t.all}
          </FilterChip>
          {topics.map(({ id, name }) => (
            <FilterChip key={id} on={topic === id} onPick={() => setTopic(id)}>
              {name}
            </FilterChip>
          ))}
        </div>
      )}

      {latest && (
        <article
          className={`flex flex-wrap items-stretch overflow-hidden rounded-[18px] border border-cream/16 bg-surface ${
            topics.length > 1 ? "mt-9" : "mt-[52px]"
          }`}
        >
          <Link
            href={address(latest.slug)}
            aria-label={`${t.openArticle}: ${latest.title}`}
            className="relative block min-h-[240px] min-w-0 flex-[1.2_1_380px] bg-[linear-gradient(160deg,#24131b_0%,#150e11_55%,#0e0b0c_100%)] sm:min-h-[340px]"
          >
            <Image src={latest.image.full} alt="" fill unoptimized className="object-cover" draggable={false} />
          </Link>

          <div className="flex min-w-0 flex-[1_1_360px] flex-col px-6 pb-[34px] pt-8 sm:px-10 sm:pt-10">
            <p className="caps label-caps text-gold">
              {displayCase(t.latest, lang)}
              {latest.topic && (
                <>
                  {" "}
                  &nbsp;/&nbsp; {displayCase(latest.topic.name, lang)}
                </>
              )}
            </p>
            <h2 className="display mt-[18px] break-words text-[length:calc(clamp(32px,3.4vw,44px)*var(--display-scale))] leading-[1.06] tracking-[0.5px] text-cream">
              {displayCase(latest.title, lang)}
            </h2>
            <p className="mt-[18px] text-[17px] font-light leading-[26px] text-body">{latest.lead}</p>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-x-5 gap-y-2 pt-[26px]">
              <span className="text-[14px] leading-5 text-muted">
                {latest.date} &nbsp;·&nbsp; {latest.readTime}
              </span>
              <Link href={address(latest.slug)} className="link-arrow min-h-11 gap-3 text-[16px]">
                {t.readArticle} <ArrowRightIcon className="h-3 w-[18px]" />
              </Link>
            </div>
          </div>
        </article>
      )}

      <p aria-live="polite" className="ml-1 mt-[30px] text-[14px] leading-5 text-muted">
        {countLabel}
      </p>

      {inGrid.length > 0 && (
        <section
          aria-label={t.articlesAria}
          className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-x-6 gap-y-10"
        >
          {inGrid.map((post) => (
            <article key={post.slug} className="flex flex-col">
              <PhotoFrame
                ratio="4 / 3"
                aria={`${t.openArticle}: ${post.title}`}
                photo={post.image}
                size="full"
                label=""
                icon={<ImageIcon className="h-10 w-10 text-rose" />}
                href={address(post.slug)}
              />
              {post.topic && (
                <p className="caps label-caps mx-1 mt-[18px]">{displayCase(post.topic.name, lang)}</p>
              )}
              <h2
                className={`mx-1 mt-2.5 break-words font-display text-[length:calc(28px*var(--display-scale))] leading-8 tracking-[0.3px] text-cream ${weight}`}
              >
                {post.title}
              </h2>
              <p className="mx-1 mt-2.5 text-[15.5px] font-light leading-6 text-body">{post.excerpt}</p>
              {/* pinned to the bottom so the dates line up across a row of cards */}
              <div className="mx-1 mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-1.5">
                <span className="text-[14px] leading-5 text-muted">{post.date}</span>
                <Link href={address(post.slug)} className="link-arrow min-h-11 gap-2.5 text-[15px]">
                  {t.read} <ArrowRightIcon className="h-3 w-[18px]" />
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
