import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Backdrop } from "@/components/Backdrop";
import { CourseSignup } from "@/components/CourseSignup";
import { EmptyNote } from "@/components/EmptyNote";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Reveal } from "@/components/motion/Reveal";
import { StarRule } from "@/components/StarRule";
import { ArrowRightIcon, CalendarIcon } from "@/components/ui/Icons";
import { getCourse } from "@/lib/api";
import { paragraphs, postDay } from "@/lib/blog";
import { dictionaryFor, getDictionary, type Dictionary, type Locale } from "@/lib/i18n";
import { bookPath, displayCase, hasLocale } from "@/lib/i18n/config";
import { instagramDmUrl, site } from "@/lib/site";
import { localized, type CoursePhoto } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/[lang]/course">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = dictionaryFor(lang).course;
  return { title: t.metaTitle, description: t.metaDescription };
}

type Copy = { lang: Locale; t: Dictionary["course"] };

const tile =
  "relative overflow-hidden rounded-[14px] border border-cream/16 bg-[linear-gradient(160deg,#24131b_0%,#150e11_55%,#0e0b0c_100%)] sm:aspect-auto";
/** the large photo: the full width on phones, the left half (two rows tall) from tablets up */
const lead = "col-span-6 aspect-[4/3] sm:row-span-2";

/**
 * Where each photo sits, by how many there are (one to four). Phones: the
 * first photo large and the rest in one row under it. Wider screens: four
 * columns and two rows, the first photo filling the left half.
 */
const layouts: Record<number, string[]> = {
  1: [`${lead} sm:col-span-4`],
  2: [`${lead} sm:col-span-2`, "col-span-6 aspect-[16/9] sm:col-span-2 sm:row-span-2"],
  3: [`${lead} sm:col-span-2`, "col-span-3 aspect-[4/3] sm:col-span-2", "col-span-3 aspect-[4/3] sm:col-span-2"],
  4: [
    `${lead} sm:col-span-2`,
    "col-span-2 aspect-square sm:col-span-2",
    "col-span-2 aspect-square sm:col-span-1",
    "col-span-2 aspect-square sm:col-span-1",
  ],
};

/** The course's photos as one block; the frames crop them to fit. */
function Photos({ photos, t }: { photos: CoursePhoto[]; t: Dictionary["course"] }) {
  const shown = photos.slice(0, 4);
  const layout = layouts[shown.length];
  if (!layout) return null;

  return (
    <Reveal
      as="section"
      aria-label={t.photosAria}
      className="mt-10 grid grid-cols-6 gap-2.5 sm:mt-12 sm:auto-rows-[clamp(150px,19.6vw,250px)] sm:grid-cols-4 sm:gap-4"
    >
      {shown.map((photo, i) => (
        <div
          key={photo.id}
          role="img"
          aria-label={t.photoAria.replace("{number}", String(i + 1))}
          className={`${tile} ${layout[i]}`}
        >
          {/* Already sized and compressed by the backend. Even the smallest
              frame is wider than the small copy of an upright photo on a
              sharp screen, so every frame gets the photo itself. */}
          <Image
            src={photo.full}
            alt=""
            fill
            unoptimized
            preload={i === 0}
            className="object-cover"
            draggable={false}
          />
        </div>
      ))}
    </Reveal>
  );
}

/** The opening: eyebrow, the title, an optional line under it, and the gold star. */
function Intro({ lang, t, title, children }: Copy & { title: string; children?: ReactNode }) {
  return (
    <section className="pt-10 sm:pt-16 lg:pl-5">
      <p className="caps eyebrow enter">{displayCase(t.eyebrow, lang)}</p>
      {/* an admin's title can be long: a little smaller than the other pages', and balanced */}
      <h1 className="display enter enter-1 mt-[22px] max-w-[940px] text-balance break-words text-[length:calc(clamp(34px,9.4vw,40px)*var(--display-scale))] leading-[1.06] tracking-[0.5px] text-cream sm:text-[length:calc(clamp(40px,4.8vw,62px)*var(--display-scale))]">
        {displayCase(title, lang)}
      </h1>
      {children}
      <StarRule className="enter enter-3 -ml-1.5 mt-6" star="h-[30px] w-[30px]" />
    </section>
  );
}

/** The course, read from the backend when the page is requested. */
async function CourseContent({ lang, t }: Copy) {
  const course = await getCourse();

  if (!course) {
    return (
      <>
        <Intro lang={lang} t={t} title={t.metaTitle} />
        <EmptyNote lang={lang} title={t.emptyTitle} text={t.emptyText} className="mt-12">
          <Link href={bookPath(lang)} className="btn btn-outline-gold mt-2">
            {t.emptyCta} <ArrowRightIcon className="h-3 w-[18px]" />
          </Link>
        </EmptyNote>
      </>
    );
  }

  const title = localized(course.title, lang);

  return (
    <>
      <Intro lang={lang} t={t} title={title}>
        <p className="caps enter enter-2 mt-5 flex items-center gap-2.5 text-[12px] leading-[22px] tracking-[2.4px] text-muted sm:text-[14px] sm:tracking-[3.2px]">
          <CalendarIcon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.6} />
          <span>
            {displayCase(t.published, lang)}:{" "}
            <time dateTime={course.createdAt} className="text-cream">
              {displayCase(postDay(course.createdAt, lang), lang)}
            </time>
          </span>
        </p>
      </Intro>

      <Photos photos={course.photos} t={t} />

      {/* The text in a column of reading width. Wide screens put its label in
          the margin beside it, with a button down to the sign-up panel. */}
      <Reveal className="grid grid-cols-[minmax(0,1fr)] gap-x-14 gap-y-6 pt-10 sm:pt-14 lg:grid-cols-[260px_minmax(0,720px)] lg:pl-5">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 lg:flex-col lg:items-start lg:justify-start lg:pt-1.5">
          <h2 className="caps label-caps text-gold">{displayCase(t.about, lang)}</h2>
          <a href="#signup" className="btn btn-outline-gold btn-sm">
            {t.signup.titleLine1} {t.signup.titleLine2}
            <ArrowRightIcon className="h-3 w-[18px] rotate-90" />
          </a>
        </div>

        <article className="min-w-0 max-w-[720px]">
          {paragraphs(localized(course.body, lang)).map((paragraph, i) => (
            <p
              key={i}
              className={`whitespace-pre-line break-words text-[17px] font-light leading-7 text-body sm:text-[18px] sm:leading-[30px] ${
                i > 0 ? "mt-[22px]" : ""
              }`}
            >
              {paragraph}
            </p>
          ))}
        </article>
      </Reveal>

      <Reveal className="mt-14 sm:mt-[72px]">
        <CourseSignup
          lang={lang}
          course={title}
          instagramUrl={instagramDmUrl(site.instagram[0].handle)}
          t={t.signup}
        />
      </Reveal>
    </>
  );
}

/** Shown while the course loads: the title's lines, the photos' block and a few lines of text. */
function CourseSkeleton() {
  return (
    <div aria-hidden className="animate-pulse pt-10 sm:pt-16 lg:pl-5">
      <div className="h-4 w-36 rounded bg-cream/[0.07]" />
      <div className="mt-[22px] h-12 w-[min(560px,90%)] rounded bg-cream/[0.07]" />
      <div className="mt-5 h-5 w-64 rounded bg-cream/[0.05]" />
      <div className="mt-16 aspect-[4/3] rounded-[14px] border border-cream/10 bg-surface sm:aspect-[11/5] lg:-ml-5" />
      <div className="mt-14 h-4 w-40 rounded bg-cream/[0.07]" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="mt-4 h-5 max-w-[720px] rounded bg-cream/[0.05]" />
      ))}
    </div>
  );
}

export default async function CoursePage() {
  const { lang, dict } = await getDictionary();
  const t = dict.course;

  return (
    <div className="page-ground relative isolate min-h-dvh overflow-hidden">
      <Backdrop scope="course" />
      <div className="container-x">
        <Header lang={lang} nav={dict.nav} common={dict.common} switcherLabel={dict.langSwitcher.aria} />
        <main>
          <Suspense fallback={<CourseSkeleton />}>
            <CourseContent lang={lang} t={t} />
          </Suspense>
        </main>
        <Footer lang={lang} dict={dict} />
      </div>
    </div>
  );
}
