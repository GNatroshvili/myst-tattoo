import type { ReactNode } from "react";

/** Filter pill: an outline, which turns gold (with its label) on the picked one. */
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
      className={`h-11 rounded-full border px-5 text-[15px] transition-colors ${
        on ? "border-gold text-gold" : "border-cream/28 text-cream hover:border-cream/60"
      }`}
    >
      {children}
    </button>
  );
}
