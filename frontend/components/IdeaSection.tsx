import { Suspense, useId } from "react";
import { connection } from "next/server";
import { getCalendarNames, getUpcomingDays } from "@/lib/dates";
import { displayCase, localeTags, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { instagramDmUrl, site } from "@/lib/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { IdeaForm, IdeaFormSkeleton } from "./IdeaForm";
import { Reveal } from "./motion/Reveal";
import { SectionDivider } from "./SectionDivider";

type FormCopy = Dictionary["form"];

/** How many days the form offers in a row, starting with today; the calendar reaches further. */
const DAYS_AHEAD = 30;

/** Day pills depend on "today", so this part renders at request time. */
async function IdeaFormWithDays({ lang, t }: { lang: Locale; t: FormCopy }) {
  await connection();
  const intl = localeTags[lang].intl;
  const days = getUpcomingDays(DAYS_AHEAD, site.timeZone, {
    intl,
    today: t.today,
    tomorrow: t.tomorrow,
  });
  // month and weekday names come from the server: not every browser knows the Georgian ones
  return <IdeaForm days={days} names={getCalendarNames(intl)} t={t} />;
}

type Props = {
  lang: Locale;
  dict: Dictionary;
  /** on the booking page it is the whole page: its title is the page's, and it sits closer to the top */
  page?: boolean;
};

export function IdeaSection({ lang, dict, page = false }: Props) {
  const t = dict.idea;
  const titleId = useId();
  // the headings move one level up when the section's title is the page's
  const Title = page ? "h1" : "h2";
  const Sub = page ? "h2" : "h3";

  return (
    <section
      id="idea"
      aria-labelledby={titleId}
      className={page ? "pt-8 sm:pt-10" : "scroll-mt-4 pt-16 lg:pt-[76px]"}
    >
      <Reveal>
        <SectionDivider />

        <Title
          id={titleId}
          className="display mt-[22px] text-balance text-center text-[length:calc(clamp(36px,4vw,52px)*var(--display-scale))] leading-[1.04] tracking-[0.5px] text-cream"
        >
          {displayCase(t.title, lang)}
        </Title>
        <p className="mx-auto mt-4 max-w-[480px] text-center text-[17px] font-light leading-[25px] text-body">
          {t.lead}
        </p>
      </Reveal>

      {/* explicit minmax(0,…) tracks so the day picker scrolls instead of widening the form */}
      <div className="mx-auto mt-[34px] grid max-w-[960px] grid-cols-[minmax(0,1fr)] items-start gap-[26px] md:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]">
        <Reveal className="min-w-0">
          <Suspense fallback={<IdeaFormSkeleton />}>
            <IdeaFormWithDays lang={lang} t={dict.form} />
          </Suspense>
        </Reveal>

        <div className="flex min-w-0 flex-col gap-2.5">
          <ol className="flex flex-col gap-2.5">
            {t.steps.map((step, i) => (
              <Reveal
                as="li"
                key={step.title}
                delay={0.1 + i * 0.08}
                className="flex min-h-[76px] items-center gap-[18px] rounded-[14px] border border-cream/14 bg-surface px-5 py-3.5"
              >
                <span
                  aria-hidden
                  className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-cream/55 text-[14px] font-medium text-cream"
                >
                  {i + 1}
                </span>
                <div>
                  <Sub className="text-[16px] font-medium leading-[22px] text-cream">{step.title}</Sub>
                  <p className="mt-[3px] text-[14px] font-light leading-5 text-body">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal
            delay={0.34}
            className="rounded-[14px] border border-cream/16 bg-[radial-gradient(90%_160%_at_85%_80%,rgba(125,46,85,0.72),rgba(125,46,85,0)_72%),linear-gradient(90deg,#120c0e,#170d12)] px-6 pb-6 pt-[22px] sm:px-7"
          >
            <Sub className="text-[16px] leading-[22px] text-cream">{t.directTitle}</Sub>
            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2.5">
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold btn-sm"
              >
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
          </Reveal>
        </div>
      </div>
    </section>
  );
}
