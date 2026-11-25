"use client";

import { useEffect, useRef } from "react";

/** How long the count takes, in milliseconds, whatever the number: quick at first, the last few tick by one at a time. */
const DURATION = 3000;

/**
 * Counts a number up on the page. The finished number is in the page from the
 * start (for search engines and screen readers); when it scrolls into view it
 * counts up from 1 in order, and the plus after it, if there is one, appears
 * as it lands. Plays once, and for everyone: the studio wants its motion shown
 * even where the system asks for less.
 *
 * `write` words a number the way the page shows it ("5,000"); it must be the
 * same function from one render to the next (useMemo / useCallback), or the
 * count starts over. Put `numberRef` on the element that holds the number and
 * `plusRef` on the plus. A `value` under 2 has nothing to count and stays put.
 */
export function useCountUp(value: number, write: (n: number) => string) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const plusRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = numberRef.current;
    const sign = plusRef.current;
    if (!el || value < 2) return;

    let frame = 0;
    // waits at 1, out of sight, until the visitor scrolls down to it
    el.textContent = write(1);
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
          el.textContent = write(Math.max(1, Math.round(1 + (value - 1) * eased)));
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
      el.textContent = write(value);
      if (sign) sign.style.opacity = "1";
    };
  }, [value, write]);

  return { numberRef, plusRef };
}
