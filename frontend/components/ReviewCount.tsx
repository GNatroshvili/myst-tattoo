"use client";

import { useEffect, useRef } from "react";

/**
 * How many reviews the studio has, said the way a shop window would: in round
 * hundreds with a plus, "700+". A count within ten of the next hundred already
 * shows that hundred (690 to 789 read "700+", 790 reads "800+"); below 90
 * there is no hundred to round to and the count itself is shown.
 */
export function roundedCount(count: number): { value: number; plus: boolean } {
  const hundred = Math.floor((count + 10) / 100) * 100;
  return hundred > 0 ? { value: hundred, plus: true } : { value: count, plus: false };
}

/** How long the count takes, in milliseconds, whatever the number: quick at first, the last few tick by one at a time. */
const DURATION = 3000;

/**
 * The number itself. It is in the page from the start (for search engines and
 * screen readers); when it scrolls into view it counts up from 1 in order, and
 * the plus appears as it lands. Plays once, and for everyone: the studio wants
 * its motion shown even where the system asks for less.
 */
export function ReviewCount({ count, locale, className = "" }: { count: number; locale: string; className?: string }) {
  const { value, plus } = roundedCount(count);
  const numberRef = useRef<HTMLSpanElement>(null);
  const plusRef = useRef<HTMLSpanElement>(null);
  const format = new Intl.NumberFormat(locale);
  const final = format.format(value);

  useEffect(() => {
    const el = numberRef.current;
    const sign = plusRef.current;
    if (!el || value < 2) return;

    const write = new Intl.NumberFormat(locale);
    let frame = 0;
    // waits at 1, out of sight, until the visitor scrolls down to it
    el.textContent = write.format(1);
    if (sign) sign.style.opacity = "0";

    const watcher = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        watcher.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION);
          // eases out: most of the way in the first half, then slower and slower
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = write.format(Math.max(1, Math.round(1 + (value - 1) * eased)));
          if (t < 1) frame = requestAnimationFrame(tick);
          else if (sign) sign.style.opacity = "1";
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    watcher.observe(el);

    return () => {
      watcher.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = write.format(value);
      if (sign) sign.style.opacity = "1";
    };
  }, [value, locale]);

  return (
    <>
      {/* what a screen reader says: the finished number, once */}
      <span className="sr-only">
        {final}
        {plus ? "+" : ""}
      </span>
      <span aria-hidden className={`tabular-nums ${className}`}>
        <span ref={numberRef}>{final}</span>
        {plus && (
          <span ref={plusRef} className="transition-opacity duration-300">
            +
          </span>
        )}
      </span>
    </>
  );
}
