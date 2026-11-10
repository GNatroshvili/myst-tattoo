"use client";

import { useState, type FormEvent } from "react";
import type { DayOption } from "@/lib/dates";
import { services, timesOfDay } from "@/lib/site";
import { buildWhatsAppMessage, whatsappUrl } from "@/lib/whatsapp";
import { ChevronDownIcon, WhatsAppIcon } from "./ui/Icons";

type Props = { days: DayOption[] };

export function IdeaForm({ days }: Props) {
  const [name, setName] = useState("");
  const [service, setService] = useState<string>(services[0]);
  const [idea, setIdea] = useState("");
  const [dayIso, setDayIso] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const day = days.find((d) => d.iso === dayIso) ?? null;
    const message = buildWhatsAppMessage({ name, service, idea, day, time });
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="panel p-5 sm:p-6" aria-labelledby="idea-form-title">
      <h3 id="idea-form-title" className="sr-only">
        Booking request form
      </h3>

      <div className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-semibold text-lilac-50">
            Your name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field"
          />
        </div>

        <div>
          <label htmlFor="service" className="mb-2 block text-sm font-semibold text-lilac-50">
            Service
          </label>
          <div className="relative">
            <select
              id="service"
              name="service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="field"
            >
              {services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-lilac-200" />
          </div>
        </div>

        <div>
          <label htmlFor="idea" className="mb-2 block text-sm font-semibold text-lilac-50">
            Idea <span className="text-xs font-normal text-lilac-300/80">(optional)</span>
          </label>
          <textarea
            id="idea"
            name="idea"
            rows={3}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g. moon and stars, fine line, wrist, ~5 cm"
            className="field resize-none"
          />
        </div>

        <fieldset className="min-w-0">
          <legend className="mb-2 block text-sm font-semibold text-lilac-50">Preferred day</legend>
          <div
            role="radiogroup"
            aria-label="Preferred day"
            className="scroll-thin -mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-3"
          >
            {days.map((d, i) => {
              const active = d.iso === dayIso;
              return (
                <button
                  key={d.iso}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={`${d.label}, ${d.day} ${d.month}`}
                  data-active={active}
                  onClick={() => setDayIso(active ? null : d.iso)}
                  className="pill flex w-[64px] shrink-0 snap-start flex-col items-center py-2.5"
                >
                  <span
                    className={`text-[10px] leading-none ${
                      i < 2 && !active ? "text-gold/90" : "opacity-80"
                    }`}
                  >
                    {d.label}
                  </span>
                  <span className="mt-1.5 text-lg font-semibold leading-none">{d.day}</span>
                  <span className="mt-1 text-[10px] leading-none opacity-80">{d.month}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="mb-2 block text-sm font-semibold text-lilac-50">Time of day</legend>
          <div role="radiogroup" aria-label="Time of day" className="grid grid-cols-3 gap-2">
            {timesOfDay.map((t) => {
              const active = t === time;
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-active={active}
                  onClick={() => setTime(active ? null : t)}
                  className="pill py-3 text-sm font-medium"
                >
                  {t}
                </button>
              );
            })}
          </div>
        </fieldset>

        <button type="submit" className="btn btn-primary w-full py-4 text-[15px]">
          <WhatsAppIcon className="h-5 w-5" />
          Send on WhatsApp
        </button>
      </div>
    </form>
  );
}

/** Static shell shown while the day list streams in. */
export function IdeaFormSkeleton() {
  return (
    <div className="panel animate-pulse p-5 sm:p-6" aria-hidden>
      <div className="space-y-5">
        <div>
          <div className="mb-2 h-4 w-24 rounded bg-white/10" />
          <div className="h-11 rounded-xl bg-white/5" />
        </div>
        <div>
          <div className="mb-2 h-4 w-16 rounded bg-white/10" />
          <div className="h-11 rounded-xl bg-white/5" />
        </div>
        <div>
          <div className="mb-2 h-4 w-12 rounded bg-white/10" />
          <div className="h-24 rounded-xl bg-white/5" />
        </div>
        <div>
          <div className="mb-2 h-4 w-28 rounded bg-white/10" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 w-16 shrink-0 rounded-xl bg-white/5" />
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 h-4 w-24 rounded bg-white/10" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-11 rounded-xl bg-white/5" />
            <div className="h-11 rounded-xl bg-white/5" />
            <div className="h-11 rounded-xl bg-white/5" />
          </div>
        </div>
        <div className="h-14 rounded-full bg-gold/30" />
      </div>
    </div>
  );
}
