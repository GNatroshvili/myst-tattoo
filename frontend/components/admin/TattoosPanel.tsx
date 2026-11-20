"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Tattoo } from "@/lib/types";
import type { PanelProps } from "./AdminApp";
import { api, form, json } from "./api";
import { shrinkPhoto } from "./shrink";
import { StarIcon } from "../ui/Icons";
import { Card, CardTitle, ConfirmDelete, Hint, Notice, PHOTO_TYPES, Select, Thumb } from "./ui";

/**
 * One tattoo in the grid: its photo, with its style, its artist and whether
 * the home page features it, all changeable in place.
 */
function TattooCard({
  tattoo,
  styles,
  artists,
  reload,
  explain,
}: { tattoo: Tattoo } & Pick<PanelProps, "styles" | "artists" | "reload" | "explain">) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await action();
      await reload();
    } catch (err) {
      setError(explain(err));
    }
    setBusy(false);
  }
  const change = (fields: { style?: string; artist?: string; featured?: boolean }) =>
    run(() => api(`/tattoos/${tattoo.id}`, json("PATCH", fields)));

  return (
    <li className="flex flex-col gap-2.5 rounded-[14px] border border-cream/14 bg-ink p-2.5">
      <a
        href={tattoo.image.full}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="ფოტოს გახსნა სრული ზომით"
        className="relative block aspect-[3/4] overflow-hidden rounded-[10px] bg-surface"
      >
        <Thumb photo={tattoo.image} />
        {tattoo.featured && (
          <span className="absolute left-2 top-2 flex h-7 items-center gap-1.5 rounded-full bg-gold px-2.5 text-[12px] font-medium leading-none text-on-gold">
            <StarIcon className="h-3 w-3" />
            რჩეული
          </span>
        )}
      </a>
      <FeaturedCheck
        checked={tattoo.featured}
        disabled={busy}
        onChange={(featured) => void change({ featured })}
      />
      <Select
        aria-label="სტილი"
        disabled={busy}
        value={tattoo.style?.id ?? ""}
        onChange={(e) => void change({ style: e.target.value })}
      >
        {!tattoo.style && <option value="">— სტილი —</option>}
        {styles.map((style) => (
          <option key={style.id} value={style.id}>
            {style.name.ka}
          </option>
        ))}
      </Select>
      <Select
        aria-label="არტისტი"
        disabled={busy}
        value={tattoo.artist?.id ?? ""}
        onChange={(e) => void change({ artist: e.target.value })}
      >
        <option value="">— არტისტის გარეშე —</option>
        {artists.map((artist) => (
          <option key={artist.id} value={artist.id}>
            {artist.nickname.ka}
          </option>
        ))}
      </Select>
      <ConfirmDelete disabled={busy} onConfirm={() => void run(() => api(`/tattoos/${tattoo.id}`, { method: "DELETE" }))} />
      {error && <Notice kind="error">{error}</Notice>}
    </li>
  );
}

/** The tick that puts a tattoo into the home page's "Featured projects". */
function FeaturedCheck({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2.5 px-1 text-[14.5px] leading-5 text-cream">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-[18px] w-[18px] shrink-0 accent-gold disabled:opacity-60"
      />
      რჩეული (მთავარ გვერდზე)
    </label>
  );
}

/**
 * Tattoos: upload photos, tag each with a style and an artist, pick the ones
 * the home page features, and manage the gallery. A tattoo is added once and
 * shows on both of the site's languages.
 */
export function TattoosPanel({ tattoos, styles, artists, reload, explain }: PanelProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [style, setStyle] = useState("");
  const [artist, setArtist] = useState("");
  const [featured, setFeatured] = useState(false);
  /** "2 / 5" while photos are going up */
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  /** which tattoos the grid shows: all, the featured, those attached to nobody, or one artist's */
  const [show, setShow] = useState("all");
  const picker = useRef<HTMLInputElement>(null);

  async function upload(event: FormEvent) {
    event.preventDefault();
    setError("");
    setDone("");
    let sent = 0;
    try {
      // one request per photo, so one bad file does not lose the rest
      for (const file of files) {
        setProgress(`${sent + 1} / ${files.length}`);
        const body = new FormData();
        body.set("photo", await shrinkPhoto(file));
        body.set("style", style);
        body.set("artist", artist);
        body.set("featured", String(featured));
        await api("/tattoos", form("POST", body));
        sent += 1;
      }
      setDone(sent === 1 ? "ტატუ დაემატა." : `დაემატა ${sent} ტატუ.`);
      setFiles([]);
      if (picker.current) picker.current.value = "";
    } catch (err) {
      const text = explain(err);
      setError(sent > 0 ? `${sent} ფოტო აიტვირთა, შემდეგ კი: ${text}` : text);
    }
    setProgress("");
    await reload();
  }

  const featuredCount = tattoos.filter((tattoo) => tattoo.featured).length;
  const shown = tattoos.filter((tattoo) => {
    if (show === "all") return true;
    if (show === "featured") return tattoo.featured;
    return show === "none" ? !tattoo.artist : tattoo.artist?.id === show;
  });

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardTitle>ტატუს დამატება</CardTitle>
        {styles.length === 0 ? (
          <Hint className="mt-2">
            ტატუს დასამატებლად ჯერ ერთი სტილი მაინც დაამატე „სტილები“ ჩანართში.
          </Hint>
        ) : (
          <form onSubmit={upload} className="mt-4 flex flex-col gap-4">
            <label>
              <span className="field-label mb-2">ფოტო *</span>
              <input
                ref={picker}
                type="file"
                accept={PHOTO_TYPES}
                multiple
                required
                onChange={(e) => setFiles([...(e.target.files ?? [])])}
                className="field px-3.5 py-2.5 file:mr-3.5 file:rounded-full file:border-0 file:bg-raised file:px-4 file:py-1.5 file:text-cream"
              />
              <Hint className="mt-2">
                JPEG, PNG, WebP ან AVIF. რამდენიმე ფოტოს ერთად არჩევაც შეიძლება —
                ყველას ქვემოთ არჩეული სტილი და არტისტი მიენიჭება. ტატუ ერთხელ ემატება და საიტის ორივე
                ენაზე ჩანს.
              </Hint>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="field-label mb-2">სტილი *</span>
                <Select required value={style} onChange={(e) => setStyle(e.target.value)}>
                  <option value="" disabled>
                    აირჩიე სტილი
                  </option>
                  {styles.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name.ka}
                    </option>
                  ))}
                </Select>
              </label>
              <label>
                <span className="field-label mb-2">არტისტი</span>
                <Select value={artist} onChange={(e) => setArtist(e.target.value)}>
                  <option value="">— არტისტის გარეშე —</option>
                  {artists.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nickname.ka}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <FeaturedCheck checked={featured} onChange={setFeatured} />

            {error && <Notice kind="error">{error}</Notice>}
            {done && <Notice kind="ok">{done}</Notice>}

            <button type="submit" disabled={Boolean(progress)} className="btn btn-gold self-start disabled:opacity-60">
              {progress ? `იტვირთება ${progress}…` : files.length > 1 ? `${files.length} ფოტოს ატვირთვა` : "ატვირთვა"}
            </button>
          </form>
        )}
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>ტატუები</CardTitle>
          {tattoos.length > 0 && (
            <Select aria-label="რომელი ტატუები ჩანს" value={show} onChange={(e) => setShow(e.target.value)} className="w-full sm:w-[240px]">
              <option value="all">ყველა ({tattoos.length})</option>
              <option value="featured">რჩეულები ({featuredCount})</option>
              <option value="none">არტისტის გარეშე</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nickname.ka}
                </option>
              ))}
            </Select>
          )}
        </div>

        {tattoos.length > 0 && (
          <Hint className="mt-2">
            „რჩეულად“ მონიშნული ტატუები მთავარი გვერდის „რჩეული პროექტები“ სექციაში ჩანს. ახლა
            მონიშნულია {featuredCount}
            {featuredCount === 0 ? " — სანამ ერთს მაინც არ მონიშნავ, ეს სექცია მთავარ გვერდზე არ გამოჩნდება." : "."}
          </Hint>
        )}

        {shown.length === 0 ? (
          <Hint className="mt-3">
            {tattoos.length === 0 ? "ტატუები ჯერ არ არის დამატებული." : "ამ ფილტრით ტატუ არ მოიძებნა."}
          </Hint>
        ) : (
          <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3.5">
            {shown.map((tattoo) => (
              <TattooCard
                key={tattoo.id}
                tattoo={tattoo}
                styles={styles}
                artists={artists}
                reload={reload}
                explain={explain}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
