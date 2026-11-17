import { StarIcon } from "./ui/Icons";

/** Gold star between two gold hairlines that fade outwards. */
export function SectionDivider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex items-center justify-center gap-1.5 ${className}`}>
      <span className="block h-px w-[110px] bg-gradient-to-r from-gold/0 to-gold" />
      <StarIcon className="h-[26px] w-[26px] text-gold drop-shadow-[0_0_5px_rgba(247,213,74,0.6)]" />
      <span className="block h-px w-[110px] bg-gradient-to-r from-gold to-gold/0" />
    </div>
  );
}
