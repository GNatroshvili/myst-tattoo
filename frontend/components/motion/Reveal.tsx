"use client";

import type { ReactNode } from "react";
import * as m from "motion/react-m";

/** quick off the mark, then a long soft landing */
const EASE = [0.22, 1, 0.36, 1] as const;

const hidden = { opacity: 0, y: 24 };
const shown = { opacity: 1, y: 0 };
/**
 * Once only, and not at the very edge of the screen: a part starts when 60px
 * of it are in view. Nothing that reveals may sit lower than that above the
 * end of a page, or it could never start; the footer under every page sees to it.
 */
const viewport = { once: true, margin: "0px 0px -60px 0px" };

const tags = { div: m.div, section: m.section, article: m.article, li: m.li };

type Props = {
  /** the element drawn; a list item or a section keeps its meaning */
  as?: keyof typeof tags;
  /** seconds to wait after coming into view: neighbours given 0, 0.08, 0.16… arrive one after another */
  delay?: number;
  className?: string;
  children: ReactNode;
  id?: string;
  role?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

/**
 * A part of a page that fades in and rises 24px into place the first time it
 * scrolls into view. Only opacity and transform move, which the browser
 * animates without laying the page out again, so nothing around it shifts.
 *
 * It must not be put on an element that has a CSS transform of its own (a
 * tile that grows under the mouse): the animation leaves `transform: none` on
 * the element, which would switch that off. Wrap such an element instead.
 *
 * In the page as the server sends it the part is already there, transparent;
 * without JavaScript a rule in the layout shows every `data-reveal` at once.
 */
export function Reveal({ as = "div", delay = 0, children, ...rest }: Props) {
  const Tag = tags[as] as typeof m.div;
  return (
    <Tag
      data-reveal=""
      initial={hidden}
      whileInView={shown}
      viewport={viewport}
      transition={{ duration: 0.7, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
