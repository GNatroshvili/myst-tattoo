"use client";

import { useState, type FormEvent } from "react";
import { api, errorText, json } from "./api";
import { Notice } from "./ui";

type Props = {
  /** something to say above the form, e.g. why the panel could not load */
  notice?: string;
  onSignedIn: () => void;
};

/** The panel's front door: one password (ADMIN_PASSWORD in backend/.env). */
export function LoginForm({ notice, onSignedIn }: Props) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/auth/login", json("POST", { password }));
      onSignedIn();
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col justify-center px-5 py-16">
      <p className="eyebrow text-center uppercase">Myst Tattoo Studio</p>
      <h1 className="mt-2 text-center text-[28px] font-medium leading-9 text-cream">ადმინ პანელი</h1>

      <form
        onSubmit={submit}
        className="mt-8 flex flex-col gap-2 rounded-[18px] border border-cream/16 bg-surface px-6 pb-7 pt-6"
      >
        <label htmlFor="admin-password" className="field-label">
          პაროლი
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field h-[46px] px-3.5"
        />

        {(error || notice) && (
          <div className="mt-2">
            <Notice kind="error">{error || notice}</Notice>
          </div>
        )}

        <button type="submit" disabled={busy} className="btn btn-gold mt-4 h-12 w-full disabled:opacity-60">
          {busy ? "მოწმდება…" : "შესვლა"}
        </button>
      </form>
    </main>
  );
}
