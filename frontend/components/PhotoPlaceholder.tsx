import type { ReactNode } from "react";
import Link from "next/link";

type Props = {
  /** width / height, as CSS `aspect-ratio` */
  ratio: string;
  /** what a screen reader announces: the missing photo, or what picking it does */
  aria: string;
  /** small caption under the icon, already in display case */
  label: string;
  icon: ReactNode;
  className?: string;
  /** makes the tile a link (an artist's photo opens their profile) */
  href?: string;
  /** makes the tile a button (a tattoo's photo opens its details) */
  onClick?: () => void;
  /** colouring: near-black, or the lighter burgundy of the piercing gallery */
  tone?: keyof typeof tones;
};

const tones = {
  dark: {
    ground: "bg-[linear-gradient(160deg,#1b1116_0%,#120e10_55%,#0e0b0c_100%)]",
    label: "text-muted",
  },
  wine: {
    ground: "bg-[linear-gradient(160deg,#3a1a2a_0%,#2a1420_55%,#1e1017_100%)]",
    label: "text-[#d9c6c9]",
  },
};

const frame = "flex flex-col items-center justify-center gap-3 rounded-[14px] border border-cream/16";
const pickable = "transition-colors hover:border-cream/45";

/** Framed dark tile that holds the place of a photo until the real one is added. */
export function PhotoPlaceholder({
  ratio,
  aria,
  label,
  icon,
  className = "w-full",
  href,
  onClick,
  tone = "dark",
}: Props) {
  const style = { aspectRatio: ratio };
  const look = `${frame} ${tones[tone].ground}`;
  const content = (
    <>
      {icon}
      <span className={`caps text-[10px] leading-[14px] tracking-[3.2px] ${tones[tone].label}`}>
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-label={aria} style={style} className={`${look} ${pickable} ${className}`}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        aria-label={aria}
        onClick={onClick}
        style={style}
        className={`${look} ${pickable} p-0 ${className}`}
      >
        {content}
      </button>
    );
  }
  return (
    <div role="img" aria-label={aria} style={style} className={`${look} ${className}`}>
      {content}
    </div>
  );
}
