"use client";

import { useMemo } from "react";
import { useCountUp } from "./useCountUp";

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

/**
 * The number itself, worded for the page's language. It counts up when it
 * scrolls into view (see useCountUp).
 */
export function ReviewCount({ count, locale, className = "" }: { count: number; locale: string; className?: string }) {
  const { value, plus } = roundedCount(count);
  const write = useMemo(() => {
    const format = new Intl.NumberFormat(locale);
    return (n: number) => format.format(n);
  }, [locale]);
  const { numberRef, plusRef } = useCountUp(value, write);
  const final = write(value);

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
