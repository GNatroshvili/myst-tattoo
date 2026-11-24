import { Suspense, useId, type ReactNode } from "react";
import { getFaqs } from "@/lib/api";
import { displayCase, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { localized } from "@/lib/types";
import { whatsappUrl } from "@/lib/whatsapp";
import { FaqList } from "./FaqList";
import { StarRule } from "./StarRule";
import { ArrowUpRightIcon } from "./ui/Icons";

type Props = { lang: Locale; dict: Dictionary };

/**
 * Frequently asked questions on the home page: every question added in the
 * admin panel, in the order it gives them, each opening its answer when
 * pressed. The section is left out entirely while there are no questions.
 */
async function Questions({ lang, dict }: Props) {
  const faqs = await getFaqs();
  if (faqs.length === 0) return null;

  return (
    <Section lang={lang} dict={dict}>
      <FaqList
        items={faqs.map((faq) => ({
          id: faq.id,
          question: localized(faq.question, lang),
          answer: localized(faq.answer, lang),
        }))}
      />
    </Section>
  );
}

/** The heading on the left (above, on narrower screens) and whatever fills the list beside it. */
function Section({ lang, dict, children }: Props & { children: ReactNode }) {
  const t = dict.faq;
  const titleId = useId();

  return (
    <section
      id="faq"
      aria-labelledby={titleId}
      className="grid scroll-mt-6 grid-cols-[minmax(0,1fr)] gap-y-9 pt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-16 lg:pl-5 lg:pt-[84px]"
    >
      <div>
        <p className="caps eyebrow">{displayCase(t.eyebrow, lang)}</p>
        <h2
          id={titleId}
          className="display mt-5 text-balance text-[length:calc(clamp(38px,4.2vw,54px)*var(--display-scale))] leading-[1.04] tracking-[0.5px] text-cream"
        >
          {displayCase(t.title, lang)}
        </h2>
        <StarRule className="-ml-[5px] mt-5" star="h-[26px] w-[26px]" />
        <p className="mt-6 max-w-[380px] text-[17px] font-light leading-[25px] text-body">{t.lead}</p>
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="link-arrow mt-3 min-h-11 gap-2.5 text-[17px]"
        >
          {t.ask} <ArrowUpRightIcon className="h-[13px] w-[13px]" />
        </a>
      </div>
      {children}
    </section>
  );
}

/** The questions are read from the backend when the page is requested. */
export function Faq(props: Props) {
  return (
    <Suspense
      fallback={
        <Section {...props}>
          <div aria-hidden className="animate-pulse border-t border-cream/18">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex h-[75px] items-center border-b border-cream/18 px-1">
                <div className="h-4 w-3/5 rounded-full bg-surface" />
              </div>
            ))}
          </div>
        </Section>
      }
    >
      <Questions {...props} />
    </Suspense>
  );
}
