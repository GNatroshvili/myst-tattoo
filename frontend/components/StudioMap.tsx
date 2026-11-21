"use client";

import { useEffect, useRef, useState } from "react";
import { MapPinIcon } from "./ui/Icons";

/**
 * A Google map centred on the studio, with a gold pin that opens the studio's
 * page on Google Maps.
 *
 * The Maps JavaScript API is fetched only once the map is about to scroll
 * into view, so a visitor who never gets that far costs no map load. Until it
 * has drawn, and whenever it cannot (no key, a key Google refuses, no
 * network), the frame shows the address with a link to Google Maps instead.
 *
 * Looks: with a map ID (NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID) the map takes the
 * style made for that ID in the Google Cloud console. Without one it wears
 * the dark style below, drawn to match the site.
 */

/** The little of the Maps JavaScript API this file touches. */
type LatLng = { lat: number; lng: number };
type Point = { x: number; y: number };
interface OverlayView {
  setMap(map: unknown): void;
  getPanes(): { overlayMouseTarget: HTMLElement } | null;
  getProjection(): { fromLatLngToDivPixel(position: unknown): Point | null };
}
type GoogleMap = { getZoom(): number | undefined; setZoom(zoom: number): void };
type MapsApi = {
  importLibrary(name: "maps"): Promise<{
    Map: new (el: HTMLElement, options: Record<string, unknown>) => GoogleMap;
    OverlayView: new () => OverlayView;
  }>;
  importLibrary(name: "core"): Promise<{ LatLng: new (lat: number, lng: number) => object }>;
};
type MapsWindow = Window & {
  google?: { maps?: MapsApi };
  /** Google calls this when it turns the key down */
  gm_authFailure?: () => void;
  __mystMapsReady?: () => void;
};

/** Shared by every map on the page: the API can be added to a page only once. */
let api: Promise<MapsApi> | undefined;

function loadMaps(key: string, language: string): Promise<MapsApi> {
  const w = window as MapsWindow;
  if (w.google?.maps?.importLibrary) return Promise.resolve(w.google.maps);
  api ??= new Promise<MapsApi>((resolve, reject) => {
    w.__mystMapsReady = () => resolve(w.google!.maps!);
    const script = document.createElement("script");
    const query = new URLSearchParams({
      key,
      v: "weekly",
      loading: "async",
      callback: "__mystMapsReady",
      language,
      region: "GE",
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${query}`;
    script.async = true;
    script.onerror = () => {
      api = undefined;
      script.remove();
      reject(new Error("the Maps JavaScript API did not load"));
    };
    document.head.append(script);
  });
  return api;
}

/**
 * The site's own map colours: warm near-black land, burgundy roads, quiet
 * labels. Used only while there is no map ID; a map with an ID is styled in
 * the Google Cloud console and ignores this.
 */
const STYLE = [
  { elementType: "geometry", stylers: [{ color: "#140f11" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#a99c9a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#090808" }, { weight: 3 }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#3a2a31" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#ebd5cd" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#181214" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#16110f" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a1c23" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#120c0e" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#3a2330" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#5a2c44" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1b1216" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8f8482" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#cfc3bf" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1d1418" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#8f8482" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#070506" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#6f5a62" }] },
];

/** The pin: a gold drop with a dark eye, its tip on the studio's door. */
function pin(href: string, label: string) {
  const a = document.createElement("a");
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.title = label;
  a.setAttribute("aria-label", label);
  a.style.cssText =
    "position:absolute;display:block;width:38px;height:50px;transform:translate(-50%,-100%);cursor:pointer;filter:drop-shadow(0 0 10px rgba(247,213,74,.55)) drop-shadow(0 6px 10px rgba(0,0,0,.6))";
  a.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 50" width="38" height="50" aria-hidden="true">' +
    '<path d="M19 49C8 35 2 27 2 18.5a17 17 0 0 1 34 0C36 27 30 35 19 49Z" fill="#f7d54a" stroke="#15110a" stroke-width="1.5"/>' +
    '<circle cx="19" cy="18.5" r="6" fill="#15110a"/></svg>';
  return a;
}

type Props = {
  /** the key of the Maps JavaScript API; without it only the address is shown */
  apiKey?: string;
  /** a map ID with a style of its own, made in the Google Cloud console */
  mapId?: string;
  center: LatLng;
  /** language of the map's own labels and buttons */
  lang: string;
  /** the studio on Google Maps */
  href: string;
  address?: string;
  /** what a screen reader calls the map */
  label: string;
  /** the link under the address, and the pin's name */
  openLabel: string;
  /** what a screen reader calls the two round buttons */
  zoomInLabel: string;
  zoomOutLabel: string;
};

/** The site's round button (as on the sliders), for the map's own plus and minus. */
const zoomButton =
  "flex h-10 w-10 items-center justify-center rounded-full border border-cream/30 bg-ink/85 text-cream backdrop-blur-sm transition-colors duration-200 hover:border-gold hover:text-gold";

export function StudioMap({ apiKey, mapId, center, lang, href, address, label, openLabel, zoomInLabel, zoomOutLabel }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const [state, setState] = useState<"waiting" | "ready" | "failed">("waiting");
  const { lat, lng } = center;

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!apiKey || !frame || !canvas) return;

    let gone = false;
    let marker: OverlayView | undefined;
    const w = window as MapsWindow;
    const fail = () => !gone && setState("failed");

    async function draw() {
      // Google reports a refused key here, after the script itself has loaded
      w.gm_authFailure = fail;
      const maps = await loadMaps(apiKey!, lang);
      const [{ Map, OverlayView }, { LatLng }] = await Promise.all([
        maps.importLibrary("maps"),
        maps.importLibrary("core"),
      ]);
      if (gone || !canvas) return;

      const map = new Map(canvas, {
        center: { lat, lng },
        zoom: 16,
        ...(mapId ? { mapId } : { styles: STYLE }),
        backgroundColor: "#140f11",
        // Google's own white buttons are left out: the two below take their place
        disableDefaultUI: true,
        // the page scrolls past the map: it zooms with Ctrl + wheel, or two fingers
        gestureHandling: "cooperative",
        clickableIcons: false,
      });

      const position = new LatLng(lat, lng);
      const el = pin(href, openLabel);
      class Pin extends OverlayView {
        onAdd() {
          this.getPanes()?.overlayMouseTarget.append(el);
        }
        draw() {
          const at = this.getProjection().fromLatLngToDivPixel(position);
          if (!at) return;
          el.style.left = `${at.x}px`;
          el.style.top = `${at.y}px`;
        }
        onRemove() {
          el.remove();
        }
      }
      marker = new Pin();
      marker.setMap(map);
      mapRef.current = map;
      setState("ready");
    }

    // start a little before the map scrolls into view
    const watcher = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        watcher.disconnect();
        draw().catch(fail);
      },
      { rootMargin: "400px 0px" },
    );
    watcher.observe(frame);

    return () => {
      gone = true;
      watcher.disconnect();
      marker?.setMap(null);
      mapRef.current = null;
      if (w.gm_authFailure === fail) w.gm_authFailure = undefined;
      canvas.replaceChildren();
    };
  }, [apiKey, mapId, lat, lng, lang, href, openLabel]);

  return (
    <div
      ref={frameRef}
      className="relative isolate h-[320px] overflow-hidden rounded-[14px] border border-cream/14 bg-surface sm:h-[380px] lg:h-full lg:min-h-[420px]"
    >
      {/* under the map until it has drawn, and in its place when it cannot */}
      <div
        // once the map covers it, its link must not be reachable from the keyboard
        inert={state === "ready"}
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(70%_90%_at_50%_55%,rgba(125,46,85,0.38),rgba(125,46,85,0)_72%)] px-6 text-center"
      >
        <MapPinIcon className={`h-11 w-11 text-gold ${apiKey && state === "waiting" ? "animate-pulse" : ""}`} />
        {address && <p className="max-w-[300px] text-[16px] font-light leading-6 text-cream">{address}</p>}
        <a href={href} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
          {openLabel}
        </a>
      </div>

      <div
        ref={canvasRef}
        role="region"
        aria-label={label}
        aria-hidden={state !== "ready"}
        // a refused key leaves Google's own error box in the frame: it is hidden with the map
        className={`absolute inset-0 transition-opacity duration-500 ${state === "ready" ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      {state === "ready" && (
        // clear of the strip along the bottom, where Google keeps its name and terms
        <div className="absolute bottom-8 right-3 flex flex-col gap-2">
          {(
            [
              [1, zoomInLabel, "M8 3v10M3 8h10"],
              [-1, zoomOutLabel, "M3 8h10"],
            ] as const
          ).map(([step, name, path]) => (
            <button
              key={step}
              type="button"
              aria-label={name}
              title={name}
              onClick={() => {
                const map = mapRef.current;
                if (map) map.setZoom((map.getZoom() ?? 16) + step);
              }}
              className={zoomButton}
            >
              <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
                <path d={path} />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
