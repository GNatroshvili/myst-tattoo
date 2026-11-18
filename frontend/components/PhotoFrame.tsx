import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/lib/types";

type Props = {
  /** width / height, as CSS `aspect-ratio` */
  ratio: string;
  /**
   * What a screen reader announces: what the photo shows, or what picking it
   * does, or (with no photo) that one is missing.
   */
  aria: string;
  /** The photo. Without one the frame shows `icon` and `label` in its place. */
  photo?: Photo | null;
  /** which of the photo's two files to load: the small copy unless the frame is large */
  size?: "thumb" | "full";
  /** small caption under the icon, already in display case */
  label: string;
  icon: ReactNode;
  className?: string;
  /** makes the tile a link (an artist's photo opens their profile) */
  href?: string;
  /** makes the tile a button (a tattoo's photo opens its details) */
  onClick?: () => void;
  /** colouring while empty: near-black, or the lighter burgundy of the piercing gallery */
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

const frame =
  "relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-[14px] border border-cream/16";
const pickable = "transition-colors hover:border-cream/45";

/**
 * A framed photo. Until the real photo exists it is a dark tile with an icon
 * and a caption holding its place.
 */
export function PhotoFrame({
  ratio,
  aria,
  photo,
  size = "thumb",
  label,
  icon,
  className = "w-full",
  href,
  onClick,
  tone = "dark",
}: Props) {
  const style = { aspectRatio: ratio };
  const look = `${frame} ${tones[tone].ground}`;
  const content = photo ? (
    // Uploaded photos are already sized and compressed by the backend, so they
    // are shown as they are. The frame carries the description (`aria`).
    <Image src={photo[size]} alt="" fill unoptimized className="object-cover" draggable={false} />
  ) : (
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
