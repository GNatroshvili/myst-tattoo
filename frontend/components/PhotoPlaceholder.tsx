import type { ReactNode } from "react";

type Props = {
  /** width / height, as CSS `aspect-ratio` */
  ratio: string;
  /** what a screen reader announces in place of the photo */
  aria: string;
  /** small caption under the icon, already in display case */
  label: string;
  icon: ReactNode;
};

/** Framed plum tile that holds the place of a photo until the real one is added. */
export function PhotoPlaceholder({ ratio, aria, label, icon }: Props) {
  return (
    <div
      role="img"
      aria-label={aria}
      style={{ aspectRatio: ratio }}
      className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-line/36 bg-[linear-gradient(160deg,#24122a_0%,#1b0f1c_55%,#170a18_100%)]"
    >
      {icon}
      <span className="caps px-2 text-center text-[10px] leading-[14px] tracking-[3.2px] text-[#c9bacf]">
        {label}
      </span>
    </div>
  );
}
