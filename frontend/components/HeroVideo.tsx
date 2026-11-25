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
 */
const WIDE = "/videos/hero-desktop.mp4";
const UPRIGHT = "/videos/hero-mobile.mp4";
/** below this width the hero is a phone's: the upright cut and its still */
const PHONE = "(max-width: 767px)";

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
    video.src = window.matchMedia(PHONE).matches ? UPRIGHT : WIDE;

    let inView = false;
    let covered = false;
    const run = () => {
      // refused where films may not start by themselves: the still stays
      if (inView && !covered) video.play().catch(() => {});
      else video.pause();
    };

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
      watcher.disconnect();
      window.removeEventListener(MENU_EVENT, onMenu);
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
