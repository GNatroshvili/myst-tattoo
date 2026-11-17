/**
 * Decorative light behind the lower half of the page: two burgundy glows in the
 * corners and a few blurred rose streaks, anchored to the bottom as drawn.
 */
export function Backdrop({ scope }: { scope: string }) {
  // Next keeps the previous page in the document (hidden) after a navigation, so
  // two pages' backdrops can coexist. `scope` keeps their gradient ids apart;
  // otherwise a reference could resolve to the copy that is not being drawn.
  const id = `bd-${scope}`;

  return (
    <svg
      aria-hidden
      viewBox="0 0 1280 1000"
      preserveAspectRatio="none"
      /* the mask fades the top edge in, so the glow never starts on a hard line */
      className="pointer-events-none absolute bottom-0 left-0 h-[1000px] w-full [mask-image:linear-gradient(to_bottom,transparent,#000_420px)]"
    >
      <defs>
        <radialGradient id={`${id}-glow-left`} cx="0" cy="0.35" r="0.5">
          <stop offset="0" stopColor="#7D2E55" stopOpacity="0.3" />
          <stop offset="1" stopColor="#7D2E55" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-glow-right`} cx="1" cy="0.95" r="0.45">
          <stop offset="0" stopColor="#8A3360" stopOpacity="0.42" />
          <stop offset="1" stopColor="#8A3360" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-streak`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#C0628F" stopOpacity="0" />
          <stop offset="0.5" stopColor="#C0628F" stopOpacity="0.5" />
          <stop offset="1" stopColor="#C0628F" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <rect x="0" y="0" width="1280" height="1000" fill={`url(#${id}-glow-left)`} />
      <rect x="0" y="0" width="1280" height="1000" fill={`url(#${id}-glow-right)`} />
      <g fill="none" stroke={`url(#${id}-streak)`} filter={`url(#${id}-soft)`}>
        <path d="M-60 170C60 250 110 380 40 560" strokeWidth="10" />
        <path d="M-80 260C90 330 170 470 60 700" strokeWidth="5" />
        <path d="M1340 60C1200 130 1130 190 1010 210" strokeWidth="7" />
        <path d="M1340 760C1180 800 1040 880 900 1010" strokeWidth="12" />
        <path d="M1340 840C1220 870 1120 930 1040 1010" strokeWidth="6" />
      </g>
    </svg>
  );
}
