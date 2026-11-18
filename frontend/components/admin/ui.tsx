"use client";

import { useEffect, useState, type ReactNode, type SelectHTMLAttributes } from "react";
import Image from "next/image";
import type { Photo } from "@/lib/types";
import { ChevronDownIcon } from "../ui/Icons";

/** Small building blocks shared by the admin panel's screens. */

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[18px] border border-cream/16 bg-surface p-5 sm:p-7 ${className}`}>
      {children}
    </section>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-[20px] font-medium leading-7 text-cream">{children}</h2>;
}

/** Explanation under a field or a title. */
export function Hint({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[13.5px] font-light leading-5 text-muted ${className}`}>{children}</p>;
}

/** A line saying what went wrong (red) or what was done (green). */
export function Notice({ kind, children }: { kind: "error" | "ok"; children: ReactNode }) {
  const look =
    kind === "error"
      ? "border-[#e0707a]/45 bg-[#e0707a]/10 text-[#f5b3b9]"
      : "border-[#7fc39a]/40 bg-[#7fc39a]/10 text-[#b5e3c6]";
  return (
    <p role={kind === "error" ? "alert" : "status"} className={`rounded-[10px] border px-3.5 py-2.5 text-[14.5px] leading-5 ${look}`}>
      {children}
    </p>
  );
}

/** A drop-down in the form fields' look. */
export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative ${className}`}>
      <select {...props} className="field h-[46px] pl-3.5 pr-10 disabled:opacity-60">
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-4 top-[19px] h-2 w-[11px] text-cream" />
    </div>
  );
}

export const dangerButton =
  "btn btn-sm border border-[#e0707a]/55 text-[#f5b3b9] hover:border-[#e0707a] hover:bg-[#e0707a]/10 disabled:opacity-50";

/**
 * Delete in two steps: the first click asks, the second one deletes. Asking
 * goes away by itself after a few seconds.
 */
export function ConfirmDelete({
  onConfirm,
  disabled,
  label = "წაშლა",
}: {
  onConfirm: () => void;
  disabled?: boolean;
  label?: string;
}) {
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (!asking) return;
    const timer = setTimeout(() => setAsking(false), 5000);
    return () => clearTimeout(timer);
  }, [asking]);

  if (!asking) {
    return (
      <button type="button" disabled={disabled} onClick={() => setAsking(true)} className={dangerButton}>
        {label}
      </button>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="text-[14px] text-[#f5b3b9]">წავშალო?</span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
        className={dangerButton}
      >
        დიახ
      </button>
      <button type="button" onClick={() => setAsking(false)} className="btn btn-outline btn-sm">
        არა
      </button>
    </span>
  );
}

/** A stored photo filling its (positioned) parent. */
export function Thumb({ photo, size = "thumb" }: { photo: Photo; size?: "thumb" | "full" }) {
  return <Image src={photo[size]} alt="" fill unoptimized className="object-cover" draggable={false} />;
}

/** A temporary address for showing a photo that has been picked but not uploaded. */
export function usePreview(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    const address = URL.createObjectURL(file);
    // the address exists only now, so it has to be stored from inside the effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(address);
    return () => {
      URL.revokeObjectURL(address);
      setUrl(null);
    };
  }, [file]);

  return url;
}

/** What the file picker offers, and what the backend accepts. */
export const PHOTO_TYPES = "image/jpeg,image/png,image/webp,image/avif";
