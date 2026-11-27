"use client";

import { useEffect, useRef } from "react";
import { MENU_EVENT } from "@/lib/site-menu";

/**
 * The film behind the hero: a silent loop of the studio, in two cuts made
 * from one recording (see public/videos). The recording keeps its left
 * quarter black, which would leave the film short of the screen's left wall,
 * so the wide cut starts where its picture does; the hero darkens it under
 * the text instead. The upright cut, for phones, is the part of the frame
 * that holds the subject.
 *
 * The wide cut comes in three files. The recording's picture is 2764×1728, and
 * its dark, grainy walls take a lot of data to keep sharp in H.264; AV1 holds
 * the same picture in about half of it. So a browser that plays AV1 well gets
 * an AV1 file, the picture at its full size on a screen wider than 1920
 * device pixels, and every other browser gets the H.264 one.
 */
const WIDE = "/videos/hero-desktop.mp4";
const WIDE_AV1: Cut = {
  src: "/videos/hero-desktop-av1.mp4",
  contentType: 'video/mp4; codecs="av01.0.08M.10"',
  width: 1920,
  height: 1200,
  bitrate: 5_500_000,
  // decoded by the processor where the graphics chip cannot: fine from 8 threads up
  threads: 8,
};
const WIDE_AV1_FULL: Cut = {
  src: "/videos/hero-desktop-hd-av1.mp4",
  contentType: 'video/mp4; codecs="av01.0.12M.10"',
  width: 2764,
  height: 1728,
  bitrate: 9_500_000,
  // over twice the pixels to decode
  threads: 12,
};
const UPRIGHT = "/videos/hero-mobile.mp4";
/** below this width the hero is a phone's: the upright cut and its still */
const PHONE = "(max-width: 767px)";

type Cut = { src: string; contentType: string; width: number; height: number; bitrate: number; threads: number };

/**
 * Whether this browser would play a cut without a struggle: it must say it
 * can keep up, and decode it either on the graphics chip or on a processor
 * with threads to spare, since the film is only a background and may not slow
 * the page under it. A browser that cannot tell gets the H.264 file.
 */
async function plays(cut: Cut): Promise<boolean> {
  try {
    const { supported, smooth, powerEfficient } = await navigator.mediaCapabilities.decodingInfo({
      type: "file",
      video: { contentType: cut.contentType, width: cut.width, height: cut.height, bitrate: cut.bitrate, framerate: 30 },
    });
    return supported && smooth && (powerEfficient || (navigator.hardwareConcurrency ?? 0) >= cut.threads);
  } catch {
    return false;
  }
}

/** The wide cut for this screen and browser: the sharpest one it will play well. */
async function wideCut(): Promise<string> {
  // the film is as wide as the window, so past 1920 device pixels the smaller files would be stretched
  const large = window.innerWidth * window.devicePixelRatio > 1920;
  // The full-size file runs at 9.5 Mbit/s. Only some browsers report the line's
  // speed, and those never report more than 10: anything less gets a lighter file.
  const downlink = (navigator as Navigator & { connection?: { downlink?: number } }).connection?.downlink;
  const quick = downlink === undefined || downlink >= 10;

  if (large && quick && (await plays(WIDE_AV1_FULL))) return WIDE_AV1_FULL.src;
  if (await plays(WIDE_AV1)) return WIDE_AV1.src;
  return WIDE;
}

/** how each cut sits in the hero: filling it; on wide screens whatever must be cut off goes from the right, away from the text */
const fill = "absolute inset-0 h-full w-full object-cover lg:object-left";

/**
 * The page arrives with a still of the film's first frame, so the hero is
 * drawn at once and nothing waits for the film. The film itself is fetched
 * only after the page is up, starts over the still (they are the same
 * picture, so nothing jumps) and runs only while the hero is on screen: out
 * of view it is paused and costs nothing. So it is under the open phone
 * menu, where the page is blurred anyway.
 *
 * It stays a still where the system asks for less motion or for less data,
 * where scripts are off, and where the browser will not start a film by
 * itself (a phone saving its battery).
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;

    // browsers start a film by themselves only if it is silent, and check this property
    video.muted = true;

    let gone = false;
    let inView = false;
    let covered = false;
    const run = () => {
      // which file to play is still being worked out
      if (!video.getAttribute("src")) return;
      // refused where films may not start by themselves: the still stays
      if (inView && !covered) video.play().catch(() => {});
      else video.pause();
    };

    const show = (src: string) => {
      if (gone) return;
      video.src = src;
      run();
    };
    if (window.matchMedia(PHONE).matches) show(UPRIGHT);
    else wideCut().then(show);

    // an AV1 file the browser promised to play and then could not: the H.264 one plays everywhere
    const onError = () => {
      const src = video.getAttribute("src");
      if (src === WIDE_AV1.src || src === WIDE_AV1_FULL.src) show(WIDE);
    };
    video.addEventListener("error", onError);

    const watcher = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        run();
      },
      { threshold: 0.05 },
    );
    watcher.observe(video);

    const onMenu = (event: Event) => {
      covered = (event as CustomEvent<boolean>).detail;
      run();
    };
    window.addEventListener(MENU_EVENT, onMenu);

    return () => {
      gone = true;
      watcher.disconnect();
      window.removeEventListener(MENU_EVENT, onMenu);
      video.removeEventListener("error", onError);
      video.pause();
    };
  }, []);

  return (
    <>
      {/* Two stills picked by width, as the two cuts are; a plain image does
          that with no script, and both files are already sized for the web. */}
      <picture>
        <source media={PHONE} srcSet="/videos/hero-mobile.jpg" />
        <img src="/videos/hero-desktop.jpg" alt="" fetchPriority="high" decoding="async" draggable={false} className={fill} />
      </picture>
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        tabIndex={-1}
        className={fill}
      />
    </>
  );
}
