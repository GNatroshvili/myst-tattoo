import Link from "next/link";

type LogoMarkProps = {
  /** Scale of the whole mark; 1 = header size */
  scale?: number;
  className?: string;
};

/** Visual logo: arc + sparkle over "MYST", "TATTOO STUDIO" beneath. */
export function LogoMark({ scale = 1, className = "" }: LogoMarkProps) {
  return (
    <span
      className={`inline-flex flex-col items-center leading-none ${className}`}
      style={{ transform: scale === 1 ? undefined : `scale(${scale})` }}
    >
      <span className="relative block px-3 pt-5">
        <svg
          aria-hidden
          viewBox="0 0 120 44"
          className="absolute inset-x-0 top-0 h-8 w-full text-lilac-300/80"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        >
          <path d="M8 42C14 18 32 6 60 6c28 0 46 12 52 36" />
          <path
            d="M30 2c.5 3.6 2.6 5.7 6.2 6.2C32.6 8.7 30.5 10.8 30 14.4c-.5-3.6-2.6-5.7-6.2-6.2C27.4 7.7 29.5 5.6 30 2Z"
            className="text-gold"
            fill="currentColor"
            stroke="none"
          />
        </svg>
        <span className="display block text-[30px] tracking-[0.16em] text-lilac-200">
          Myst
        </span>
      </span>
      <span className="mt-1 text-[8px] font-medium uppercase tracking-[0.45em] text-lilac-300/80">
        Tattoo Studio
      </span>
    </span>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Myst Tattoo Studio — home"
      className={`inline-flex rounded-lg transition hover:opacity-90 ${className}`}
    >
      <LogoMark />
    </Link>
  );
}
