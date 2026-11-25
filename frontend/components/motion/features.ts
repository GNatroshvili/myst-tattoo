/**
 * What the motion library needs to animate anything: loaded on its own, after
 * the page is up (see MotionProvider), so it never holds the first paint back.
 * `domAnimation` covers what the site uses: animating into view, and nothing
 * for dragging or layout changes.
 */
export { domAnimation as default } from "motion/react";
