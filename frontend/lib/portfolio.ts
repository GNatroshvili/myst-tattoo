/**
 * Artists and their work, as drawn in the design: four artists and sixteen
 * pieces, all still placeholders. The names, bios and photos a visitor reads
 * come from the dictionaries' `artists` and `tattoos` sections until the real
 * ones are added here.
 */

/** Tattoo styles; each key picks its label from the dictionary's `tattoos.styles`. */
export const tattooStyles = ["fineLine", "blackwork", "ornamental", "botanical", "lettering"] as const;
export type TattooStyle = (typeof tattooStyles)[number];

export type Artist = {
  id: string;
  instagramUrl: string;
};

export const artists: Artist[] = [
  { id: "artist-1", instagramUrl: "https://instagram.com/" },
  { id: "artist-2", instagramUrl: "https://instagram.com/" },
  { id: "artist-3", instagramUrl: "https://instagram.com/" },
  { id: "artist-4", instagramUrl: "https://instagram.com/" },
];

export type Work = {
  /** position of the artist in `artists` */
  artist: number;
  style: TattooStyle;
  /** width / height of the photo, as CSS `aspect-ratio` */
  ratio: string;
};

export const works: Work[] = [
  { artist: 0, style: "fineLine", ratio: "3 / 4" },
  { artist: 1, style: "blackwork", ratio: "1 / 1" },
  { artist: 2, style: "ornamental", ratio: "4 / 5" },
  { artist: 3, style: "botanical", ratio: "3 / 4" },
  { artist: 1, style: "lettering", ratio: "4 / 5" },
  { artist: 0, style: "botanical", ratio: "1 / 1" },
  { artist: 3, style: "fineLine", ratio: "3 / 4" },
  { artist: 2, style: "blackwork", ratio: "4 / 5" },
  { artist: 2, style: "fineLine", ratio: "1 / 1" },
  { artist: 3, style: "ornamental", ratio: "3 / 4" },
  { artist: 0, style: "blackwork", ratio: "4 / 5" },
  { artist: 1, style: "botanical", ratio: "3 / 4" },
  { artist: 3, style: "lettering", ratio: "4 / 5" },
  { artist: 2, style: "botanical", ratio: "3 / 4" },
  { artist: 1, style: "fineLine", ratio: "1 / 1" },
  { artist: 0, style: "ornamental", ratio: "4 / 5" },
];
