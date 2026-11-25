"use client";

import { useCallback } from "react";
import { useCountUp } from "./useCountUp";

/** "5000" → "5,000" with `separator` between the thousands; unchanged with none. */
function grouped(n: number, separator: string) {
  const digits = String(n);
  return separator ? digits.replace(/\B(?=(\d{3})+$)/g, separator) : digits;
}

/**
 * A figure as the admin panel has it, taken apart: the plus at its end, if it
 * has one, and what stands before it. Where that is a whole number, written
 * plainly ("5000") or with its thousands apart ("5,000", "5 000", "5.000"),
 * `number` is its value and `separator` what stands between the thousands.
 * Anything else ("4.9", "24/7") has no `number` and is shown as written.
 */
export function readFigure(text: string) {
  const whole = text.trim();
  const plus = whole.endsWith("+");
  const body = plus ? whole.slice(0, -1).trim() : whole;
  const separator = /[,.\s]/.exec(body)?.[0] ?? "";
  const number = Number(body.replace(/[,.\s]/g, ""));
  // only a number that reads back exactly as it was written is counted up
  const counts = /^\d/.test(body) && Number.isSafeInteger(number) && grouped(number, separator) === body;
  return { body, plus, separator, number: counts ? number : null };
}

/**
 * One of the home page's figures: "700+". A whole number counts up when it
 * scrolls into view, written throughout the way the admin panel wrote it; the
 * plus after it is gold and appears as the count lands.
 */
export function StatNumber({ text }: { text: string }) {
  const { body, plus, separator, number } = readFigure(text);
  const write = useCallback((n: number) => grouped(n, separator), [separator]);
  // a figure that is not a number has nothing to count: 0 leaves it as it is
  const { numberRef, plusRef } = useCountUp(number ?? 0, write);

  return (
    <>
      {/* what a screen reader says: the finished figure, once */}
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-flex items-start justify-center tabular-nums">
        <span ref={numberRef}>{body}</span>
        {plus && (
          <span
            ref={plusRef}
            className="ml-[0.06em] mt-[0.04em] text-[0.52em] font-normal leading-none text-gold transition-opacity duration-300"
          >
            +
          </span>
        )}
      </span>
    </>
  );
}
