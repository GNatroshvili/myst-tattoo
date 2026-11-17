import { PhotoPlaceholder } from "./PhotoPlaceholder";
import { TattooIcon } from "./ui/Icons";

type Props = {
  /** width / height of the photo, as CSS `aspect-ratio` */
  ratio: string;
  /** what a screen reader announces for the photo (or for opening it) */
  aria: string;
  /** caption inside the photo's placeholder, already in display case */
  photoLabel: string;
  /** left of the caption: the tattoo's style */
  title: string;
  /** right of the caption: who tattooed it, or where on the body */
  note: string;
  /** when set, the photo is a button that opens the tattoo's details */
  onOpen?: () => void;
};

/** One piece in a masonry gallery: the photo with a two-part caption under it. */
export function WorkTile({ ratio, aria, photoLabel, title, note, onOpen }: Props) {
  return (
    <figure className="mb-6 break-inside-avoid">
      <PhotoPlaceholder
        ratio={ratio}
        aria={aria}
        label={photoLabel}
        icon={<TattooIcon className="h-10 w-10 text-orchid" />}
        onClick={onOpen}
      />
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-2.5 gap-y-0.5 px-1 pt-2.5">
        <span className="text-[14px] font-semibold leading-5 text-[#f3e9f6]">{title}</span>
        <span className="text-[12.5px] leading-5 text-mist-600">{note}</span>
      </figcaption>
    </figure>
  );
}
