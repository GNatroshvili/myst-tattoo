import { notFound } from "next/navigation";

/**
 * Any address under /en or /ka that has no page of its own lands here, so the
 * 404 is drawn inside the language layout (and in that language).
 */
export default function UnknownPage() {
  notFound();
}
