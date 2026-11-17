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
      <path d="M16 1C16.8 11 21 15.2 31 16C21 16.8 16.8 21 16 31C15.2 21 11 16.8 1 16C11 15.2 15.2 11 16 1Z" />
    </svg>
  );
}

/** Diagonal arrow used inside buttons and links. */
export function ArrowUpRightIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 16 16" strokeWidth={1.8} {...props}>
      <path d="M4 12L12 4" />
      <path d="M5.5 4H12V10.5" />
    </svg>
  );
}

/** Long arrow under each quick link. */
export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 20 14" strokeWidth={1.4} {...props}>
      <path d="M2 7H18" />
      <path d="M12.5 1.5L18 7L12.5 12.5" />
    </svg>
  );
}

/** Long arrow pointing back ("All artists", "Previous"). */
export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 20 14" strokeWidth={1.4} {...props}>
      <path d="M18 7H2" />
      <path d="M7.5 1.5L2 7L7.5 12.5" />
    </svg>
  );
}

/** Small cross on the tattoo details window's close button. */
export function XIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 16 16" strokeWidth={1.8} {...props}>
      <path d="M3 3L13 13" />
      <path d="M13 3L3 13" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 12 8" strokeWidth={1.6} {...props}>
      <path d="M1.5 1.5L6 6L10.5 1.5" />
    </svg>
  );
}

/* ---------- quick links ---------- */

export function TattooIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 48 48" strokeWidth={1.4} {...props}>
      <path d="M24 4C25.2 17.5 30.5 22.8 44 24C30.5 25.2 25.2 30.5 24 44C22.8 30.5 17.5 25.2 4 24C17.5 22.8 22.8 17.5 24 4Z" />
    </svg>
  );
}

export function PiercingIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 48 48" strokeWidth={1.4} {...props}>
      <path d="M13 17.5a12.5 12.5 0 1 1 25 0c0 11.5-11.5 11.5-11.5 19.5a6.75 6.75 0 1 1-13.5 0" />
      <path d="M31 17.5a5.5 5.5 0 0 0-11 0v2.2a4.2 4.2 0 1 1 0 8.4" />
    </svg>
  );
}

export function ArtistsIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 56 48" strokeWidth={1.4} {...props}>
      <circle cx="28" cy="14" r="8" />
      <path d="M12 43v-4.5a11.5 11.5 0 0 1 11.5-11.5h9a11.5 11.5 0 0 1 11.5 11.5V43Z" />
      <path d="M17.5 8.2a7 7 0 0 0-1.2 13.4" />
      <path d="M12.2 26.2a9.5 9.5 0 0 0-8.2 9.4V39h4.5" />
      <path d="M38.5 8.2a7 7 0 0 1 1.2 13.4" />
      <path d="M43.8 26.2a9.5 9.5 0 0 1 8.2 9.4V39h-4.5" />
    </svg>
  );
}

/** One person: stands in for an artist's photo. */
export function PersonIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 48 48" strokeWidth={1.4} {...props}>
      <circle cx="24" cy="16" r="8" />
      <path d="M8 42v-3a12 12 0 0 1 12-12h8a12 12 0 0 1 12 12v3Z" />
    </svg>
  );
}

export function WhyMystIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 48 48" strokeWidth={1.4} {...props}>
      <path d="M21 3C22.1 15.6 26.4 19.9 39 21C26.4 22.1 22.1 26.4 21 39C19.9 26.4 15.6 22.1 3 21C15.6 19.9 19.9 15.6 21 3Z" />
      <path d="M37 30C37.4 34.6 39.4 36.6 44 37C39.4 37.4 37.4 39.4 37 44C36.6 39.4 34.6 37.4 30 37C34.6 36.6 36.6 34.6 37 30Z" />
    </svg>
  );
}

/* ---------- footer ---------- */

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 32 32" strokeWidth={1.5} {...props}>
      <path d="M16 29C10 21.5 7 17 7 12.5a9 9 0 0 1 18 0C25 17 22 21.5 16 29Z" />
      <circle cx="16" cy="12.5" r="3.2" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 32 32" strokeWidth={1.5} {...props}>
      <rect x="4.5" y="4.5" width="23" height="23" rx="6.5" />
      <circle cx="16" cy="16" r="5.4" />
      <circle cx="22.6" cy="9.4" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 32 32" strokeWidth={1.5} {...props}>
      <rect x="4.5" y="7" width="23" height="21" rx="4" />
      <path d="M4.5 13H27.5" />
      <path d="M10.5 3.5V9" />
      <path d="M21.5 3.5V9" />
      <g fill="currentColor" stroke="none">
        <rect x="9" y="16.5" width="2.6" height="2.6" rx="0.6" />
        <rect x="14.7" y="16.5" width="2.6" height="2.6" rx="0.6" />
        <rect x="20.4" y="16.5" width="2.6" height="2.6" rx="0.6" />
        <rect x="9" y="21.6" width="2.6" height="2.6" rx="0.6" />
        <rect x="14.7" y="21.6" width="2.6" height="2.6" rx="0.6" />
        <rect x="20.4" y="21.6" width="2.6" height="2.6" rx="0.6" />
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
    <svg {...outline} viewBox="0 0 24 24" strokeWidth={1.6} {...props}>
      <path d="M4 7.5h16" />
      <path d="M4 12h16" />
      <path d="M4 16.5h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...outline} viewBox="0 0 24 24" strokeWidth={1.6} {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}
