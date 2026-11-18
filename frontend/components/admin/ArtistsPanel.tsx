"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Artist, ArtistBrief, Photo } from "@/lib/types";
import { PersonIcon } from "../ui/Icons";
import type { PanelProps } from "./AdminApp";
import { api, form } from "./api";
import { Card, CardTitle, ConfirmDelete, Hint, Notice, PHOTO_TYPES, Thumb, usePreview } from "./ui";

const chip = (on: boolean) =>
  `h-11 rounded-full border px-5 text-[15px] transition-colors ${
    on ? "border-gold bg-raised text-gold" : "border-cream/28 text-cream hover:border-cream/60"
  }`;

/** One tattoo or piercing as the picker shows it. */
type Work = { id: string; image: Photo; caption: string; artist: ArtistBrief | null };

/**
 * A grid of photos to tick: the works that belong to the artist being edited.
 * A work already attached to someone else says so, and ticking it moves it.
 */
function WorkPicker({
  labelledBy,
  works,
  picked,
  onToggle,
  artistId,
}: {
  /** id of the label above the grid */
  labelledBy: string;
  works: Work[];
  picked: Set<string>;
  onToggle: (id: string) => void;
  /** the artist being edited; undefined for a new one */
  artistId?: string;
}) {
  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3"
    >
      {works.map((work) => {
        const on = picked.has(work.id);
        const other = work.artist && work.artist.id !== artistId ? work.artist : null;
        return (
          <button
            key={work.id}
            type="button"
            aria-pressed={on}
            aria-label={`${work.caption}${other ? `, ახლა: ${other.nickname.ka}` : ""}`}
            onClick={() => onToggle(work.id)}
            className={`relative block overflow-hidden rounded-[12px] border-2 p-0 text-left transition-colors ${
              on ? "border-gold" : "border-cream/14 hover:border-cream/45"
            }`}
          >
            <span className="relative block aspect-[3/4] bg-ink">
              <Thumb photo={work.image} />
            </span>
            <span
              aria-hidden
              className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border text-[14px] font-semibold leading-none ${
                on ? "border-gold bg-gold text-on-gold" : "border-cream/60 bg-ink/70 text-transparent"
              }`}
            >
              ✓
            </span>
            <span className="block truncate px-2 py-1.5 text-[12.5px] leading-4 text-body">
              {work.caption}
              {other && <span className="block truncate text-muted">ახლა: {other.nickname.ka}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

type FormProps = Pick<PanelProps, "styles" | "tattoos" | "piercings" | "reload" | "explain"> & {
  /** the artist being edited, or null for a new one */
  artist: Artist | null;
  onDone: (message: string) => void;
  onCancel: () => void;
};

/**
 * Add or edit an artist. There is one artist for both sites: the nickname and
 * the bio are filled in in Georgian and in English, and everything else
 * (styles, Instagram, photo, tattoos, piercings) is shared. A tattoo artist
 * gets tattoos, a piercer gets piercings; both are the same kind of artist.
 */
function ArtistForm({ artist, styles, tattoos, piercings, reload, explain, onDone, onCancel }: FormProps) {
  const [nicknameKa, setNicknameKa] = useState(artist?.nickname.ka ?? "");
  const [nicknameEn, setNicknameEn] = useState(artist?.nickname.en ?? "");
  const [picked, setPicked] = useState(() => new Set(artist?.styles.map((style) => style.id)));
  const [bioKa, setBioKa] = useState(artist?.bio.ka ?? "");
  const [bioEn, setBioEn] = useState(artist?.bio.en ?? "");
  const [instagram, setInstagram] = useState(artist?.instagramUrl ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  /** ids of the tattoos attached to this artist */
  const [attached, setAttached] = useState(
    () => new Set(artist ? tattoos.filter((t) => t.artist?.id === artist.id).map((t) => t.id) : [])
  );
  /** ids of the piercings attached to this artist */
  const [pierced, setPierced] = useState(
    () => new Set(artist ? piercings.filter((p) => p.artist?.id === artist.id).map((p) => p.id) : [])
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const preview = usePreview(photo);
  const current = removePhoto ? null : (artist?.photo ?? null);
  const tattooWorks: Work[] = tattoos.map((tattoo) => ({
    id: tattoo.id,
    image: tattoo.image,
    caption: tattoo.style?.name.ka ?? "ტატუ",
    artist: tattoo.artist,
  }));
  const piercingWorks: Work[] = piercings.map((piercing) => ({
    id: piercing.id,
    image: piercing.image,
    caption: piercing.place?.name.ka ?? "პირსინგი",
    artist: piercing.artist,
  }));

  const toggle = (set: Set<string>, id: string) => {
    const next = new Set(set);
    if (!next.delete(id)) next.add(id);
    return next;
  };

  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const body = new FormData();
    body.set("nicknameKa", nicknameKa);
    body.set("nicknameEn", nicknameEn);
    body.set("styles", JSON.stringify([...picked]));
    body.set("bioKa", bioKa);
    body.set("bioEn", bioEn);
    body.set("instagramUrl", instagram);
    body.set("tattoos", JSON.stringify([...attached]));
    body.set("piercings", JSON.stringify([...pierced]));
    if (photo) body.set("photo", photo);
    else if (removePhoto) body.set("removePhoto", "true");

    try {
      await api(artist ? `/artists/${artist.id}` : "/artists", form(artist ? "PATCH" : "POST", body));
      await reload();
      onDone(artist ? "ცვლილებები შენახულია." : "არტისტი დაემატა და ჩანს საიტის ორივე ენაზე.");
    } catch (err) {
      setError(explain(err));
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardTitle>{artist ? `რედაქტირება: ${artist.nickname.ka}` : "ახალი არტისტი"}</CardTitle>
      <Hint className="mt-1.5">
        არტისტი ერთია საიტის ორივე ენისთვის: ნიქნეიმსა და ბიოს ავსებ ქართულად და ინგლისურად, დანარჩენი
        (სტილები, ფოტო, ნამუშევრები) საერთოა.
      </Hint>

      <form onSubmit={save} className="mt-5 flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="field-label mb-2">ნიქნეიმი ქართულად *</span>
            <input
              required
              maxLength={60}
              value={nicknameKa}
              onChange={(e) => setNicknameKa(e.target.value)}
              placeholder="მაგ.: ნიკა"
              className="field h-[46px] px-3.5"
            />
          </label>
          <label>
            <span className="field-label mb-2">ნიქნეიმი ინგლისურად *</span>
            <input
              required
              maxLength={60}
              value={nicknameEn}
              onChange={(e) => setNicknameEn(e.target.value)}
              placeholder="e.g. Nika"
              className="field h-[46px] px-3.5"
            />
          </label>
          <Hint className="sm:col-span-2">
            ქართული ვერსია ჩანს საიტის ქართულ გვერდებზე (/ka), ინგლისური — ინგლისურზე (/en). თუ ნიქნეიმი
            ორივეგან ერთნაირად იწერება, ორივე ველში იგივე ჩაწერე.
          </Hint>
        </div>

        <div>
          <span id="artist-styles" className="field-label mb-2">
            სტილები
          </span>
          {styles.length === 0 ? (
            <Hint>სტილები ჯერ არ არის. დაამატე „სტილები“ ჩანართში.</Hint>
          ) : (
            <div role="group" aria-labelledby="artist-styles" className="flex flex-wrap gap-2.5">
              {styles.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  aria-pressed={picked.has(style.id)}
                  onClick={() => setPicked((set) => toggle(set, style.id))}
                  className={chip(picked.has(style.id))}
                >
                  {style.name.ka}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="field-label mb-2">ბიო ქართულად</span>
            <textarea
              rows={6}
              maxLength={1200}
              value={bioKa}
              onChange={(e) => setBioKa(e.target.value)}
              className="field px-3.5 py-3 font-light leading-[22px]"
            />
          </label>
          <label>
            <span className="field-label mb-2">ბიო ინგლისურად</span>
            <textarea
              rows={6}
              maxLength={1200}
              value={bioEn}
              onChange={(e) => setBioEn(e.target.value)}
              className="field px-3.5 py-3 font-light leading-[22px]"
            />
          </label>
          <Hint className="sm:col-span-2">
            არასავალდებულო. თუ ბიოს მხოლოდ ერთ ენაზე შეავსებ, საიტის ორივე ვერსიაზე ის გამოჩნდება.
          </Hint>
        </div>

        <label>
          <span className="field-label mb-2">Instagram</span>
          <input
            maxLength={200}
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@nickname ან https://instagram.com/nickname"
            className="field h-[46px] px-3.5"
          />
        </label>

        <div>
          <span className="field-label mb-2">ფოტო</span>
          <div className="flex flex-wrap items-start gap-4">
            <div className="relative flex aspect-[3/4] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-cream/16 bg-ink">
              {preview ? (
                <Image src={preview} alt="" fill unoptimized className="object-cover" />
              ) : current ? (
                <Thumb photo={current} />
              ) : (
                <PersonIcon className="h-9 w-9 text-rose" />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <input
                type="file"
                aria-label="არტისტის ფოტო"
                accept={PHOTO_TYPES}
                onChange={(e) => {
                  setPhoto(e.target.files?.[0] ?? null);
                  setRemovePhoto(false);
                }}
                className="field px-3.5 py-2.5 file:mr-3.5 file:rounded-full file:border-0 file:bg-raised file:px-4 file:py-1.5 file:text-cream"
              />
              <Hint>არასავალდებულო. JPEG, PNG, WebP ან AVIF, მაქსიმუმ 15 MB. საუკეთესოა ვერტიკალური ფოტო (3:4).</Hint>
              {artist?.photo && !photo && (
                <label className="inline-flex min-h-11 items-center gap-2.5 self-start text-[14.5px] text-cream">
                  <input
                    type="checkbox"
                    checked={removePhoto}
                    onChange={(e) => setRemovePhoto(e.target.checked)}
                    className="h-[18px] w-[18px] accent-[#f7d54a]"
                  />
                  არსებული ფოტოს წაშლა
                </label>
              )}
            </div>
          </div>
        </div>

        <div>
          <span id="artist-tattoos" className="field-label mb-1.5">
            ამ არტისტის ტატუები ({attached.size})
          </span>
          <Hint className="mb-3">
            მონიშნე ტატუები, რომლებიც ამ არტისტმა შეასრულა — ისინი მის გვერდზე გამოჩნდება. ახალი ფოტოს
            ასატვირთად გადადი „ტატუები“ ჩანართზე.
          </Hint>
          {tattooWorks.length === 0 ? (
            <Hint>ბაზაში ტატუები ჯერ არ არის.</Hint>
          ) : (
            <WorkPicker
              labelledBy="artist-tattoos"
              works={tattooWorks}
              picked={attached}
              onToggle={(id) => setAttached((set) => toggle(set, id))}
              artistId={artist?.id}
            />
          )}
        </div>

        <div>
          <span id="artist-piercings" className="field-label mb-1.5">
            ამ არტისტის პირსინგები ({pierced.size})
          </span>
          <Hint className="mb-3">
            თუ არტისტი პირსინგს აკეთებს, მონიშნე მისი შესრულებული პირსინგები — ისინი მის გვერდზე
            გამოჩნდება, თვითონ კი არტისტების გვერდზე „პირსინგის“ ნიშნით ჩანს. ახალი ფოტოს ასატვირთად
            გადადი „პირსინგი“ ჩანართზე.
          </Hint>
          {piercingWorks.length === 0 ? (
            <Hint>ბაზაში პირსინგის ფოტოები ჯერ არ არის.</Hint>
          ) : (
            <WorkPicker
              labelledBy="artist-piercings"
              works={piercingWorks}
              picked={pierced}
              onToggle={(id) => setPierced((set) => toggle(set, id))}
              artistId={artist?.id}
            />
          )}
        </div>

        {error && <Notice kind="error">{error}</Notice>}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className="btn btn-gold disabled:opacity-60">
            {busy ? "ინახება…" : "შენახვა"}
          </button>
          <button type="button" onClick={onCancel} disabled={busy} className="btn btn-outline">
            გაუქმება
          </button>
        </div>
      </form>
    </Card>
  );
}

/** Artists: the list, and the form for adding or editing one. */
export function ArtistsPanel({ artists, styles, tattoos, piercings, reload, explain }: PanelProps) {
  /** which artist the form is open for: an id, "new", or null for the list */
  const [editing, setEditing] = useState<string | null>(null);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function remove(artist: Artist) {
    setBusy(true);
    setError("");
    setDone("");
    try {
      await api(`/artists/${artist.id}`, { method: "DELETE" });
      await reload();
      setDone(`„${artist.nickname.ka}“ წაიშალა. მისი ტატუები და პირსინგები გალერეებში დარჩა, არტისტის გარეშე.`);
    } catch (err) {
      setError(explain(err));
    }
    setBusy(false);
  }

  if (editing) {
    const artist = artists.find((a) => a.id === editing) ?? null;
    return (
      <ArtistForm
        // a fresh form for each artist
        key={editing}
        artist={artist}
        styles={styles}
        tattoos={tattoos}
        piercings={piercings}
        reload={reload}
        explain={explain}
        onDone={(message) => {
          setDone(message);
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle>არტისტები</CardTitle>
        <button
          type="button"
          onClick={() => {
            setDone("");
            setError("");
            setEditing("new");
          }}
          className="btn btn-gold btn-sm"
        >
          + არტისტის დამატება
        </button>
      </div>

      {(done || error) && (
        <div className="mt-4">
          <Notice kind={error ? "error" : "ok"}>{error || done}</Notice>
        </div>
      )}

      {artists.length === 0 ? (
        <Hint className="mt-4">არტისტები ჯერ არ არის დამატებული.</Hint>
      ) : (
        <ul className="mt-3">
          {artists.map((artist) => (
            <li
              key={artist.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-cream/12 py-4 last:border-b-0"
            >
              <span className="relative flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-cream/16 bg-ink">
                {artist.photo ? <Thumb photo={artist.photo} /> : <PersonIcon className="h-6 w-6 text-rose" />}
              </span>
              <div className="min-w-[160px] flex-1">
                <p className="text-[17px] font-medium leading-6 text-cream">
                  {artist.nickname.ka}
                  {artist.nickname.en !== artist.nickname.ka && (
                    <span className="font-normal text-muted"> · {artist.nickname.en}</span>
                  )}
                </p>
                <p className="text-[13.5px] leading-5 text-muted">
                  {[
                    artist.styles.map((s) => s.name.ka).join(" / "),
                    `${artist.tattooCount ?? 0} ტატუ`,
                    `${artist.piercingCount ?? 0} პირსინგი`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href={`/ka/artists/${artist.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  გვერდი
                </Link>
                <button type="button" onClick={() => setEditing(artist.id)} className="btn btn-outline btn-sm">
                  რედაქტირება
                </button>
                <ConfirmDelete disabled={busy} onConfirm={() => void remove(artist)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
