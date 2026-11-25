"use client";

import type { ReactNode } from "react";
import { LazyMotion, MotionConfig } from "motion/react";

const loadFeatures = () => import("./features").then((res) => res.default);

/**
 * Around every public page: lets the `m` components in it (see Reveal) animate.
 * Only their small shell is in the page's own script; the animation code
 * itself arrives afterwards, in a file of its own.
 *
 * Where the system asks for less motion, things still fade in but no longer
 * travel: `reducedMotion="user"` switches the movement off and keeps the fade.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
