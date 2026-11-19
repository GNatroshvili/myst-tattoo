"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { CheckIcon, ChevronDownIcon } from "./ui/Icons";

type Props = {
  /** id of the control, which a `<label htmlFor>` points at */
  id: string;
  /** id of the element that names the control (its label) */
  labelId: string;
  /** name the chosen value is submitted under */
  name: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
};

/**
 * A drop-down drawn by the site instead of the browser, so the open list looks
 * like the rest of the form on every device: a dark panel under the field, the
 * highlighted row raised, the chosen one in gold with a tick.
 *
 * It behaves like a native one. The mouse or a tap opens it and picks a row;
 * on the keyboard, the arrows, Home and End move, Enter or Space picks, Escape
 * closes; clicking elsewhere or tabbing away closes it too.
 */
export function ListSelect({ id, labelId, name, value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  /** position of the highlighted row while the list is open */
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const listId = `${id}-list`;
  const optionId = (index: number) => `${id}-option-${index}`;

  // a press anywhere outside closes the list
  useEffect(() => {
    if (!open) return;
    const onPress = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPress);
    return () => document.removeEventListener("pointerdown", onPress);
  }, [open]);

  // keep the highlighted row in view when the list is long enough to scroll
  useEffect(() => {
    if (open) document.getElementById(`${id}-option-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, id]);

  function show() {
    setActive(Math.max(0, options.indexOf(value)));
    setOpen(true);
  }

  function pick(index: number) {
    onChange(options[index]);
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent) {
    const last = options.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        show();
      }
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        setActive((at) => Math.min(at + 1, last));
        break;
      case "ArrowUp":
        setActive((at) => Math.max(at - 1, 0));
        break;
      case "Home":
        setActive(0);
        break;
      case "End":
        setActive(last);
        break;
      case "Enter":
      case " ":
        pick(active);
        break;
      case "Escape":
        setOpen(false);
        break;
      default:
        return; // Tab and the rest behave as usual (leaving closes the list)
    }
    event.preventDefault();
  }

  return (
    <div ref={root} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${labelId} ${id}`}
        aria-activedescendant={open ? optionId(active) : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        onBlur={() => setOpen(false)}
        className={`field flex h-[46px] items-center justify-between gap-3 pl-3.5 pr-4 text-left ${
          open ? "border-cream/45" : ""
        }`}
      >
        <span className="truncate">{value}</span>
        <ChevronDownIcon
          className={`h-2 w-[11px] shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-[264px] overflow-auto rounded-[10px] border border-cream/22 bg-surface p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.6)]"
        >
          {options.map((option, index) => {
            const chosen = option === value;
            return (
              <li
                key={option}
                id={optionId(index)}
                role="option"
                aria-selected={chosen}
                // the press must not take focus from the field, or the list would close before the click
                onPointerDown={(event) => event.preventDefault()}
                onPointerEnter={() => setActive(index)}
                onClick={() => pick(index)}
                className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 text-[15px] leading-5 transition-colors ${
                  index === active ? "bg-raised" : ""
                } ${chosen ? "text-gold" : "text-cream"}`}
              >
                {option}
                {chosen && <CheckIcon className="h-3.5 w-3.5 shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
