/**
 * Makes the site's icons from the header logo: `npm run icons`.
 *
 * The logo (public/images/logo.png) is a pale mark on a clear ground, so each
 * icon sets it on the site's near-black, in a rounded square. Run it again
 * whenever the logo changes; the files it writes are committed:
 *
 *   app/favicon.ico      16, 32 and 48px, for browser tabs and old clients
 *   app/icon1.png        32px
 *   app/icon2.png        192px, for shortcuts and search results
 *   app/apple-icon.png   180px, for iPhone and iPad home screens
 *
 * Next.js picks these up by name and writes the <link> tags itself.
 * `sharp` comes with Next.js, which uses it for its own image work.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOGO = path.join(root, "public/images/logo.png");
const GROUND = "#090808"; // the page's own colour (--color-ink)
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

/** the mark without the empty space around it */
const whole = await sharp(LOGO).trim().png().toBuffer();
const { width: W, height: H } = await sharp(whole).metadata();

/**
 * The heart of the mark: the star, the letters and the loop above them,
 * without the long strokes that trail down and to the left. At the size of a
 * browser tab the whole mark is too fine to make out; this part still reads.
 */
const heart = await sharp(whole)
  .extract({ left: Math.round(W * 0.24), top: 0, width: Math.round(W * 0.76), height: Math.round(H * 0.66) })
  .png()
  .toBuffer();

/**
 * One square icon. The mark's lines are hair-thin, and shrunk they would fade
 * away, so they are thickened first: `thicken` is how far each line grows, as
 * a share of the icon's size, and `solid` how firmly the grown lines are filled
 * in. `fill` is how much of the square the mark takes.
 */
async function icon(size, { mark = whole, rounded = true, fill = 0.84, thicken = 0, solid = 8 } = {}) {
  // work several times larger than the result, then shrink once, for clean edges
  const scale = Math.max(1, Math.ceil(512 / size));
  const big = size * scale;

  // room around the mark for its lines to grow into, taken out of its own size
  const pad = Math.ceil(big * thicken * 3);
  const box = Math.round(big * fill) - 2 * pad;
  let drawn = await sharp(mark)
    .resize({ height: box, width: box, fit: "inside" })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: CLEAR })
    .png()
    .toBuffer();

  if (thicken > 0) {
    // spread the mark's opacity outward, then make everything it reached solid again
    const alpha = await sharp(drawn)
      .extractChannel("alpha")
      .blur(Math.max(0.5, big * thicken))
      .linear(solid, 0)
      // keep it one plane of opacity: left alone, sharp hands back three colour channels
      .toColourspace("b-w")
      .raw()
      .toBuffer({ resolveWithObject: true });
    drawn = await sharp({
      create: { width: alpha.info.width, height: alpha.info.height, channels: 3, background: "#ffffff" },
    })
      .joinChannel(alpha.data, { raw: { width: alpha.info.width, height: alpha.info.height, channels: 1 } })
      .png()
      .toBuffer();
  }

  const ground = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${big}" height="${big}"><rect width="${big}" height="${big}" rx="${rounded ? big * 0.22 : 0}" fill="${GROUND}"/></svg>`
  );
  // two steps on purpose: within one, sharp would shrink the ground before laying the mark on it
  const large = await sharp(ground).composite([{ input: drawn, gravity: "centre" }]).png().toBuffer();
  return sharp(large).resize(size, size).png().toBuffer();
}

/** An .ico file holding the given PNGs (each `{ size, png }`), as browsers have read them for years. */
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(1, 2); // an icon, not a cursor
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, i) => {
    const at = 6 + 16 * i;
    header.writeUInt8(size, at); // width
    header.writeUInt8(size, at + 1); // height
    header.writeUInt16LE(1, at + 4); // colour planes
    header.writeUInt16LE(32, at + 6); // bits per pixel
    header.writeUInt32LE(png.length, at + 8);
    header.writeUInt32LE(offset, at + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map((image) => image.png)]);
}

const app = path.join(root, "app");
// tab-sized icons show the heart of the mark; the large ones show all of it
const small = [
  { size: 16, png: await icon(16, { mark: heart, fill: 0.94, thicken: 0.012, solid: 10 }) },
  { size: 32, png: await icon(32, { mark: heart, fill: 0.9, thicken: 0.008, solid: 8 }) },
  { size: 48, png: await icon(48, { mark: heart, fill: 0.88, thicken: 0.006, solid: 8 }) },
];
await fs.writeFile(path.join(app, "favicon.ico"), ico(small));
await fs.writeFile(path.join(app, "icon1.png"), small[1].png);
await fs.writeFile(path.join(app, "icon2.png"), await icon(192, { thicken: 0.002, solid: 6 }));
// iOS rounds the corners itself and shows nothing through them, so the square is left whole
await fs.writeFile(path.join(app, "apple-icon.png"), await icon(180, { rounded: false, fill: 0.78, thicken: 0.002, solid: 6 }));

console.log("icons written to app/: favicon.ico, icon1.png, icon2.png, apple-icon.png");
