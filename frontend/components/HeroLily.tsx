"use client";

import { useEffect, useId, useRef } from "react";
import Image from "next/image";
import lily from "@/public/images/hero-lily.jpg";

/**
 * The hero artwork. Under the mouse the plant rustles in a steady breeze:
 * petals and leaves sway and tremble at one even strength for as long as the
 * mouse stays, and settle as soon as it leaves. The gold crescent and the
 * star stay still.
 *
 * The artwork is one flat image, so the motion is an SVG filter that shifts
 * its pixels along three fields of smooth noise: two slow ones, a quarter of
 * a swing apart, make the sway travel across the plant, and a finer, faster
 * one makes it tremble. The filter finds the plant by colour (its rose has
 * more blue than green; the gold has the reverse) and leaves the rest alone.
 * It is attached only while something moves, so the page pays nothing at rest.
 */

// largest shift is about a quarter of these, in CSS pixels
const SWAY = 22;
const FLUTTER = 9;

const TAU = Math.PI * 2;

/** keeps the noise's colour and makes it opaque, so later maths sees plain numbers */
const OPAQUE = "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 1";

export function HeroLily({ alt }: { alt: string }) {
  // an id safe inside url(#…)
  const id = `lily-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const imgRef = useRef<HTMLImageElement>(null);
  const swayA = useRef<SVGFEDisplacementMapElement>(null);
  const swayB = useRef<SVGFEDisplacementMapElement>(null);
  const flutter = useRef<SVGFEDisplacementMapElement>(null);

  const overRef = useRef(false);
  const levelRef = useRef(0); // 0 at rest … 1 in full rustle
  const clockRef = useRef(0); // seconds of rustling so far
  const lastRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  function step(now: number) {
    const img = imgRef.current;
    const a = swayA.current;
    const b = swayB.current;
    const c = flutter.current;
    if (!img || !a || !b || !c) return;

    const dt = Math.min(64, now - lastRef.current);
    lastRef.current = now;
    clockRef.current += dt / 1000;
    const t = clockRef.current;

    // rises quickly under the mouse and dies down within a second of it leaving
    const over = overRef.current;
    const level = levelRef.current + ((over ? 1 : 0) - levelRef.current) * (1 - Math.exp(-dt / (over ? 240 : 200)));
    levelRef.current = level;

    if (!over && level < 0.01) {
      levelRef.current = 0;
      frameRef.current = 0;
      img.style.filter = "";
      return;
    }

    // Steady for as long as the mouse stays: the strength never ebbs. The two
    // sway fields take turns (sine and cosine), so while one passes through
    // rest the other is at full swing and the plant as a whole never pauses.
    const swing = TAU * 0.78 * t;
    a.setAttribute("scale", (SWAY * level * Math.sin(swing)).toFixed(2));
    b.setAttribute("scale", (SWAY * level * Math.cos(swing)).toFixed(2));
    c.setAttribute("scale", (FLUTTER * level * Math.sin(TAU * 4.7 * t)).toFixed(2));

    img.style.filter = `url(#${id})`;
    frameRef.current = requestAnimationFrame(step);
  }

  function setOver(over: boolean) {
    overRef.current = over;
    if (over && !frameRef.current) {
      lastRef.current = performance.now();
      frameRef.current = requestAnimationFrame(step);
    }
  }

  return (
    <>
      <svg aria-hidden width="0" height="0" className="pointer-events-none absolute">
        <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          {/* where the plant is, spread a little past its edges */}
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 -10 10 0 0  0 -10 10 0 0  0 -10 10 0 0  0 0 0 0 1"
          />
          <feGaussianBlur stdDeviation="9" />
          <feComponentTransfer result="plant">
            <feFuncR type="linear" slope="8" intercept="-0.2" />
            <feFuncG type="linear" slope="8" intercept="-0.2" />
            <feFuncB type="linear" slope="8" intercept="-0.2" />
          </feComponentTransfer>

          {/* where the gold crescent and star are not: white, with them cut out in black */}
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 6 -6 0 0  0 6 -6 0 0  0 6 -6 0 0  0 0 0 0 1"
          />
          <feGaussianBlur stdDeviation="3" />
          <feComponentTransfer result="notGold">
            <feFuncR type="linear" slope="-4" intercept="1" />
            <feFuncG type="linear" slope="-4" intercept="1" />
            <feFuncB type="linear" slope="-4" intercept="1" />
          </feComponentTransfer>

          {/* what may move: the plant, except where the gold crosses it */}
          <feComposite in="plant" in2="notGold" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="moves" />

          {/* Each noise field is pulled to mid-grey (which means "do not shift")
              wherever nothing may move: noise × moves − moves / 2 + 1 / 2. */}
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.015" numOctaves="2" seed="4" />
          <feColorMatrix type="matrix" values={OPAQUE} />
          <feComposite in2="moves" operator="arithmetic" k1="1" k2="0" k3="-0.5" k4="0.5" result="fieldA" />

          <feTurbulence type="fractalNoise" baseFrequency="0.013 0.01" numOctaves="2" seed="11" />
          <feColorMatrix type="matrix" values={OPAQUE} />
          <feComposite in2="moves" operator="arithmetic" k1="1" k2="0" k3="-0.5" k4="0.5" result="fieldB" />

          <feTurbulence type="fractalNoise" baseFrequency="0.045 0.06" numOctaves="1" seed="23" />
          <feColorMatrix type="matrix" values={OPAQUE} />
          <feComposite in2="moves" operator="arithmetic" k1="1" k2="0" k3="-0.5" k4="0.5" result="fieldC" />

          <feDisplacementMap
            ref={swayA}
            in="SourceGraphic"
            in2="fieldA"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feDisplacementMap ref={swayB} in2="fieldB" scale="0" xChannelSelector="R" yChannelSelector="G" />
          <feDisplacementMap ref={flutter} in2="fieldC" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* The artwork is painted on black: `lighten` drops that black into the
          page, and the mask softens its left and right edges. */}
      <Image
        ref={imgRef}
        src={lily}
        alt={alt}
        preload
        quality={90}
        sizes="(min-width: 1280px) 596px, (min-width: 1024px) 50vw, (min-width: 640px) 560px, 100vw"
        className="block h-auto w-full max-w-[560px] select-none mix-blend-lighten [mask-image:linear-gradient(90deg,transparent_0%,#000_9%,#000_93%,transparent_100%)] lg:max-w-[640px]"
        draggable={false}
        // a mouse (or pen) only: there is no hovering on a touch screen
        onPointerEnter={(e) => {
          if (e.pointerType !== "touch") setOver(true);
        }}
        onPointerLeave={() => setOver(false)}
      />
    </>
  );
}
