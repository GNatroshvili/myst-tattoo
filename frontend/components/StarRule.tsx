import { StarIcon } from "./ui/Icons";

/**
 * Gold star with a hairline fading out to the right: sits under a title.
 * `className` places it and `star` sizes the star, e.g. "h-8 w-8".
 */
export function StarRule({ className = "", star }: { className?: string; star: string }) {
  return (
    <div aria-hidden className={`flex items-center gap-1 ${className}`}>
      <StarIcon className={`${star} text-gold drop-shadow-[0_0_5px_rgba(247,213,74,0.6)]`} />
      <span className="block h-px w-[110px] bg-gradient-to-r from-gold to-gold/0" />
    </div>
  );
}
