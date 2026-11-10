import { site } from "./site";
import type { DayOption } from "./dates";

export type IdeaPayload = {
  name: string;
  service: string;
  idea?: string;
  day?: DayOption | null;
  time?: string | null;
};

/** Builds the pre-filled text that opens in WhatsApp. */
export function buildWhatsAppMessage(p: IdeaPayload) {
  const lines = [
    `Hi ${site.shortName}! I'd like to book a ${p.service.toLowerCase()}.`,
    `Name: ${p.name.trim() || "-"}`,
  ];
  if (p.idea?.trim()) lines.push(`Idea: ${p.idea.trim()}`);
  if (p.day) lines.push(`Preferred day: ${p.day.long}`);
  if (p.time) lines.push(`Time of day: ${p.time}`);
  return lines.join("\n");
}

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
