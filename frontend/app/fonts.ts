import { Italiana, Noto_Sans_Georgian, Noto_Serif_Georgian, Outfit } from "next/font/google";

/** The site's typefaces, shared by the public pages and the admin panel. */

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const italiana = Italiana({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-italiana",
  display: "swap",
});

// Georgian companions: Outfit and Italiana have no Georgian letters, so these
// take over for them. Not preloaded, so English visitors never download them.
const georgianSans = Noto_Sans_Georgian({
  subsets: ["georgian"],
  variable: "--font-georgian-sans",
  display: "swap",
  preload: false,
});

const georgianSerif = Noto_Serif_Georgian({
  subsets: ["georgian"],
  variable: "--font-georgian-serif",
  display: "swap",
  preload: false,
});

/** Class names for `<html>`: they define the font variables globals.css reads. */
export const fontVariables = `${outfit.variable} ${italiana.variable} ${georgianSans.variable} ${georgianSerif.variable}`;
