import { PhotoPlaceholder } from "./PhotoPlaceholder";
import { TattooIcon } from "./ui/Icons";

type Props = {
  /** width / height of the photo, as CSS `aspect-ratio` */
  ratio: string;
  /** what a screen reader announces for the photo (or for picking it) */
  aria: string;
  /** caption inside the photo's placeholder, already in display case */
  photoLabel: string;
  /** left of the caption: the tattoo's style, or where a piercing sits */
  title: string;
  /** right of the caption: who did it, where on the body, or the jewellery */
  note: string;
  /** when set, the photo is a button that opens the tattoo's details */
  onOpen?: () => void;
  /** when set, the photo is a link (the home page's picks open the gallery) */
  href?: string;
  /** spacing around the tile; the default suits a masonry column */
  className?: string;
  /** the photo placeholder's colouring; the piercing gallery uses "wine" */
  tone?: "dark" | "wine";
};

/** One piece in a gallery: the photo with a two-part caption under it. */
export function WorkTile({
  ratio,
  aria,
  photoLabel,
  title,
  note,
  onOpen,
  href,
  className = "mb-[26px] break-inside-avoid",
  tone = "dark",
}: Props) {
  return (
    <figure className={className}>
      <PhotoPlaceholder
        ratio={ratio}
        aria={aria}
        label={photoLabel}
        icon={<TattooIcon className={`h-10 w-10 ${tone === "wine" ? "text-[#d9a3be]" : "text-rose"}`} />}
        onClick={onOpen}
        href={href}
        tone={tone}
      />
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-2.5 gap-y-0.5 px-1 pt-2.5">
        <span className="text-[15px] font-medium leading-5 text-cream">{title}</span>
        <span className="text-[13px] leading-5 text-muted">{note}</span>
      </figcaption>
    </figure>
  );
}
