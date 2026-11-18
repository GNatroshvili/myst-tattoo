"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Artist, ArtistBrief, Photo } from "@/lib/types";
import { PersonIcon } from "../ui/Icons";
import type { PanelProps } from "./AdminApp";
import { api, form } from "./api";
import {
  Card,
  CardTitle,
  ChosenLanguage,
  ConfirmDelete,
  Hint,
  LangBadge,
  LanguageFilter,
  LanguagePick,
  Notice,
  PHOTO_TYPES,
  Thumb,
  languageOf,
  usePreview,
} from "./ui";

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
            aria-label={`${work.caption}${other ? `, ახლა: ${other.nickname}` : ""}`}
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
              {other && <span className="block truncate text-muted">ახლა: {other.nickname}</span>}
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
  /** the language the artist is for: picked first when adding, fixed afterwards */
  lang: Locale;
  /** back to picking the language; only while adding */
  onChangeLang?: () => void;
  onDone: (message: string) => void;
  onCancel: () => void;
};

/**
 * Add or edit an artist in one language: nickname, styles, bio, Instagram,
 * photo, and their tattoos and piercings. A tattoo artist gets tattoos, a
 * piercer gets piercings; both are the same kind of artist. Everything typed
 * here shows on that language's site.
 */
function ArtistForm({
  artist,
  lang,
  onChangeLang,
  styles,
  tattoos,
  piercings,
  reload,
  explain,
  onDone,
  onCancel,
}: FormProps) {
  const language = languageOf(lang);
  const [nickname, setNickname] = useState(artist?.nickname ?? "");
  const [picked, setPicked] = useState(() => new Set(artist?.styles.map((style) => style.id)));
  const [bio, setBio] = useState(artist?.bio ?? "");
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
  // an artist can only have tattoos and piercings added for the same language
  const ownTattoos: Work[] = tattoos
    .filter((tattoo) => tattoo.lang === lang)
    .map((tattoo) => ({
      id: tattoo.id,
      image: tattoo.image,
      caption: tattoo.style?.name[lang] ?? "ტატუ",
      artist: tattoo.artist,
    }));
  const ownPiercings: Work[] = piercings
    .filter((piercing) => piercing.lang === lang)
    .map((piercing) => ({
      id: piercing.id,
      image: piercing.image,
      caption: piercing.place?.name ?? "პირსინგი",
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
    if (!artist) body.set("lang", lang);
    body.set("nickname", nickname);
    body.set("styles", JSON.stringify([...picked]));
    body.set("bio", bio);
    body.set("instagramUrl", instagram);
    body.set("tattoos", JSON.stringify([...attached]));
    body.set("piercings", JSON.stringify([...pierced]));
    if (photo) body.set("photo", photo);
    else if (removePhoto) body.set("removePhoto", "true");

    try {
      await api(artist ? `/artists/${artist.id}` : "/artists", form(artist ? "PATCH" : "POST", body));
      await reload();
      onDone(
        artist ? "ცვლილებები შენახულია." : `არტისტი დაემატა და ჩანს ${language.onSite} (${language.site}).`
      );
    } catch (err) {
      setError(explain(err));
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardTitle>{artist ? `რედაქტირება: ${artist.nickname}` : "ახალი არტისტი"}</CardTitle>

      <form onSubmit={save} className="mt-5 flex flex-col gap-5">
        <ChosenLanguage lang={lang} onChange={onChangeLang} />

        <label>
          <span className="field-label mb-2">ნიქნეიმი *</span>
          <input
            required
            maxLength={60}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="field h-[46px] px-3.5"
          />
          <Hint className="mt-2">ჩაწერე ისე, როგორც {language.onSite} უნდა ეწეროს.</Hint>
        </label>

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
                  {style.name[lang]}
                </button>
              ))}
            </div>
          )}
        </div>

        <label>
          <span className="field-label mb-2">{language.bioLabel}</span>
          <textarea
            rows={6}
            maxLength={1200}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="field px-3.5 py-3 font-light leading-[22px]"
          />
          <Hint className="mt-2">არასავალდებულო. ეს ტექსტი მხოლოდ {language.onSite} გამოჩნდება.</Hint>
        </label>

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
            მონიშნე ტატუები, რომლებიც ამ არტისტმა შეასრულა — ისინი მის გვერდზე გამოჩნდება. აქ მხოლოდ
            იმავე ენისთვის ({language.label}) დამატებული ტატუები ჩანს. ახალი ფოტოს ასატვირთად გადადი
            „ტატუები“ ჩანართზე.
          </Hint>
          {ownTattoos.length === 0 ? (
            <Hint>ამ ენისთვის ტატუები ჯერ არ არის დამატებული.</Hint>
          ) : (
            <WorkPicker
              labelledBy="artist-tattoos"
              works={ownTattoos}
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
            გამოჩნდება, თვითონ კი არტისტების გვერდზე „პირსინგის“ ნიშნით ჩანს. აქ მხოლოდ იმავე ენისთვის (
            {language.label}) დამატებული ფოტოები ჩანს. ახალი ფოტოს ასატვირთად გადადი „პირსინგი“ ჩანართზე.
          </Hint>
          {ownPiercings.length === 0 ? (
            <Hint>ამ ენისთვის პირსინგის ფოტოები ჯერ არ არის დამატებული.</Hint>
          ) : (
            <WorkPicker
              labelledBy="artist-piercings"
              works={ownPiercings}
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
  /** the language picked for a new artist; null until it is picked */
  const [newLang, setNewLang] = useState<Locale | null>(null);
  /** which language's artists the list shows */
  const [show, setShow] = useState<Locale | "all">("all");
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
      setDone(`„${artist.nickname}“ წაიშალა. მისი ტატუები და პირსინგები გალერეებში დარჩა, არტისტის გარეშე.`);
    } catch (err) {
      setError(explain(err));
    }
    setBusy(false);
  }

  function close() {
    setEditing(null);
    setNewLang(null);
  }

  // adding starts with the language: the form opens only once it is picked
  if (editing === "new" && !newLang) {
    return (
      <Card>
        <CardTitle>ახალი არტისტი</CardTitle>
        <div className="mt-5">
          <LanguagePick onPick={setNewLang} />
        </div>
        <button type="button" onClick={close} className="btn btn-outline mt-5">
          გაუქმება
        </button>
      </Card>
    );
  }

  if (editing) {
    const artist = artists.find((a) => a.id === editing) ?? null;
    const lang = artist?.lang ?? newLang;
    if (lang) {
      return (
        <ArtistForm
          // a fresh form for each artist and each language
          key={`${editing}-${lang}`}
          artist={artist}
          lang={lang}
          onChangeLang={artist ? undefined : () => setNewLang(null)}
          styles={styles}
          tattoos={tattoos}
          piercings={piercings}
          reload={reload}
          explain={explain}
          onDone={(message) => {
            setDone(message);
            close();
          }}
          onCancel={close}
        />
      );
    }
  }

  const shown = artists.filter((artist) => show === "all" || artist.lang === show);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle>არტისტები</CardTitle>
        <button
          type="button"
          onClick={() => {
            setDone("");
            setError("");
            setNewLang(null);
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
        <>
          <div className="mt-4">
            <LanguageFilter
              value={show}
              onChange={setShow}
              count={(lang) => artists.filter((a) => lang === "all" || a.lang === lang).length}
            />
          </div>

          {shown.length === 0 ? (
            <Hint className="mt-4">ამ ენისთვის არტისტები ჯერ არ არის დამატებული.</Hint>
          ) : (
            <ul className="mt-3">
              {shown.map((artist) => (
                <li
                  key={artist.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-cream/12 py-4 last:border-b-0"
                >
                  <span className="relative flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-cream/16 bg-ink">
                    {artist.photo ? <Thumb photo={artist.photo} /> : <PersonIcon className="h-6 w-6 text-rose" />}
                  </span>
                  <div className="min-w-[160px] flex-1">
                    <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[17px] font-medium leading-6 text-cream">
                      {artist.nickname}
                      <LangBadge lang={artist.lang} />
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
                      href={`/${artist.lang}/artists/${artist.slug}`}
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
        </>
      )}
    </Card>
  );
}
