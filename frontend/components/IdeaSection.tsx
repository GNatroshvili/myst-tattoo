import { Suspense } from "react";
import { connection } from "next/server";
import { getUpcomingDays } from "@/lib/dates";
import { instagramDmUrl, site } from "@/lib/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { IdeaForm, IdeaFormSkeleton } from "./IdeaForm";
import { SectionDivider } from "./SectionDivider";

const steps = [
  { title: "Send your idea", text: "A few words is enough: design, placement, size." },
  { title: "Talk it through", text: "The artist replies to go over the details and the price." },
  { title: "Meet at the studio", text: "We agree on a day and time." },
];

/** Day pills depend on "today", so this part renders at request time. */
async function IdeaFormWithDays() {
  await connection();
  const days = getUpcomingDays(14, site.timeZone);
  return <IdeaForm days={days} />;
}

export function IdeaSection() {
  return (
    <section id="idea" aria-labelledby="idea-title" className="scroll-mt-4 pt-12 lg:pt-[30px]">
      <SectionDivider />

      <h2
        id="idea-title"
        className="display mt-5 text-balance text-center text-[clamp(34px,3.75vw,48px)] leading-[1.1] tracking-[0.5px] text-mist-50"
      >
        Tell us your idea
      </h2>
      <p className="mx-auto mt-4 max-w-[470px] text-center text-[14.5px] leading-[23px] text-mist-300">
        Fill in the form and a ready-made WhatsApp message opens. We&apos;ll reply to agree the
        details.
      </p>

      {/* explicit minmax(0,…) tracks so the day picker scrolls instead of widening the form */}
      <div className="mx-auto mt-[26px] grid max-w-[926px] grid-cols-[minmax(0,1fr)] items-start gap-[26px] md:grid-cols-[minmax(0,49fr)_minmax(0,41fr)]">
        <Suspense fallback={<IdeaFormSkeleton />}>
          <IdeaFormWithDays />
        </Suspense>

        <div className="flex min-w-0 flex-col gap-[9px]">
          <ol className="flex flex-col gap-[9px]">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="flex min-h-[70px] items-center gap-4 rounded-[14px] bg-surface px-[18px] py-3"
              >
                <span
                  aria-hidden
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pit text-[13px] font-bold text-white"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[14px] font-bold leading-5 text-white">{step.title}</h3>
                  <p className="mt-[3px] text-[12px] leading-[18px] text-mist-600">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="rounded-[14px] bg-[linear-gradient(100deg,#24122a_0%,#2b1432_55%,#3f1a4c_100%)] px-6 pb-[22px] pt-5 sm:px-7">
            <h3 className="text-[14px] font-medium leading-5 text-white">
              Prefer to message us directly?
            </h3>
            <div className="mt-3.5 flex flex-wrap gap-x-3 gap-y-2.5">
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold btn-sm"
              >
                WhatsApp
              </a>
              <a
                href={instagramDmUrl(site.instagram[0].handle)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                Instagram DM
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
