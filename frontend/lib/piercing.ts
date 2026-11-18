/**
 * Piercing zones, price list and photos, as drawn in the design: all still
 * placeholders. The names, notes and prices a visitor reads come from the
 * dictionaries' `piercing` section until the real ones are added here.
 */

/** Where a piercing sits; each key picks its label from `piercing.placements`. */
export const placements = ["ear", "nose", "lip", "eyebrow", "navel"] as const;
export type Placement = (typeof placements)[number];

/** Zone buttons; each key picks its label from `piercing.zones`. */
export type ZoneKey = "ear" | "face" | "body" | "microdermal" | "intimate";

/** `rows` is how many lines the zone's own price list has. */
export const zones: { key: ZoneKey; rows: number }[] = [
  { key: "ear", rows: 5 },
  { key: "face", rows: 4 },
  { key: "body", rows: 3 },
  { key: "microdermal", rows: 2 },
  { key: "intimate", rows: 3 },
];

export type PiercingWork = {
  placement: Placement;
  /** width / height of the photo, as CSS `aspect-ratio` */
  ratio: string;
};

export const piercingWorks: PiercingWork[] = [
  { placement: "ear", ratio: "3 / 4" },
  { placement: "nose", ratio: "1 / 1" },
  { placement: "lip", ratio: "4 / 5" },
  { placement: "ear", ratio: "1 / 1" },
  { placement: "eyebrow", ratio: "4 / 5" },
  { placement: "ear", ratio: "3 / 4" },
  { placement: "navel", ratio: "3 / 4" },
  { placement: "nose", ratio: "4 / 5" },
  { placement: "lip", ratio: "1 / 1" },
  { placement: "ear", ratio: "4 / 5" },
  { placement: "nose", ratio: "3 / 4" },
  { placement: "navel", ratio: "1 / 1" },
];
