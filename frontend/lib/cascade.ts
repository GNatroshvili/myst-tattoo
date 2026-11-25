/**
 * The wait, in seconds, for the `index`-th of a row of neighbours that reveal
 * together (see components/motion/Reveal), so a row arrives left to right
 * rather than all at once. It starts over every four: no row is wider.
 */
export const cascade = (index: number, step = 0.07) => (index % 4) * step;
