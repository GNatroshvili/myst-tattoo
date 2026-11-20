import { site } from "./site";
import type { DayOption } from "./dates";

export type IdeaPayload = {
  name: string;
  service: string;
  idea?: string;
  /** the picked days, earliest first; none is fine */
  days?: DayOption[];
  time?: string | null;
};

/** One template per line of the message; `{placeholders}` are filled in. */
export type MessageTemplates = {
  greeting: string;
  name: string;
  idea: string;
  day: string;
  /** used instead of `day` when several days are picked */
  days: string;
  time: string;
};

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");

/** Builds the pre-filled text that opens in WhatsApp, in the page's language. */
export function buildWhatsAppMessage(p: IdeaPayload, t: MessageTemplates) {
  const lines = [
    fill(t.greeting, { service: p.service }),
    fill(t.name, { name: p.name.trim() || "-" }),
  ];
  if (p.idea?.trim()) lines.push(fill(t.idea, { idea: p.idea.trim() }));
  const days = p.days ?? [];
  if (days.length === 1) lines.push(fill(t.day, { day: days[0].long }));
  // the long forms have commas of their own, so the days are set apart by semicolons
  if (days.length > 1) lines.push(fill(t.days, { days: days.map((day) => day.long).join("; ") }));
  if (p.time) lines.push(fill(t.time, { time: p.time }));
  return lines.join("\n");
}

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
