import type { Photo } from "@/lib/types";
import { PhotoFrame } from "./PhotoFrame";
import { TattooIcon } from "./ui/Icons";

type Props = {
  /** what a screen reader announces: what the photo shows, or what picking it does */
  aria: string;
  /** the photo; without one the tile is a placeholder with `photoLabel` in it */
  photo?: Photo | null;
  /** caption inside the placeholder, already in display case */
  photoLabel?: string;
  /** left of the caption: the tattoo's style, or where a piercing sits */
  title: string;
  /** right of the caption: who did it, or the jewellery */
  note?: string;
  /** when set, the photo is a button that opens the tattoo's details */
  onOpen?: () => void;
  /** when set, the photo is a link (the home page's picks open the gallery) */
  href?: string;
  /** the placeholder's colouring; the piercing gallery uses "wine" */
  tone?: "dark" | "wine";
};

/**
 * One piece in a gallery: the photo with a two-part caption under it. Every
 * tile is 3:4, whatever the photo's own shape; a photo of another shape is
 * cropped to fit (the tattoo details window shows it whole). Under the mouse
 * the whole tile grows a touch, over 0.2s.
 */
export function WorkTile({
  aria,
  photo,
  photoLabel = "",
  title,
  note,
  onOpen,
  href,
  tone = "dark",
}: Props) {
  return (
    <figure className="transition-transform duration-200 hover:scale-[1.03]">
      <PhotoFrame
        ratio="3 / 4"
        aria={aria}
        photo={photo}
        label={photoLabel}
        icon={<TattooIcon className={`h-10 w-10 ${tone === "wine" ? "text-[#d9a3be]" : "text-rose"}`} />}
        onClick={onOpen}
        href={href}
        tone={tone}
      />
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-2.5 gap-y-0.5 px-1 pt-2.5">
        <span className="text-[15px] font-medium leading-5 text-cream">{title}</span>
        {note && <span className="text-[13px] leading-5 text-muted">{note}</span>}
      </figcaption>
    </figure>
  );
}
