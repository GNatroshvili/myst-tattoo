import { site } from "./site";
import type { DayOption } from "./dates";

export type IdeaPayload = {
  name: string;
  service: string;
  idea?: string;
  day?: DayOption | null;
  time?: string | null;
};

/** One template per line of the message; `{placeholders}` are filled in. */
export type MessageTemplates = {
  greeting: string;
  name: string;
  idea: string;
  day: string;
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
  if (p.day) lines.push(fill(t.day, { day: p.day.long }));
  if (p.time) lines.push(fill(t.time, { time: p.time }));
  return lines.join("\n");
}

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
