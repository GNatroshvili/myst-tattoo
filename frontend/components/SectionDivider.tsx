import { SparkleIcon } from "./ui/Icons";

export function SectionDivider({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center gap-4 text-gold ${className}`}
    >
      <span className="h-px w-24 bg-gradient-to-r from-transparent to-lilac-400/70 sm:w-32" />
      <SparkleIcon className="h-5 w-5 animate-twinkle" />
      <span className="h-px w-24 bg-gradient-to-l from-transparent to-lilac-400/70 sm:w-32" />
    </div>
  );
}
