import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const stroked = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const filled = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
};

/** Four-point sparkle, filled */
export function SparkleIcon(props: IconProps) {
  return (
    <svg {...filled} {...props}>
      <path d="M12 2c.7 5.6 4.4 9.3 10 10-5.6.7-9.3 4.4-10 10-.7-5.6-4.4-9.3-10-10 5.6-.7 9.3-4.4 10-10Z" />
    </svg>
  );
}

/** Four-point sparkle, outlined (Tattoos quick link) */
export function SparkleOutlineIcon(props: IconProps) {
  return (
    <svg {...stroked} strokeWidth={1.4} {...props}>
      <path d="M12 2.5c.65 5.3 4.2 8.85 9.5 9.5-5.3.65-8.85 4.2-9.5 9.5-.65-5.3-4.2-8.85-9.5-9.5 5.3-.65 8.85-4.2 9.5-9.5Z" />
    </svg>
  );
}

/** Large + small sparkle (Why Myst quick link) */
export function StarsIcon(props: IconProps) {
  return (
    <svg {...stroked} strokeWidth={1.4} {...props}>
      <path d="M9.5 2.5c.55 4.5 3.5 7.45 8 8-4.5.55-7.45 3.5-8 8-.55-4.5-3.5-7.45-8-8 4.5-.55 7.45-3.5 8-8Z" />
      <path d="M18.5 15c.3 2.1 1.4 3.2 3.5 3.5-2.1.3-3.2 1.4-3.5 3.5-.3-2.1-1.4-3.2-3.5-3.5 2.1-.3 3.2-1.4 3.5-3.5Z" />
    </svg>
  );
}

export function EarIcon(props: IconProps) {
  return (
    <svg {...stroked} strokeWidth={1.4} {...props}>
      <path d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 2.4-1.3 3.6-2.3 4.9-.8 1-1.1 1.9-1.3 3.2-.3 2-1.6 3.4-3.5 3.4-1.6 0-2.8-.9-3.2-2.2" />
      <path d="M9.6 9.7a2.4 2.4 0 0 1 4.8 0c0 1.3-.9 1.9-1.5 2.7" />
    </svg>
  );
}

export function PeopleIcon(props: IconProps) {
  return (
    <svg {...stroked} strokeWidth={1.4} {...props}>
      <path d="M12 12.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M6.8 20a5.2 5.2 0 0 1 10.4 0" />
      <path d="M17.2 10.2a2.4 2.4 0 1 0-1-4.6" />
      <path d="M18.6 13.5a4.6 4.6 0 0 1 3.4 4.3" />
      <path d="M6.8 10.2a2.4 2.4 0 1 1 1-4.6" />
      <path d="M5.4 13.5A4.6 4.6 0 0 0 2 17.8" />
    </svg>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <svg {...stroked} strokeWidth={2} {...props}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function ArrowDownIcon(props: IconProps) {
  return (
    <svg {...stroked} {...props}>
      <path d="M12 5v14" />
      <path d="m6 13 6 6 6-6" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...stroked} strokeWidth={2} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...stroked} strokeWidth={1.4} {...props}>
      <path d="M12 21.5s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12Z" />
      <path d="M12 12.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...stroked} strokeWidth={1.4} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...stroked} strokeWidth={1.4} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...filled} {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...stroked} strokeWidth={1.8} {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...stroked} strokeWidth={1.8} {...props}>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}
