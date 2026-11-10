import { Suspense } from "react";
import { connection } from "next/server";
import { getUpcomingDays } from "@/lib/dates";
import { instagramDmUrl, site } from "@/lib/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { IdeaForm, IdeaFormSkeleton } from "./IdeaForm";
import { SectionDivider } from "./SectionDivider";
import { InstagramIcon, WhatsAppIcon } from "./ui/Icons";

const steps = [
  { title: "Send your idea", text: "A few words is enough: design, placement, size." },
  { title: "Talk it through", text: "The artist replies to go over the details and the price." },
  { title: "Meet at the studio", text: "We agree on a day and time." },
];

/** Day pills depend on "today", so this part renders at request time. */
async function IdeaFormWithDays() {
  await connection();
  const days = getUpcomingDays(10, site.timeZone);
  return <IdeaForm days={days} />;
}

export function IdeaSection() {
  return (
    <section id="idea" className="container-x scroll-mt-20 py-12">
      <SectionDivider />

      <h2 className="display text-gradient-lilac mt-6 text-center text-[clamp(2.5rem,5.4vw,3.75rem)] leading-none">
        Tell us your idea
      </h2>
      <p className="mx-auto mt-5 max-w-md text-center text-sm leading-relaxed text-lilac-200/90">
        Fill in the form and a ready-made WhatsApp message opens.
        <br className="hidden sm:block" /> We&apos;ll reply to agree the details.
      </p>

      <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)] lg:gap-8">
        <Suspense fallback={<IdeaFormSkeleton />}>
          <IdeaFormWithDays />
        </Suspense>

        <aside className="space-y-3 lg:pt-1">
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={step.title} className="panel flex items-start gap-4 px-5 py-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-lilac-400/30 bg-plum-700/70 text-xs font-semibold text-lilac-50">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-lilac-50">{step.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-lilac-300/90">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="panel px-5 py-5 sm:px-6">
            <p className="text-sm text-lilac-100">Prefer to message us directly?</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary px-5 py-3"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={instagramDmUrl(site.instagram[0].handle)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline px-5 py-3"
              >
                <InstagramIcon className="h-4 w-4" />
                Instagram DM
              </a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
