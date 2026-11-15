"use client";

import { useEffect, useRef } from "react";
import { CardLogo } from "./Logo";

/**
 * The gift voucher card. Touching it with the pointer sets off a lightning
 * strike: jagged lilac bolts leap out from behind the card across the panel,
 * flicker, strike again and fade, while the card itself lights up.
 *
 * The bolts are generated afresh for every strike (midpoint displacement with
 * forks) and drawn on a canvas that covers the whole voucher panel.
 */

type Pt = { x: number; y: number };
/** `delay` is the share of the strike's growth that passes before this bolt starts. */
type Bolt = { pts: Pt[]; width: number; delay: number };
type Strike = { at: number; grow: number; decay: number; bolts: Bolt[] };

const DURATION = 950; // ms, whole effect
const CARD_POSE = (-10 * Math.PI) / 180; // between the resting and the hovered tilt

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Splits a→b into a jagged run of points by displacing midpoints sideways. */
function jagged(a: Pt, b: Pt, sway: number, out: Pt[]) {
  if (sway < 1.6) {
    out.push(b);
    return;
  }
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const off = rand(-1, 1) * sway;
  const mid = { x: (a.x + b.x) / 2 - (dy / len) * off, y: (a.y + b.y) / 2 + (dx / len) * off };
  jagged(a, mid, sway / 2, out);
  jagged(mid, b, sway / 2, out);
}

/** One bolt plus its forks, appended to `out`. */
function grow(
  from: Pt,
  angle: number,
  length: number,
  width: number,
  depth: number,
  delay: number,
  out: Bolt[]
) {
  const to = { x: from.x + Math.cos(angle) * length, y: from.y + Math.sin(angle) * length };
  const pts: Pt[] = [from];
  jagged(from, to, length * 0.13, pts);
  out.push({ pts, width, delay });

  if (depth >= 2 || pts.length < 6) return;
  const forks = depth === 0 ? Math.round(rand(2, 3)) : Math.random() < 0.35 ? 1 : 0;
  for (let i = 0; i < forks; i++) {
    const at = Math.floor(rand(0.22, 0.8) * (pts.length - 1));
    const along = at / (pts.length - 1);
    const turn = (Math.random() < 0.5 ? -1 : 1) * rand(0.3, 0.75);
    const forkLength = length * (1 - along) * rand(0.45, 0.9) + 12;
    grow(pts[at], angle + turn, forkLength, width * 0.62, depth + 1, delay + (1 - delay) * along, out);
  }
}

/** Bolts leaving the card in `count` random directions, sized to the room they have. */
function cast(count: number, center: Pt, cardW: number, cardH: number, w: number, h: number): Bolt[] {
  const candidates: { from: Pt; angle: number; length: number }[] = [];
  const steps = 14;
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2 + rand(-0.2, 0.2);
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    // where this ray leaves the (tilted) card, then a little back inside so the
    // card hides the root of the bolt
    const lx = dx * Math.cos(-CARD_POSE) - dy * Math.sin(-CARD_POSE);
    const ly = dx * Math.sin(-CARD_POSE) + dy * Math.cos(-CARD_POSE);
    const edge = Math.min(cardW / 2 / Math.abs(lx || 1e-6), cardH / 2 / Math.abs(ly || 1e-6));
    const from = { x: center.x + dx * (edge - 14), y: center.y + dy * (edge - 14) };
    // room to the panel's edge along the ray
    const tx = dx > 0 ? (w - from.x) / dx : dx < 0 ? -from.x / dx : Infinity;
    const ty = dy > 0 ? (h - from.y) / dy : dy < 0 ? -from.y / dy : Infinity;
    const length = Math.min(Math.min(tx, ty) * rand(0.62, 1.02), 460);
    if (length - 14 >= 44) candidates.push({ from, angle, length });
  }
  candidates.sort(() => Math.random() - 0.5);
  const bolts: Bolt[] = [];
  for (const c of candidates.slice(0, count)) grow(c.from, c.angle, c.length, rand(1.3, 1.9), 0, 0, bolts);
  return bolts;
}

function trace(ctx: CanvasRenderingContext2D, pts: Pt[], upTo: number) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < upTo; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
}

export function VoucherCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef(0);
  const startedRef = useRef(-Infinity);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  function strike() {
    const canvas = canvasRef.current;
    const tilt = tiltRef.current;
    const flash = flashRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !tilt || !flash || !ctx) return;

    const now = performance.now();
    if (now - startedRef.current < 350) return; // already striking
    startedRef.current = now;
    cancelAnimationFrame(frameRef.current);

    // size the canvas to the panel at device resolution
    const panel = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = panel.width;
    const h = panel.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    const box = tilt.getBoundingClientRect();
    const center = { x: box.left + box.width / 2 - panel.left, y: box.top + box.height / 2 - panel.top };
    const cardW = tilt.offsetWidth;
    const cardH = tilt.offsetHeight;
    const make = (count: number) => cast(count, center, cardW, cardH, w, h);

    // first strike, a brighter second one, and sometimes a faint third
    const strikes: Strike[] = [
      { at: 0, grow: 90, decay: 150, bolts: make(5) },
      { at: 230, grow: 60, decay: 210, bolts: make(4) },
    ];
    if (Math.random() < 0.6) strikes.push({ at: 470, grow: 50, decay: 170, bolts: make(2) });

    const draw = (time: number) => {
      const t = time - now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      // how lit the scene is: follows the strikes smoothly, without the flicker
      let light = 0;
      for (const s of strikes) {
        const st = t - s.at;
        if (st < 0) continue;
        light = Math.max(light, st < s.grow ? st / s.grow : Math.exp(-(st - s.grow) / s.decay));
      }

      // soft lilac bloom around the card
      const bloom = ctx.createRadialGradient(center.x, center.y, 20, center.x, center.y, 380);
      bloom.addColorStop(0, `rgba(204, 138, 255, ${0.3 * light})`);
      bloom.addColorStop(0.45, `rgba(150, 70, 230, ${0.12 * light})`);
      bloom.addColorStop(1, "rgba(150, 70, 230, 0)");
      ctx.shadowBlur = 0;
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, w, h);

      for (const s of strikes) {
        const st = t - s.at;
        if (st < 0) continue;
        const grown = Math.min(1, st / s.grow);
        const fade = st < s.grow ? 1 : Math.exp(-(st - s.grow) / s.decay);
        const alpha = fade * rand(0.62, 1); // the thin lines flicker frame to frame
        if (alpha < 0.02) continue;

        for (const b of s.bolts) {
          const g = (grown - b.delay) / (1 - b.delay + 1e-6);
          if (g <= 0) continue;
          const upTo = Math.max(2, Math.ceil(Math.min(1, g) * b.pts.length));

          // wide violet halo, lilac body, near-white core
          ctx.globalAlpha = alpha * 0.55;
          ctx.shadowColor = "#a855f7";
          ctx.shadowBlur = 24 * dpr;
          ctx.strokeStyle = "#a855f7";
          ctx.lineWidth = b.width * 3;
          trace(ctx, b.pts, upTo);

          ctx.globalAlpha = alpha * 0.9;
          ctx.shadowColor = "#d8b4fe";
          ctx.shadowBlur = 10 * dpr;
          ctx.strokeStyle = "#d8b4fe";
          ctx.lineWidth = b.width * 1.4;
          trace(ctx, b.pts, upTo);

          ctx.globalAlpha = alpha;
          ctx.shadowBlur = 0;
          ctx.strokeStyle = "#fdf6ff";
          ctx.lineWidth = b.width * 0.6;
          trace(ctx, b.pts, upTo);
        }
      }
      ctx.globalAlpha = 1;
      flash.style.opacity = String(Math.min(1, light));

      if (t < DURATION) {
        frameRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, w, h);
        flash.style.opacity = "0";
      }
    };
    frameRef.current = requestAnimationFrame(draw);
  }

  return (
    <>
      {/* covers the whole panel; sits under the text, the card and the button */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      {/* The outer box keeps the resting tilt and is the hover target, so the hit
          area stays put while the card inside straightens and lifts. */}
      <div
        ref={tiltRef}
        aria-hidden
        onPointerEnter={strike}
        className="voucher-tilt relative z-[1] my-5 shrink-0 -rotate-[14deg] md:col-start-2 md:row-span-2 md:row-start-1 md:mb-[-30px] md:mt-[-6px] lg:row-span-1"
      >
        <div className="voucher-card relative flex h-[158px] w-[262px] flex-col items-center justify-center overflow-hidden text-petal-300">
          <CardLogo />
          <span ref={flashRef} className="voucher-flash" />
        </div>
      </div>
    </>
  );
}
