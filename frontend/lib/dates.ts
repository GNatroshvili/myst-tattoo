export type DayOption = {
  /** ISO calendar date, e.g. 2026-11-10 */
  iso: string;
  /** "Today", "Tomorrow" or a short weekday ("Wed"), in the page's language */
  label: string;
  /** Day of month */
  day: string;
  /** Short month name ("Nov") */
  month: string;
  /** Long form for messages, e.g. "Wednesday 12 November" */
  long: string;
};

export type DayLabels = {
  /** BCP 47 tag used for weekday and month names, e.g. "ka-GE" */
  intl: string;
  today: string;
  tomorrow: string;
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
  const start = calendarDateIn(timeZone, now);
  const weekday = new Intl.DateTimeFormat(labels.intl, { timeZone: "UTC", weekday: "short" });
  const month = new Intl.DateTimeFormat(labels.intl, { timeZone: "UTC", month: "short" });
  const long = new Intl.DateTimeFormat(labels.intl, {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return Array.from({ length: count }, (_, i) => {
    const date = new Date(start + i * DAY_MS);
    return {
      iso: date.toISOString().slice(0, 10),
      label: i === 0 ? labels.today : i === 1 ? labels.tomorrow : weekday.format(date),
      day: String(date.getUTCDate()),
      month: month.format(date),
      long: long.format(date),
    };
  });
}
