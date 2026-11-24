/**
 * The drawing kit of the demo scripts (seed-demo.js, seed-demo-blog.js, seed-demo-course.js, seed-demo-about.js):
 * simple line art on a dark tinted ground, marked "DEMO". Not real work.
 */

export const CREAM = "#ebd5cd";
export const ROSE = "#c0628f";
export const GOLD = "#f7d54a";

/** Repeatable "random" numbers in 0..1, so a record always gets the same picture. */
export function random(seed) {
  let s = (seed * 2654435761) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** hsl → "#rrggbb" (SVG renderers do not all read hsl()). */
export function hsl(h, s, l) {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const channel = (n) => {
    const k = (n + h / 30) % 12;
    const value = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * value).toString(16).padStart(2, "0");
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

/** A picture: dark ground tinted by `hue`, the drawing in the middle, "DEMO" in a corner. */
export function picture(width, height, hue, drawing) {
  const scale = Math.min(width, height) / 760;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="ground" cx="50%" cy="40%" r="80%">
      <stop offset="0" stop-color="${hsl(hue, 34, 22)}"/>
      <stop offset="0.6" stop-color="${hsl(hue, 30, 11)}"/>
      <stop offset="1" stop-color="#0b0809"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#ground)"/>
  <g transform="translate(${width / 2} ${height / 2}) scale(${scale})" fill="none" stroke="${CREAM}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    ${drawing}
  </g>
  <text x="${width - 30}" y="${height - 28}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(22 * scale)}" letter-spacing="6" fill="${CREAM}" fill-opacity="0.45">DEMO</text>
</svg>`);
}

/** A four-point star, filled. */
export const star = (x, y, r, fill = GOLD) =>
  `<path d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z" fill="${fill}" stroke="none"/>`;

/** The outline of an ear, for piercing pictures. */
export const EAR = `<path d="M50 -250C-130 -270 -190 -70 -125 70C-92 142 -104 214 -24 250C44 272 76 206 66 152C60 110 122 44 134 -64C143 -170 112 -238 50 -250Z"/>
  <path d="M26 -172C-74 -184 -108 -46 -66 34C-44 76 -12 66 0 110" stroke-width="3"/>`;
