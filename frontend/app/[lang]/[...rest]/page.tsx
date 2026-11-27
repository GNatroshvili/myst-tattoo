import { notFound } from "next/navigation";

/**
 * Any address under /en or /ka that has no page of its own lands here, so the
 * 404 is drawn inside the language layout (and in that language).
 */

// This page only ever answers "not found", so there is nothing here for the
// instant-navigation check to render; left on, it reports the 404 as an error.
export const instant = false;

export default function UnknownPage() {
  notFound();
}
