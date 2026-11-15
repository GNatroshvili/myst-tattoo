import Link from "next/link";

/** Arc with a small four-point star: the mark that sits over the wordmark. */
function Arc({
  strokeWidth,
  className,
  starClassName,
}: {
  strokeWidth: number;
  className?: string;
  starClassName?: string;
}) {
  return (
    <svg aria-hidden viewBox="0 0 96 34" fill="none" className={className}>
      <path
        d="M3 32C8 12 28 2 48 2C68 2 88 12 93 32"
        stroke="#D9A3E3"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M44 9C44.4 12.6 45.4 13.6 49 14C45.4 14.4 44.4 15.4 44 19C43.6 15.4 42.6 14.4 39 14C42.6 13.6 43.6 12.6 44 9Z"
        fill="#E3B9EA"
        className={starClassName}
      />
    </svg>
  );
}

/** Header logo: arc + "MYST" in Italiana + spaced "TATTOO STUDIO". Links home. */
export function Logo({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`relative flex w-[132px] shrink-0 flex-col items-center pt-6 text-petal-300 transition-opacity hover:opacity-85 ${className}`}
    >
      <Arc strokeWidth={1.3} className="absolute left-[26px] top-0 h-[34px] w-24" />
      <span className="font-display pl-[3px] text-[50px] leading-[50px] tracking-[3px]">MYST</span>
      <span className="mt-1 pl-1 text-[8px] leading-3 tracking-[4.2px] text-petal-500">
        TATTOO STUDIO
      </span>
    </Link>
  );
}

/** The same lockup at voucher-card size (decorative, not a link). */
export function CardLogo() {
  return (
    <>
      <Arc
        strokeWidth={1.5}
        className="-mb-2.5 ml-1 h-[26px] w-[74px] overflow-visible"
        starClassName="voucher-star"
      />
      <span className="font-display pl-[2.5px] text-[40px] leading-10 tracking-[2.5px]">MYST</span>
      <span className="mt-[3px] pl-[3.4px] text-[6.5px] leading-[10px] tracking-[3.4px] text-petal-500">
        TATTOO STUDIO
      </span>
    </>
  );
}
