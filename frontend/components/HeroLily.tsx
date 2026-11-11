import Image from "next/image";
import lily from "@/public/images/hero-lily.webp";

/**
 * Hero artwork: the purple lily with the golden arc from the studio design,
 * cut out with a transparent background so it floats over the page glow.
 */
export function HeroLily() {
  return (
    <div className="relative mx-auto w-full max-w-[400px] sm:max-w-[480px] lg:max-w-[620px]">
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(150,55,185,0.35),transparent)] blur-3xl"
      />
      <Image
        src={lily}
        alt="Purple lily with a golden arc and a sparkle"
        priority
        sizes="(min-width: 1024px) 45vw, (min-width: 640px) 480px, 400px"
        className="relative h-auto w-full animate-float"
      />
    </div>
  );
}
