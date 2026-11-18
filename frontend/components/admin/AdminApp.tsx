"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Artist, Piercing, PiercingZone, Style, Tattoo } from "@/lib/types";
import { api, errorText, isSignedOut } from "./api";
import { ArtistsPanel } from "./ArtistsPanel";
import { LoginForm } from "./LoginForm";
import { PiercingPanel } from "./PiercingPanel";
import { StylesPanel } from "./StylesPanel";
import { TattoosPanel } from "./TattoosPanel";
import { Notice } from "./ui";

/** Everything the panel shows, as the backend has it right now. */
export type AdminData = {
  artists: Artist[];
  tattoos: Tattoo[];
  /** piercing photos */
  piercings: Piercing[];
  /** piercing zones, each with its places and prices */
  zones: PiercingZone[];
  styles: Style[];
};

/** What every screen gets: the data, a way to re-read it, and error handling. */
export type PanelProps = AdminData & {
  /** re-reads everything from the backend after a change */
  reload: () => Promise<void>;
  /** turns a failure into a message; a lapsed session also returns to sign-in */
  explain: (err: unknown) => string;
};

const tabs = [
  { key: "artists", label: "არტისტები" },
  { key: "tattoos", label: "ტატუები" },
  { key: "piercings", label: "პირსინგი" },
  { key: "styles", label: "სტილები" },
] as const;
type Tab = (typeof tabs)[number]["key"];

export function AdminApp() {
  /** whether this browser holds an admin session; "checking" until the backend answers */
  const [session, setSession] = useState<"checking" | "in" | "out">("checking");
  const [tab, setTab] = useState<Tab>("artists");
  const [data, setData] = useState<AdminData | null>(null);
  const [loadError, setLoadError] = useState("");

  const explain = useCallback((err: unknown) => {
    if (isSignedOut(err)) setSession("out");
    return errorText(err);
  }, []);

  const reload = useCallback(async () => {
    try {
      const [artists, tattoos, piercings, zones, styles] = await Promise.all([
        api<Artist[]>("/artists"),
        api<Tattoo[]>("/tattoos"),
        api<Piercing[]>("/piercings"),
        api<PiercingZone[]>("/piercing/zones"),
        api<Style[]>("/styles"),
      ]);
      setData({ artists, tattoos, piercings, zones, styles });
      setLoadError("");
    } catch (err) {
      setLoadError(errorText(err));
    }
  }, []);

  // on arrival: is this browser signed in? If so, read the data straight away.
  useEffect(() => {
    api<{ admin: boolean }>("/auth/me")
      .then(({ admin }) => {
        setSession(admin ? "in" : "out");
        if (admin) return reload();
      })
      .catch((err) => {
        setLoadError(errorText(err));
        setSession("out");
      });
  }, [reload]);

  async function signOut() {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    setData(null);
    setSession("out");
  }

  if (session === "checking") {
    return <p className="px-6 py-24 text-center text-muted">იტვირთება…</p>;
  }
  if (session === "out") {
    return (
      <LoginForm
        notice={loadError}
        onSignedIn={() => {
          setLoadError("");
          setSession("in");
          void reload();
        }}
      />
    );
  }

  const panel = data && { ...data, reload, explain };

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 pb-20 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-cream/16 py-5">
        <div>
          <p className="eyebrow uppercase">Myst Tattoo Studio</p>
          <h1 className="mt-1 text-[24px] font-medium leading-8 text-cream">ადმინ პანელი</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/ka" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
            საიტის ნახვა
          </Link>
          <button type="button" onClick={signOut} className="btn btn-outline btn-sm">
            გასვლა
          </button>
        </div>
      </header>

      <nav aria-label="სექციები" className="flex flex-wrap gap-2.5 py-5">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-current={tab === key ? "page" : undefined}
            onClick={() => setTab(key)}
            className={`h-11 rounded-full border px-5 text-[15px] transition-colors ${
              tab === key ? "border-gold text-gold" : "border-cream/28 text-cream hover:border-cream/60"
            }`}
          >
            {label}
            {data && <span className="ml-2 text-muted">{data[key].length}</span>}
          </button>
        ))}
      </nav>

      {loadError && <Notice kind="error">{loadError}</Notice>}
      {!panel && !loadError && <p className="py-16 text-center text-muted">იტვირთება…</p>}

      {panel && tab === "artists" && <ArtistsPanel {...panel} />}
      {panel && tab === "tattoos" && <TattoosPanel {...panel} />}
      {panel && tab === "piercings" && <PiercingPanel {...panel} />}
      {panel && tab === "styles" && <StylesPanel {...panel} />}
    </div>
  );
}
