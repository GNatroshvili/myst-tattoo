"use client";

import { useId, useState, type FormEvent } from "react";
import { addDays, dayOption, type CalendarNames, type DayOption } from "@/lib/dates";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { buildWhatsAppMessage, whatsappUrl } from "@/lib/whatsapp";
import { DayCalendar } from "./DayCalendar";
import { ListSelect } from "./ListSelect";
import { WhatsAppIcon, XIcon } from "./ui/Icons";

type Props = {
  /** the days offered in a row, today first */
  days: DayOption[];
  /** month and weekday names in the page's language, for the calendar */
  names: CalendarNames;
  t: Dictionary["form"];
  /** the artist to book with, by name: set when the form was opened from their card or profile */
  artist?: string | null;
  /** the service the form opens on, one of `t.services`: set when it was opened for that service */
  service?: string;
};

/** how far ahead the calendar reaches, in days */
const CALENDAR_REACH = 365;
/** how many days a visitor may offer */
const MAX_DAYS = 3;

const formShell =
  "flex min-w-0 flex-col gap-2 rounded-[18px] border border-cream/16 bg-surface px-5 pb-[30px] pt-[26px] sm:px-7";

export function IdeaForm({ days, names, t, artist = null, service: opensOn = t.services[0] }: Props) {
  // unique per instance: a hidden copy of the page can share the document
  const id = useId();
  /** the visitor may drop the artist they came with, and book with whoever is free */
  const [withArtist, setWithArtist] = useState(true);
  const bookedArtist = withArtist ? artist : null;
  const [name, setName] = useState("");
  const [service, setService] = useState<string>(opensOn);
  const [idea, setIdea] = useState("");
  /** the picked days, earliest first: the row's own, or later ones picked in the calendar */
  const [picked, setPicked] = useState<DayOption[]>([]);
  const [time, setTime] = useState<string | null>(null);
  const today = days[0].iso;
  const full = picked.length >= MAX_DAYS;
  /** days picked in the calendar that the row does not have */
  const later = picked.filter((day) => !days.some((d) => d.iso === day.iso));

  /** Picks the day, or un-picks it if it was picked; with three picked already, a fourth is not taken. */
  function toggle(day: DayOption) {
    setPicked((list) => {
      if (list.some((d) => d.iso === day.iso)) return list.filter((d) => d.iso !== day.iso);
      if (list.length >= MAX_DAYS) return list;
      return [...list, day].sort((a, b) => (a.iso < b.iso ? -1 : 1));
    });
  }

  /** A date from the calendar: the row's own day if it has it (brought into view), otherwise a later one. */
  function pickDate(iso: string) {
    toggle(days.find((d) => d.iso === iso) ?? dayOption(iso, names, today, t));
    document.getElementById(`${id}-day-${iso}`)?.scrollIntoView({ block: "nearest", inline: "center" });
  }

  /** "12 Jan", with the year when it is not this one */
  const shortDate = (day: DayOption) =>
    `${day.day} ${day.month}${day.iso.slice(0, 4) === today.slice(0, 4) ? "" : ` ${day.iso.slice(0, 4)}`}`;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const message = buildWhatsAppMessage(
      { name, service, idea, days: picked, time, artist: bookedArtist },
      t.message,
    );
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className={formShell} aria-label={t.aria}>
      {/* Who the booking is with, when the form was opened from an artist: it goes
          into the message. Pressing the chip drops the artist, as with a picked day. */}
      {bookedArtist && (
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="field-label">{t.artist}</span>
          <button
            type="button"
            aria-label={t.removeArtist.replace("{artist}", bookedArtist)}
            onClick={() => setWithArtist(false)}
            className="flex h-9 items-center gap-2 rounded-full border border-gold/55 bg-raised pl-3.5 pr-2.5 text-[13.5px] leading-none text-cream transition-colors hover:border-gold"
          >
            {bookedArtist}
            <XIcon className="h-3 w-3 text-gold" />
          </button>
        </div>
      )}

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

      {/* The calendar's panel opens against this row, across the form on phones. */}
      <div className="relative mt-3 flex items-center justify-between gap-3">
        <div id={`${id}-day-label`} className="field-label">
          {t.day} <span className="text-[12px] font-light text-muted">{t.dayLimit}</span>
        </div>
        <DayCalendar
          id={`${id}-calendar`}
          today={today}
          max={addDays(today, CALENDAR_REACH)}
          values={picked.map((day) => day.iso)}
          full={full}
          // the button names the later dates picked: the first, and how many more
          label={
            later.length === 0
              ? t.otherDate
              : `${shortDate(later[0])}${later.length > 1 ? ` +${later.length - 1}` : ""}`
          }
          active={later.length > 0}
          names={names}
          copy={t.calendar}
          onPick={pickDate}
        />
      </div>
      <div
        role="group"
        aria-labelledby={`${id}-day-label`}
        className="days-scroll flex gap-[9px] overflow-x-auto pb-2"
      >
        {days.map((d) => {
          const active = picked.some((day) => day.iso === d.iso);
          // with three picked, the rest are dimmed: one has to be given up first
          const closed = full && !active;
          return (
            <button
              key={d.iso}
              id={`${id}-day-${d.iso}`}
              type="button"
              role="checkbox"
              aria-checked={active}
              aria-disabled={closed}
              aria-label={`${d.label}, ${d.day} ${d.month}`}
              onClick={() => toggle(d)}
              className={`choice flex h-[62px] w-14 shrink-0 flex-col items-center justify-center ${
                closed ? "cursor-default opacity-40 hover:border-cream/22" : ""
              }`}
            >
              <span className="text-[10.5px] leading-[13px] text-muted">{d.label}</span>
              <span className="text-[17px] font-medium leading-[21px]">{d.day}</span>
              <span className="text-[10.5px] leading-[13px] text-muted">{d.month}</span>
            </button>
          );
        })}
      </div>

      {/* What is picked, in one place (the row scrolls, and later dates are not in it).
          Pressing a day here un-picks it. */}
      {picked.length > 0 && (
        <ul className="flex flex-wrap gap-2 pt-1">
          {picked.map((day) => (
            <li key={day.iso}>
              <button
                type="button"
                aria-label={t.removeDay.replace("{day}", day.long)}
                onClick={() => toggle(day)}
                className="flex h-9 items-center gap-2 rounded-full border border-gold/55 bg-raised pl-3.5 pr-2.5 text-[13.5px] leading-none text-cream transition-colors hover:border-gold"
              >
                {day.label}, {shortDate(day)}
                <XIcon className="h-3 w-3 text-gold" />
              </button>
            </li>
          ))}
        </ul>
      )}

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
