import type { ReactNode } from "react";

/** Filter pill; the picked one gets the form's gold "selected" look. */
export function FilterChip({
  on,
  onPick,
  children,
}: {
  on: boolean;
  onPick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onPick}
      className={`h-11 rounded-full border px-5 text-[13.5px] font-semibold text-white transition-colors ${
        on ? "border-gold bg-raised" : "border-line/35 bg-well hover:border-line/60"
      }`}
    >
      {children}
    </button>
  );
}
