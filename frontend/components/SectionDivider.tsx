import { StarIcon } from "./ui/Icons";

/** Gold star between two hairlines that fade outwards. */
export function SectionDivider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex items-center justify-center gap-1 ${className}`}>
      <span className="block h-px w-[120px] bg-gradient-to-r from-line/0 to-line/60" />
      <StarIcon className="h-[26px] w-[26px] text-gold drop-shadow-[0_0_5px_rgba(250,225,40,0.5)]" />
      <span className="block h-px w-[120px] bg-gradient-to-r from-line/60 to-line/0" />
    </div>
  );
}
