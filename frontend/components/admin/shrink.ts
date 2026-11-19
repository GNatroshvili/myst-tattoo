/**
 * Makes a photo small enough to send. The host (Vercel) refuses any request
 * over 4.5 MB, and a phone photo is often larger, so big photos are scaled
 * down and re-saved as JPEG in the browser before they are uploaded.
 *
 * Nothing is lost that the site would show: the backend keeps photos at
 * 1600px at most, and this leaves them larger than that.
 */

/** Photos at or under this size are sent as they are. */
const SMALL_ENOUGH = 1.5 * 1024 * 1024;
/** What a shrunk photo must fit in, leaving room for the rest of the form. */
const LIMIT = 4 * 1024 * 1024;
/** Longest side after shrinking, in pixels; halved if the result is still too big. */
const MAX_SIDE = 2400;

function toJpeg(bitmap: ImageBitmap, maxSide: number, quality: number) {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) return Promise.resolve(null);
  // JPEG has no transparency: see-through areas become white, not black
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

/**
 * Returns the photo ready for upload: itself if it is small, otherwise a
 * smaller JPEG copy. If the browser cannot read the picture, the original is
 * returned and the backend decides what to do with it.
 */
export async function shrinkPhoto(file: File): Promise<File> {
  if (file.size <= SMALL_ENOUGH) return file;

  try {
    // "from-image" turns the picture the way the camera recorded it was held
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    try {
      for (const [side, quality] of [[MAX_SIDE, 0.9], [MAX_SIDE, 0.8], [MAX_SIDE / 2, 0.8]]) {
        const blob = await toJpeg(bitmap, side, quality);
        if (blob && blob.size <= LIMIT) {
          return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
        }
      }
    } finally {
      bitmap.close();
    }
  } catch {
    // not a picture this browser can decode
  }
  return file;
}
