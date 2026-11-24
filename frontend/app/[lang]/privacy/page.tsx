import { Suspense } from "react";
import type { Metadata } from "next";
import { Backdrop } from "@/components/Backdrop";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StarRule } from "@/components/StarRule";
import { CalendarIcon } from "@/components/ui/Icons";
import { getPrivacy } from "@/lib/api";
import { postDay } from "@/lib/blog";
import { dictionaryFor, getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { displayCase, hasLocale } from "@/lib/i18n/config";
import { policyBlocks, policyParts, standardPolicy } from "@/lib/privacy";
import { instagramDmUrl, site } from "@/lib/site";
import { localized } from "@/lib/types";
import { whatsappUrl } from "@/lib/whatsapp";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = dictionaryFor(lang).privacy;
  return { title: t.metaTitle, description: t.metaDescription };
}

type Copy = { lang: Locale; t: Dictionary["privacy"] };

/** A paragraph, with the web addresses in it as links. */
function Paragraph({ text, first }: { text: string; first: boolean }) {
  return (
    <p
      className={`whitespace-pre-line break-words text-[17px] font-light leading-7 text-body sm:text-[18px] sm:leading-[30px] ${
        first ? "" : "mt-[18px]"
      }`}
    >
      {policyParts(text).map((part, i) =>
        part.href ? (
          <a
            key={i}
            href={part.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cream underline decoration-cream/40 underline-offset-4 transition-colors hover:text-gold hover:decoration-gold"
          >
            {part.text}
          </a>
        ) : (
          part.text
        )
      )}
    </p>
  );
}

/**
 * The policy's text: the one saved in the admin panel, or the site's standard
 * one while there is none. Read from the backend when the page is requested.
 * Wide screens list the sections in the margin beside the text.
 */
async function Policy({ lang, t }: Copy) {
  const saved = await getPrivacy();
  const blocks = policyBlocks(saved ? localized(saved.body, lang) : standardPolicy[lang]);
  const sections = blocks.flatMap((block) => (block.kind === "heading" ? [block] : []));

  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)] gap-x-14 pt-10 sm:pt-14 lg:pl-5 ${
        sections.length > 0 ? "lg:grid-cols-[260px_minmax(0,720px)]" : ""
      }`}
    >
      {sections.length > 0 && (
        <nav aria-label={t.contents} className="hidden self-start lg:sticky lg:top-8 lg:block lg:pt-1.5">
          <h2 className="caps label-caps text-gold">{displayCase(t.contents, lang)}</h2>
          <ol className="mt-4 border-l border-cream/14">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="-ml-px block border-l border-transparent py-[7px] pl-4 text-[15px] font-light leading-[21px] text-body transition-colors hover:border-gold hover:text-gold"
                >
                  {section.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <article className="min-w-0 max-w-[720px]">
        {/* the standard text has no date of its own: it came with the site */}
        {saved && (
          <p className="caps mb-7 flex items-center gap-2.5 text-[12px] leading-[22px] tracking-[2.4px] text-muted sm:text-[14px] sm:tracking-[3.2px]">
            <CalendarIcon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.6} />
            <span>
              {displayCase(t.updated, lang)}:{" "}
              <time dateTime={saved.updatedAt} className="text-cream">
                {displayCase(postDay(saved.updatedAt, lang), lang)}
              </time>
            </span>
          </p>
        )}

        {blocks.map((block, i) =>
          block.kind === "heading" ? (
            <h2
              key={i}
              id={block.id}
              className={`display scroll-mt-8 text-balance break-words text-[length:calc(26px*var(--display-scale))] leading-[1.18] tracking-[0.5px] text-cream sm:text-[length:calc(30px*var(--display-scale))] ${
                i > 0 ? "mt-11 border-t border-cream/14 pt-9" : ""
              }`}
            >
              {displayCase(block.text, lang)}
            </h2>
          ) : (
            <Paragraph key={i} text={block.text} first={i === 0} />
          )
        )}

        {/* how to reach the studio, whatever the text says */}
        <div className="mt-12 rounded-[14px] border border-cream/16 bg-[radial-gradient(90%_160%_at_85%_80%,rgba(125,46,85,0.72),rgba(125,46,85,0)_72%),linear-gradient(90deg,#120c0e,#170d12)] px-6 pb-6 pt-[22px] sm:px-7">
          <h2 className="text-[16px] leading-[22px] text-cream">{t.contactTitle}</h2>
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2.5">
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-gold btn-sm">
              {t.whatsapp}
            </a>
            <a
              href={instagramDmUrl(site.instagram[0].handle)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              {t.instagramDm}
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}

/** Shown while the text loads: the margin's list and a few lines of text. */
function PolicySkeleton() {
  return (
    <div
      aria-hidden
      className="grid animate-pulse grid-cols-[minmax(0,1fr)] gap-x-14 pt-10 sm:pt-14 lg:grid-cols-[260px_minmax(0,720px)] lg:pl-5"
    >
      <div className="hidden lg:block">
        <div className="h-4 w-28 rounded bg-cream/[0.07]" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="mt-4 h-4 w-44 rounded bg-cream/[0.05]" />
        ))}
      </div>
      <div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`h-5 rounded bg-cream/[0.05] ${i > 0 ? "mt-4" : ""}`} />
        ))}
        <div className="mt-12 h-7 w-64 max-w-full rounded bg-cream/[0.07]" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="mt-4 h-5 rounded bg-cream/[0.05]" />
        ))}
      </div>
    </div>
  );
}

/**
 * The privacy policy: what the site does with a visitor's data, above all the
 * Google map and the Google reviews on the home page. Linked from the footer
 * of every page.
 */
export default async function PrivacyPage() {
  const { lang, dict } = await getDictionary();
  const t = dict.privacy;

  return (
    <div className="page-ground relative isolate min-h-dvh overflow-hidden">
      <Backdrop scope="privacy" />
      <div className="container-x">
        <Header lang={lang} nav={dict.nav} common={dict.common} switcherLabel={dict.langSwitcher.aria} />
        <main>
          <section className="pt-10 sm:pt-16 lg:pl-5">
            <p className="caps eyebrow">{displayCase(t.eyebrow, lang)}</p>
            {/* the Georgian title has a nineteen-letter word in it: sized so that word fits a phone's width */}
            <h1
              className={`display mt-[22px] max-w-[940px] text-balance leading-[1.06] tracking-[0.5px] text-cream sm:text-[length:calc(clamp(40px,4.8vw,62px)*var(--display-scale))] ${
                lang === "ka"
                  ? "text-[length:calc(clamp(20px,8.2vw_-_4px,40px)*var(--display-scale))]"
                  : "text-[length:calc(clamp(34px,9.4vw,40px)*var(--display-scale))]"
              }`}
            >
              {displayCase(t.title, lang)}
            </h1>
            <StarRule className="-ml-1.5 mt-6" star="h-[30px] w-[30px]" />
          </section>

          <Suspense fallback={<PolicySkeleton />}>
            <Policy lang={lang} t={t} />
          </Suspense>
        </main>
        <Footer lang={lang} dict={dict} />
      </div>
    </div>
  );
}
