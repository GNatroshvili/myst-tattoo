"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { addDays, isoToTime, timeToIso, weekdayIndex, type CalendarNames } from "@/lib/dates";
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon } from "./ui/Icons";

type Props = {
  id: string;
  /** today's date in the studio's time zone: nothing before it can be picked */
  today: string;
  /** the last date that can be picked */
  max: string;
  /** the picked date, when it was picked here; shown on the button in gold */
  value: string | null;
  /** what the button says when nothing is picked here */
  label: string;
  /** what the button says for the picked date, e.g. "12 Jan 2027" */
  valueLabel: string;
  names: CalendarNames;
  copy: { title: string; previousMonth: string; nextMonth: string };
  onPick: (iso: string) => void;
};

/** "2026-11" of a date */
const monthOf = (iso: string) => iso.slice(0, 7);
/** the first day of the month `months` away from the month of `iso` */
function shiftMonth(iso: string, months: number) {
  const date = new Date(isoToTime(iso));
  return timeToIso(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}
const clamp = (iso: string, min: string, max: string) => (iso < min ? min : iso > max ? max : iso);

const navButton =
  "flex h-10 w-10 items-center justify-center rounded-full border border-cream/22 text-cream transition-colors hover:border-gold hover:text-gold disabled:pointer-events-none disabled:opacity-30";

/**
 * A button that opens a month calendar, for a date further ahead than the row
 * of days beside it reaches. Drawn by the site, like the form's drop-down, so
 * it looks the same on every device: a dark panel, today ringed, the picked
 * day in gold, days that cannot be picked dimmed.
 *
 * The mouse or a tap picks a day and the arrows above change the month. On
 * the keyboard the arrow keys move by a day or a week, Page Up and Page Down
 * by a month, Home and End to the ends of the week, Enter picks and Escape
 * closes. Clicking elsewhere closes it too.
 */
export function DayCalendar({ id, today, max, value, label, valueLabel, names, copy, onPick }: Props) {
  const [open, setOpen] = useState(false);
  /** the day the keyboard is on; the month shown is its month */
  const [cursor, setCursor] = useState(today);
  /** set when the cursor moved by keyboard (or on opening), so the day takes the focus */
  const focusCursor = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = `${id}-panel`;

  // a press anywhere outside closes the calendar
  useEffect(() => {
    if (!open) return;
    const onPress = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPress);
    return () => document.removeEventListener("pointerdown", onPress);
  }, [open]);

  useEffect(() => {
    if (!open || !focusCursor.current) return;
    focusCursor.current = false;
    document.getElementById(`${id}-${cursor}`)?.focus();
  }, [open, cursor, id]);

  function show() {
    focusCursor.current = true;
    setCursor(clamp(value ?? today, today, max));
    setOpen(true);
  }

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  function move(to: string) {
    focusCursor.current = true;
    setCursor(clamp(to, today, max));
  }

  /** The arrows above the grid: another month, without taking the focus off the arrow. */
  function turn(months: number) {
    const first = shiftMonth(cursor, months);
    setCursor(clamp(first, today, max));
  }

  function onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowLeft":
        move(addDays(cursor, -1));
        break;
      case "ArrowRight":
        move(addDays(cursor, 1));
        break;
      case "ArrowUp":
        move(addDays(cursor, -7));
        break;
      case "ArrowDown":
        move(addDays(cursor, 7));
        break;
      case "Home":
        move(addDays(cursor, -weekdayIndex(cursor)));
        break;
      case "End":
        move(addDays(cursor, 6 - weekdayIndex(cursor)));
        break;
      case "PageUp":
        move(addDays(shiftMonth(cursor, -1), Number(cursor.slice(8)) - 1));
        break;
      case "PageDown":
        move(addDays(shiftMonth(cursor, 1), Number(cursor.slice(8)) - 1));
        break;
      case "Escape":
        close();
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  // the month on show: its days, after as many blanks as put the 1st under its weekday
  const first = `${monthOf(cursor)}-01`;
  const date = new Date(isoToTime(first));
  const length = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  const days = Array.from({ length }, (_, i) => addDays(first, i));
  const title = `${names.months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;

  return (
    <div ref={root}>
      <button
        ref={trigger}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        className={`flex h-10 items-center gap-2 rounded-full border px-3.5 text-[13.5px] leading-none transition-colors ${
          value
            ? "border-gold bg-raised text-gold"
            : open
              ? "border-cream/60 text-cream"
              : "border-cream/28 text-cream hover:border-cream/60"
        }`}
      >
        <CalendarIcon className="h-[18px] w-[18px]" strokeWidth={1.8} />
        {value ? valueLabel : label}
      </button>

      {open && (
        // the panel is placed against the row the button sits in (see IdeaForm)
        <div
          id={panelId}
          role="dialog"
          aria-label={copy.title}
          onKeyDown={onKeyDown}
          className="absolute right-0 top-[calc(100%+8px)] z-20 w-full rounded-[14px] border border-cream/22 bg-surface p-3 shadow-[0_18px_40px_rgba(0,0,0,0.6)] sm:w-[336px]"
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label={copy.previousMonth}
              disabled={monthOf(cursor) <= monthOf(today)}
              onClick={() => turn(-1)}
              className={navButton}
            >
              <ArrowLeftIcon className="h-3 w-[18px]" />
            </button>
            <p aria-live="polite" className="text-[16px] font-medium capitalize leading-6 text-cream">
              {title}
            </p>
            <button
              type="button"
              aria-label={copy.nextMonth}
              disabled={monthOf(cursor) >= monthOf(max)}
              onClick={() => turn(1)}
              className={navButton}
            >
              <ArrowRightIcon className="h-3 w-[18px]" />
            </button>
          </div>

          <div aria-hidden className="mt-3 grid grid-cols-7 gap-1 text-center text-[11.5px] leading-5 text-muted">
            {names.weekdaysShort.map((weekday) => (
              <span key={weekday} className="truncate">
                {weekday}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((iso, i) => {
              const picked = iso === value;
              const reachable = iso >= today && iso <= max;
              const dayOfMonth = Number(iso.slice(8));
              return (
                <button
                  key={iso}
                  id={`${id}-${iso}`}
                  type="button"
                  // the first day starts under its own weekday
                  style={i === 0 ? { gridColumnStart: weekdayIndex(iso) + 1 } : undefined}
                  disabled={!reachable}
                  tabIndex={iso === cursor ? 0 : -1}
                  aria-label={`${names.weekdays[weekdayIndex(iso)]}, ${dayOfMonth} ${title}`}
                  aria-pressed={picked}
                  aria-current={iso === today ? "date" : undefined}
                  onClick={() => {
                    onPick(iso);
                    close();
                  }}
                  className={`flex aspect-square items-center justify-center rounded-[10px] border text-[14.5px] leading-none transition-colors disabled:pointer-events-none disabled:border-transparent disabled:text-faint/55 ${
                    picked
                      ? "border-gold bg-gold font-medium text-on-gold"
                      : iso === today
                        ? "border-cream/45 text-cream hover:bg-raised"
                        : "border-transparent text-cream hover:bg-raised"
                  }`}
                >
                  {dayOfMonth}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
