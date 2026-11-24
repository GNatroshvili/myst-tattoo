"use client";

import { useId, useState } from "react";

export type FaqItem = { id: string; question: string; answer: string };

/**
 * The questions, each opening its answer when pressed. Any number may be open
 * at once, so opening one never moves the one being read. A closed answer is
 * hidden from screen readers and from the keyboard too, not only from sight.
 */
export function FaqList({ items }: { items: FaqItem[] }) {
  const base = useId();
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());

  function toggle(id: string) {
    setOpen((before) => {
      const after = new Set(before);
      if (!after.delete(id)) after.add(id);
      return after;
    });
  }

  return (
    <ul className="border-t border-cream/18">
      {items.map(({ id, question, answer }) => {
        const on = open.has(id);
        return (
          <li key={id} className="border-b border-cream/18">
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`${base}-${id}`}
                onClick={() => toggle(id)}
                className={`group flex w-full items-center justify-between gap-5 px-1 py-5 text-left text-[18px] font-medium leading-[26px] transition-colors hover:text-gold sm:text-[20px] ${
                  on ? "text-gold" : "text-cream"
                }`}
              >
                <span className="min-w-0 break-words">{question}</span>
                {/* a plus that turns into a cross while the answer is open */}
                <span
                  aria-hidden
                  className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border transition-[border-color,transform] duration-300 group-hover:border-gold ${
                    on ? "rotate-45 border-gold" : "border-cream/40"
                  }`}
                >
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" className="h-3 w-3">
                    <path d="M6 1V11M1 6H11" />
                  </svg>
                </span>
              </button>
            </h3>
            {/* 0fr → 1fr lets the row grow to the answer's own height, whatever it is */}
            <div
              id={`${base}-${id}`}
              className={`grid transition-[grid-template-rows,visibility] duration-300 ease-out ${
                on ? "grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="whitespace-pre-line break-words px-1 pb-6 text-[16px] font-light leading-[25px] text-body sm:pr-14 sm:text-[17px] sm:leading-[26px]">
                  {answer}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
