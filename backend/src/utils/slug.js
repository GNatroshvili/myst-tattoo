/** Georgian letters written with Latin ones, for readable addresses. */
const georgian = {
  ა: "a", ბ: "b", გ: "g", დ: "d", ე: "e", ვ: "v", ზ: "z", თ: "t", ი: "i", კ: "k", ლ: "l",
  მ: "m", ნ: "n", ო: "o", პ: "p", ჟ: "zh", რ: "r", ს: "s", ტ: "t", უ: "u", ფ: "p", ქ: "k",
  ღ: "gh", ყ: "q", შ: "sh", ჩ: "ch", ც: "ts", ძ: "dz", წ: "ts", ჭ: "ch", ხ: "kh", ჯ: "j", ჰ: "h",
};

/** "Nino Ink" → "nino-ink", "ნინო" → "nino". Empty when nothing usable is left. */
export function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[ა-ჰ]/g, (letter) => georgian[letter] ?? "")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * A slug nobody else has: "nino", then "nino-2", "nino-3"…
 * `taken(slug)` says whether a slug is already in use.
 */
export async function uniqueSlug(value, taken) {
  const base = slugify(value) || "artist";
  let slug = base;
  for (let n = 2; await taken(slug); n++) slug = `${base}-${n}`;
  return slug;
}
