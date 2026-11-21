"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "./ui/Icons";

/**
 * One row of tiles that scrolls sideways, for when there are more than fit:
 * the featured tattoos, the reviews from Google Maps. It moves three ways: the round arrows at its sides (a screenful
 * at a time), dragging with the mouse, and the usual swipe or trackpad
 * scroll. However it is moved, it comes to rest with a tile at the left edge.
 *
 * `children` are the slides, each already sized by whoever fills the row.
 */

const arrow =
  "absolute top-[calc(50%-17px)] z-[1] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream/30 bg-ink/85 text-cream backdrop-blur-sm transition-[opacity,color,border-color] duration-200 hover:border-gold hover:text-gold disabled:pointer-events-none disabled:opacity-0 sm:flex";

/** a press that travels less than this is a click on the tile, not a drag */
const DRAG_START = 6;

export function FeaturedSlider({
  children,
  previous,
  next,
  arrows = "inside",
}: {
  children: ReactNode;
  /**
   * Where the round arrows sit: over the tiles' edges ("inside", fine on
   * photos), or half out in the page's margin ("edge"), clear of a card's text.
   */
  arrows?: "inside" | "edge";
  /** what a screen reader calls the two arrows */
  previous: string;
  next: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  /** which ends the row is resting against: an arrow hides when there is nothing that way */
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  /** the click that ends a drag must not open the tile under the mouse */
  const swallowClick = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      setAtStart(track.scrollLeft <= 1);
      setAtEnd(track.scrollLeft >= track.scrollWidth - track.clientWidth - 1);
    };
    // also runs once when it starts watching, which sets the first state
    const watcher = new ResizeObserver(update);
    watcher.observe(track);
    track.addEventListener("scroll", update, { passive: true });
    return () => {
      watcher.disconnect();
      track.removeEventListener("scroll", update);
      clearTimeout(settleTimer.current);
    };
  }, []);

  /** distance from one tile's left edge to the next one's */
  function step(track: HTMLDivElement) {
    const [first, second] = track.children as unknown as HTMLElement[];
    return second ? second.offsetLeft - first.offsetLeft : track.clientWidth;
  }

  function page(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const one = step(track);
    const tiles = Math.max(1, Math.floor((track.clientWidth + 1) / one));
    track.scrollBy({ left: direction * tiles * one, behavior: "smooth" });
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    // touch and pen scroll the row natively
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    dragRef.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false };
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const track = e.currentTarget;
    const dx = e.clientX - drag.x;
    if (!drag.moved) {
      if (Math.abs(dx) < DRAG_START) return;
      drag.moved = true;
      clearTimeout(settleTimer.current);
      track.setPointerCapture(e.pointerId);
      // snapping would fight the hand; it returns once the row has settled
      track.style.scrollSnapType = "none";
      setDragging(true);
    }
    track.scrollLeft = drag.left - dx;
  }

  function onPointerEnd(e: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag?.moved) return;
    const track = e.currentTarget;
    setDragging(false);

    swallowClick.current = true;
    setTimeout(() => (swallowClick.current = false), 0);

    // come to rest on a tile: the next one in the direction of the drag if it
    // went far enough, otherwise the nearest
    const one = step(track);
    const at = track.scrollLeft / one;
    const dx = e.clientX - drag.x;
    const far = Math.abs(dx) > one * 0.15;
    const tile = far ? (dx < 0 ? Math.ceil(at) : Math.floor(at)) : Math.round(at);
    track.scrollTo({ left: tile * one, behavior: "smooth" });
    settleTimer.current = setTimeout(() => (track.style.scrollSnapType = ""), 500);
  }

  return (
    <div className="relative mt-10">
      {/* The padding (undone by the margin) gives a tile room to grow under the
          mouse without being cut off by the scrolling box. */}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClickCapture={(e) => {
          if (!swallowClick.current) return;
          swallowClick.current = false;
          e.preventDefault();
          e.stopPropagation();
        }}
        // without this the browser would start dragging the link itself
        onDragStart={(e) => e.preventDefault()}
        className={`-mx-2 -my-3 flex snap-x snap-mandatory scroll-px-2 gap-4 overflow-x-auto overscroll-x-contain px-2 py-3 select-none [scrollbar-width:none] sm:gap-6 [&::-webkit-scrollbar]:hidden ${
          dragging ? "cursor-grabbing [&_a]:pointer-events-none" : ""
        }`}
      >
        {children}
      </div>

      <button type="button" aria-label={previous} disabled={atStart} onClick={() => page(-1)} className={`${arrow} ${arrows === "edge" ? "-left-[22px]" : "left-2"}`}>
        <ArrowLeftIcon className="h-3 w-[18px]" />
      </button>
      <button type="button" aria-label={next} disabled={atEnd} onClick={() => page(1)} className={`${arrow} ${arrows === "edge" ? "-right-[22px]" : "right-2"}`}>
        <ArrowRightIcon className="h-3 w-[18px]" />
      </button>
    </div>
  );
}
