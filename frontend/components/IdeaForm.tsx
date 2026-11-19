"use client";

import { useId, useState, type FormEvent } from "react";
import type { DayOption } from "@/lib/dates";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { buildWhatsAppMessage, whatsappUrl } from "@/lib/whatsapp";
import { ListSelect } from "./ListSelect";
import { WhatsAppIcon } from "./ui/Icons";

type Props = { days: DayOption[]; t: Dictionary["form"] };

const formShell =
  "flex min-w-0 flex-col gap-2 rounded-[18px] border border-cream/16 bg-surface px-5 pb-[30px] pt-[26px] sm:px-7";

export function IdeaForm({ days, t }: Props) {
  // unique per instance: a hidden copy of the page can share the document
  const id = useId();
  const [name, setName] = useState("");
  const [service, setService] = useState<string>(t.services[0]);
  const [idea, setIdea] = useState("");
  const [dayIso, setDayIso] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const day = days.find((d) => d.iso === dayIso) ?? null;
    const message = buildWhatsAppMessage({ name, service, idea, day, time }, t.message);
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className={formShell} aria-label={t.aria}>
      <label htmlFor={`${id}-name`} className="field-label">
        {t.name}
      </label>
      <input
        id={`${id}-name`}
        name="name"
        type="text"
        autoComplete="name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="field h-[46px] px-3.5"
      />

      <label id={`${id}-service-label`} htmlFor={`${id}-service`} className="field-label mt-3">
        {t.service}
      </label>
      <ListSelect
        id={`${id}-service`}
        labelId={`${id}-service-label`}
        name="service"
        value={service}
        options={t.services}
        onChange={setService}
      />

      <label htmlFor={`${id}-idea`} className="field-label mt-3">
        {t.idea} <span className="text-[12px] font-light text-muted">{t.optional}</span>
      </label>
      <textarea
        id={`${id}-idea`}
        name="idea"
        rows={3}
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder={t.ideaPlaceholder}
        className="field h-[76px] min-h-[76px] resize-y px-3.5 py-3 font-light leading-[21px]"
      />

      <div id={`${id}-day-label`} className="field-label mt-3">
        {t.day}
      </div>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-day-label`}
        className="days-scroll flex gap-[9px] overflow-x-auto pb-2"
      >
        {days.map((d) => {
          const active = d.iso === dayIso;
          return (
            <button
              key={d.iso}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${d.label}, ${d.day} ${d.month}`}
              onClick={() => setDayIso(active ? null : d.iso)}
              className="choice flex h-[62px] w-14 shrink-0 flex-col items-center justify-center"
            >
              <span className="text-[10.5px] leading-[13px] text-muted">{d.label}</span>
              <span className="text-[17px] font-medium leading-[21px]">{d.day}</span>
              <span className="text-[10.5px] leading-[13px] text-muted">{d.month}</span>
            </button>
          );
        })}
      </div>

      <div id={`${id}-time-label`} className="field-label mt-2.5">
        {t.time}
      </div>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-time-label`}
        className="grid grid-cols-3 gap-[9px]"
      >
        {t.times.map((slot) => {
          const active = slot === time;
          return (
            <button
              key={slot}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTime(active ? null : slot)}
              className="choice h-[46px] min-w-0 px-1.5 text-[15px]"
            >
              {slot}
            </button>
          );
        })}
      </div>

      <button type="submit" className="btn btn-gold mt-6 h-12 w-full">
        <WhatsAppIcon className="h-5 w-5" />
        {t.submit}
      </button>
    </form>
  );
}

/** Static shell shown while the day list streams in; mirrors the form's heights. */
export function IdeaFormSkeleton() {
  const label = "h-5 w-24 rounded bg-cream/[0.07]";
  const well = "rounded-[10px] border border-cream/10 bg-ink";
  return (
    <div className={`${formShell} animate-pulse`} aria-hidden>
      <div className={label} />
      <div className={`${well} h-[46px]`} />
      <div className={`${label} mt-3 w-16`} />
      <div className={`${well} h-[46px]`} />
      <div className={`${label} mt-3 w-28`} />
      <div className={`${well} h-[76px]`} />
      <div className={`${label} mt-3`} />
      <div className="flex gap-[9px] overflow-hidden pb-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`${well} h-[62px] w-14 shrink-0`} />
        ))}
      </div>
      <div className={`${label} mt-2.5`} />
      <div className="grid grid-cols-3 gap-[9px]">
        <div className={`${well} h-[46px]`} />
        <div className={`${well} h-[46px]`} />
        <div className={`${well} h-[46px]`} />
      </div>
      <div className="mt-6 h-12 rounded-full bg-gold/25" />
    </div>
  );
}
