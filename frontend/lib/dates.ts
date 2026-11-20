export type DayOption = {
  /** ISO calendar date, e.g. 2026-11-10 */
  iso: string;
  /** "Today", "Tomorrow" or a short weekday ("Wed"), in the page's language */
  label: string;
  /** Day of month */
  day: string;
  /** Short month name ("Nov") */
  month: string;
  /** Long form for messages, e.g. "Wednesday, 12 November"; with the year when it is not this one */
  long: string;
};

export type DayLabels = {
  /** BCP 47 tag used for weekday and month names, e.g. "ka-GE" */
  intl: string;
  today: string;
  tomorrow: string;
};

/**
 * Month and weekday names in one language. They are worked out on the server
 * and handed to the browser, because not every browser knows the Georgian
 * ones. Weeks start on Monday, as they do in Georgia.
 */
export type CalendarNames = {
  /** January first */
  months: string[];
  monthsShort: string[];
  /** Monday first */
  weekdays: string[];
  weekdaysShort: string[];
};

const DAY_MS = 86_400_000;

/** Midnight (UTC) of today's calendar date as seen in `timeZone`. */
function calendarDateIn(timeZone: string, now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return Date.UTC(get("year"), get("month") - 1, get("day"));
}

/** The names a calendar needs, in the language of `intl` (a BCP 47 tag). Server only. */
export function getCalendarNames(intl: string): CalendarNames {
  const name = (options: Intl.DateTimeFormatOptions) => {
    const format = new Intl.DateTimeFormat(intl, { timeZone: "UTC", ...options });
    return (date: number) => format.format(new Date(date));
  };
  const monthOf = (i: number) => Date.UTC(2024, i, 1);
  // 1 January 2024 was a Monday
  const weekdayOf = (i: number) => Date.UTC(2024, 0, 1 + i);
  const twelve = Array.from({ length: 12 }, (_, i) => i);
  const seven = Array.from({ length: 7 }, (_, i) => i);
  return {
    months: twelve.map((i) => name({ month: "long" })(monthOf(i))),
    monthsShort: twelve.map((i) => name({ month: "short" })(monthOf(i))),
    weekdays: seven.map((i) => name({ weekday: "long" })(weekdayOf(i))),
    weekdaysShort: seven.map((i) => name({ weekday: "short" })(weekdayOf(i))),
  };
}

/* ---------- calendar dates as plain "YYYY-MM-DD" text ---------- */

/** "2026-11-10" → that day's midnight, UTC */
export const isoToTime = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
export const timeToIso = (time: number) => new Date(time).toISOString().slice(0, 10);
/** `iso` moved by a number of days (negative goes back) */
export const addDays = (iso: string, days: number) => timeToIso(isoToTime(iso) + days * DAY_MS);
/** Position in a Monday-first week: 0 for Monday … 6 for Sunday */
export const weekdayIndex = (iso: string) => (new Date(isoToTime(iso)).getUTCDay() + 6) % 7;

/**
 * One day as the booking form shows and sends it. Works in the browser too:
 * it needs no more than the names. `today` is today's date (in the studio's
 * time zone), which decides the "Today" / "Tomorrow" labels and whether the
 * long form carries the year.
 */
export function dayOption(
  iso: string,
  names: CalendarNames,
  today: string,
  labels: Pick<DayLabels, "today" | "tomorrow">
): DayOption {
  const date = new Date(isoToTime(iso));
  const month = date.getUTCMonth();
  const weekday = weekdayIndex(iso);
  const ahead = Math.round((isoToTime(iso) - isoToTime(today)) / DAY_MS);
  const year = iso.slice(0, 4) === today.slice(0, 4) ? "" : ` ${date.getUTCFullYear()}`;
  return {
    iso,
    label: ahead === 0 ? labels.today : ahead === 1 ? labels.tomorrow : names.weekdaysShort[weekday],
    day: String(date.getUTCDate()),
    month: names.monthsShort[month],
    long: `${names.weekdays[weekday]}, ${date.getUTCDate()} ${names.months[month]}${year}`,
  };
}

/**
 * Returns `count` consecutive days starting with today in the given time zone.
 * Dates are built in UTC from the local calendar date, so DST shifts can't skip a day.
 */
export function getUpcomingDays(
  count: number,
  timeZone: string,
  labels: DayLabels,
  now: Date = new Date()
): DayOption[] {
  const today = timeToIso(calendarDateIn(timeZone, now));
  const names = getCalendarNames(labels.intl);
  return Array.from({ length: count }, (_, i) => dayOption(addDays(today, i), names, today, labels));
}
