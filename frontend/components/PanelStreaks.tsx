import { useId } from "react";

/**
 * Blurred orchid streaks crossing a `.voucher-panel` (gift vouchers on the home
 * page, the closing call-to-action on the artists and tattoos pages).
 */
export function PanelStreaks() {
  // unique per instance: a hidden copy of the page can share the document
  const id = useId();

  return (
    <svg
      aria-hidden
      viewBox="0 0 1064 182"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id={`${id}-streak`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#D46CF2" stopOpacity="0" />
          <stop offset="0.5" stopColor="#D46CF2" stopOpacity="0.6" />
          <stop offset="1" stopColor="#D46CF2" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-soft`} x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <g fill="none" stroke={`url(#${id}-streak)`} filter={`url(#${id}-soft)`}>
        <path d="M420 200C520 120 560 40 660 -10" strokeWidth="7" />
        <path d="M700 200C800 150 860 70 840 -10" strokeWidth="9" />
        <path d="M610 190C760 170 900 110 1000 20" strokeWidth="5" />
      </g>
    </svg>
  );
}
