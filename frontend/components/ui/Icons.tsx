import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Shared attributes for the thin outlined icons drawn in the design. */
const outline = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Four-point star, filled (gold flares in the hero and section divider). */
export function StarIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" aria-hidden {...props}>
      <path d="M16 0C16.5 11.5 20.5 15.5 32 16C20.5 16.5 16.5 20.5 16 32C15.5 20.5 11.5 16.5 0 16C11.5 15.5 15.5 11.5 16 0Z" />
    </svg>
  );
}

/** Diagonal arrow inside the gold buttons. */
export function ArrowUpRightIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 16 16" strokeWidth={1.8} {...props}>
      <path d="M4 12L12 4" />
      <path d="M5.5 4H12V10.5" />
    </svg>
  );
}

/** Long arrow: after text links, in the outlined gold buttons, under quick links. */
export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 20 14" strokeWidth={1.5} {...props}>
      <path d="M2 7H18" />
      <path d="M12.5 1.5L18 7L12.5 12.5" />
    </svg>
  );
}

/** Long arrow pointing back ("All artists", "Previous"). */
export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 20 14" strokeWidth={1.5} {...props}>
      <path d="M18 7H2" />
      <path d="M7.5 1.5L2 7L7.5 12.5" />
    </svg>
  );
}

/** Small cross on the tattoo details window's close button. */
export function XIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 16 16" strokeWidth={1.6} {...props}>
      <path d="M3 3L13 13" />
      <path d="M13 3L3 13" />
    </svg>
  );
}

/** Tick beside the chosen row of a drop-down. */
export function CheckIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 16 16" strokeWidth={1.8} {...props}>
      <path d="M3 8.5L6.5 12L13 4.5" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 12 8" strokeWidth={1.5} {...props}>
      <path d="M1.5 1.5L6 6L10.5 1.5" />
    </svg>
  );
}

/* ---------- quick links ---------- */

/** Outlined four-point star: tattoos, and the place of a tattoo's photo. */
export function TattooIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 48 48" strokeWidth={1.3} {...props}>
      <path d="M24 3C24.8 17.5 30.5 23.2 45 24C30.5 24.8 24.8 30.5 24 45C23.2 30.5 17.5 24.8 3 24C17.5 23.2 23.2 17.5 24 3Z" />
    </svg>
  );
}

export function PiercingIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 48 48" strokeWidth={1.2} {...props}>
      <path d="M13 17.5a12.5 12.5 0 1 1 25 0c0 11.5-11.5 11.5-11.5 19.5a6.75 6.75 0 1 1-13.5 0" />
      <path d="M31 17.5a5.5 5.5 0 0 0-11 0v2.2a4.2 4.2 0 1 1 0 8.4" />
    </svg>
  );
}

export function ArtistsIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 48 48" strokeWidth={1.2} {...props}>
      <circle cx="19" cy="15" r="7.5" />
      <path d="M5 41v-3.5a11 11 0 0 1 11-11h6a11 11 0 0 1 11 11V41Z" />
      <path d="M30 7.8a7.5 7.5 0 0 1 0 14.4" />
      <path d="M36.5 27.5a11 11 0 0 1 6.5 10V41h-4" />
    </svg>
  );
}

/** One person: stands in for an artist's photo. */
export function PersonIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 48 48" strokeWidth={1.3} {...props}>
      <circle cx="24" cy="16" r="8" />
      <path d="M8 42v-3a12 12 0 0 1 12-12h8a12 12 0 0 1 12 12v3Z" />
    </svg>
  );
}

/** Framed landscape: stands in for an article's image. */
export function ImageIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 48 48" strokeWidth={1.3} {...props}>
      <rect x="6" y="9" width="36" height="30" rx="4" />
      <circle cx="17" cy="19" r="3.2" />
      <path d="M6 33L18 24L27 31L33 26L42 33" />
    </svg>
  );
}

/** Circled "i": info and aftercare. */
export function InfoIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 48 48" strokeWidth={1.2} {...props}>
      <circle cx="24" cy="24" r="19" />
      <path d="M24 21.5V33" />
      <path d="M21.5 33H26.5" />
      <path d="M21.8 21.5H24" />
      <circle cx="24" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ---------- footer ---------- */

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 32 32" strokeWidth={1.3} {...props}>
      <path d="M16 29C10 21.5 7 17 7 12.5a9 9 0 0 1 18 0C25 17 22 21.5 16 29Z" />
      <circle cx="16" cy="12.5" r="3.2" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 32 32" strokeWidth={1.3} {...props}>
      <rect x="4.5" y="4.5" width="23" height="23" rx="6.5" />
      <circle cx="16" cy="16" r="5.4" />
      <circle cx="22.6" cy="9.4" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 32 32" strokeWidth={1.3} {...props}>
      <rect x="4.5" y="7" width="23" height="21" rx="4" />
      <path d="M4.5 13H27.5" />
      <path d="M10.5 3.5V9" />
      <path d="M21.5 3.5V9" />
      <g fill="currentColor" stroke="none">
        <circle cx="11" cy="19" r="1.1" />
        <circle cx="16" cy="19" r="1.1" />
        <circle cx="21" cy="19" r="1.1" />
      </g>
    </svg>
  );
}

/* ---------- form / header ---------- */

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 24 24" strokeWidth={1.8} {...props}>
      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z" />
      <path
        d="M9.3 8.2c-.5 0-1.1.7-1.1 1.7c0 2.4 3.4 5.9 5.9 5.9c1 0 1.7-.6 1.7-1.1c0-.3-.1-.5-.4-.6l-1.5-.8l-.9.9c-1-.4-2.3-1.7-2.7-2.7l.9-.9l-.8-1.6c-.2-.5-.5-.8-1.1-.8Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
      <path d="M4 7.5h16" />
      <path d="M4 12h16" />
      <path d="M4 16.5h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}
