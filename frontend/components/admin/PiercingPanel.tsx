"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Piercing, PiercingPlace, PiercingZone } from "@/lib/types";
import type { PanelProps } from "./AdminApp";
import { api, form, json } from "./api";
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
  Select,
  Thumb,
  languageOf,
} from "./ui";

type Actions = Pick<PanelProps, "reload" | "explain">;

/** Runs a change, re-reads the data, and keeps the "busy" and error states for it. */
function useAction({ reload, explain }: Actions) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  /** Resolves to whether the change went through. */
  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    let ok = true;
    try {
      await action();
      await reload();
    } catch (err) {
      setError(explain(err));
      ok = false;
    }
    setBusy(false);
    return ok;
  }
  return { busy, error, run };
}

/** The places of one language as a drop-down's choices, grouped under their zones. */
function PlaceOptions({ zones, lang }: { zones: PiercingZone[]; lang: Locale }) {
  return (
    <>
      {zones
        .filter((zone) => zone.lang === lang && zone.places.length > 0)
        .map((zone) => (
          <optgroup key={zone.id} label={zone.name}>
            {zone.places.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name}
              </option>
            ))}
          </optgroup>
        ))}
    </>
  );
}

const placeFields = "flex flex-wrap items-end gap-2.5";
const nameField = "field h-[46px] min-w-0 flex-[1_1_150px] px-3.5";
const noteField = "field h-[46px] min-w-0 flex-[2_1_220px] px-3.5";
const priceField = "field h-[46px] min-w-0 flex-[0_1_130px] px-3.5";

/** One line of a zone's price list: a place, its note and its price, editable in place. */
function PlaceRow({ place, ...actions }: { place: PiercingPlace } & Actions) {
  const [name, setName] = useState(place.name);
  const [note, setNote] = useState(place.note);
  const [price, setPrice] = useState(place.price);
  const { busy, error, run } = useAction(actions);
  const changed = name.trim() !== place.name || note.trim() !== place.note || price.trim() !== place.price;

  return (
    <li className="border-b border-cream/12 py-3 last:border-b-0">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void run(() => api(`/piercing/places/${place.id}`, json("PATCH", { name, note, price })));
        }}
        className={placeFields}
      >
        <input
          aria-label="ადგილის სახელი"
          required
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={nameField}
        />
        <input
          aria-label="შენიშვნა"
          maxLength={160}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="შენიშვნა (არასავალდებულო)"
          className={noteField}
        />
        <input
          aria-label="ფასი"
          required
          maxLength={40}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={priceField}
        />
        <button type="submit" disabled={busy || !changed} className="btn btn-outline btn-sm disabled:opacity-40">
          შენახვა
        </button>
        <ConfirmDelete
          disabled={busy}
          onConfirm={() => void run(() => api(`/piercing/places/${place.id}`, { method: "DELETE" }))}
        />
      </form>
      {error && (
        <div className="mt-2.5">
          <Notice kind="error">{error}</Notice>
        </div>
      )}
    </li>
  );
}

/** One zone: its name, its places with their prices, and the form for adding a place. */
function ZoneCard({ zone, ...actions }: { zone: PiercingZone } & Actions) {
  const [zoneName, setZoneName] = useState(zone.name);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [price, setPrice] = useState("");
  const rename = useAction(actions);
  const add = useAction(actions);

  async function addPlace(event: FormEvent) {
    event.preventDefault();
    const added = await add.run(() =>
      api(`/piercing/zones/${zone.id}/places`, json("POST", { name, note, price }))
    );
    if (added) {
      setName("");
      setNote("");
      setPrice("");
    }
  }

  return (
    <li className="rounded-[14px] border border-cream/14 bg-ink p-4 sm:p-5">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void rename.run(() => api(`/piercing/zones/${zone.id}`, json("PATCH", { name: zoneName })));
        }}
        className="flex flex-wrap items-center gap-2.5"
      >
        <input
          aria-label="ზონის სახელი"
          required
          maxLength={40}
          value={zoneName}
          onChange={(e) => setZoneName(e.target.value)}
          className="field h-[46px] min-w-0 flex-[1_1_180px] px-3.5 text-[17px] font-medium"
        />
        <LangBadge lang={zone.lang} />
        <button
          type="submit"
          disabled={rename.busy || zoneName.trim() === zone.name}
          className="btn btn-outline btn-sm disabled:opacity-40"
        >
          შენახვა
        </button>
        <ConfirmDelete
          label="ზონის წაშლა"
          disabled={rename.busy}
          onConfirm={() => void rename.run(() => api(`/piercing/zones/${zone.id}`, { method: "DELETE" }))}
        />
      </form>
      {rename.error && (
        <div className="mt-2.5">
          <Notice kind="error">{rename.error}</Notice>
        </div>
      )}

      <p className="field-label mt-5">
        ადგილები და ფასები <span className="font-normal text-muted">({zone.places.length})</span>
      </p>
      {zone.places.length === 0 ? (
        <Hint className="mt-1.5">ამ ზონაში ადგილები ჯერ არ არის. დაამატე პირველი ქვემოთ.</Hint>
      ) : (
        <ul className="mt-1">
          {/* the key includes the values, so a row starts afresh once its change is saved */}
          {zone.places.map((place) => (
            <PlaceRow
              key={`${place.id}:${place.name}:${place.note}:${place.price}`}
              place={place}
              {...actions}
            />
          ))}
        </ul>
      )}

      <form onSubmit={addPlace} className={`${placeFields} mt-4 border-t border-cream/12 pt-4`}>
        <label className="min-w-0 flex-[1_1_150px]">
          <span className="field-label mb-2">ახალი ადგილი *</span>
          <input
            required
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={zone.lang === "ka" ? "მაგ.: წარბი" : "e.g. Eyebrow"}
            className="field h-[46px] px-3.5"
          />
        </label>
        <label className="min-w-0 flex-[2_1_220px]">
          <span className="field-label mb-2">შენიშვნა</span>
          <input
            maxLength={160}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="არასავალდებულო"
            className="field h-[46px] px-3.5"
          />
        </label>
        <label className="min-w-0 flex-[0_1_130px]">
          <span className="field-label mb-2">ფასი *</span>
          <input
            required
            maxLength={40}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="80 ₾"
            className="field h-[46px] px-3.5"
          />
        </label>
        <button type="submit" disabled={add.busy} className="btn btn-gold btn-sm h-[46px] disabled:opacity-60">
          + ადგილის დამატება
        </button>
      </form>
      {add.error && (
        <div className="mt-2.5">
          <Notice kind="error">{add.error}</Notice>
        </div>
      )}
    </li>
  );
}

/** Zones and their price lists: add a zone (language first), then places inside it. */
function ZonesCard({ zones, ...actions }: { zones: PiercingZone[] } & Actions) {
  /** whether the "new zone" form is open, and the language picked for it */
  const [adding, setAdding] = useState(false);
  const [lang, setLang] = useState<Locale | null>(null);
  const [name, setName] = useState("");
  const [show, setShow] = useState<Locale | "all">("all");
  const { busy, error, run } = useAction(actions);

  function close() {
    setAdding(false);
    setLang(null);
    setName("");
  }

  async function addZone(event: FormEvent) {
    event.preventDefault();
    if (!lang) return;
    if (await run(() => api("/piercing/zones", json("POST", { lang, name })))) close();
  }

  const shown = zones.filter((zone) => show === "all" || zone.lang === show);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle>ზონები და ფასები</CardTitle>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="btn btn-gold btn-sm">
            + ზონის დამატება
          </button>
        )}
      </div>
      <Hint className="mt-1.5">
        ჯერ დაამატე ზონა (მაგ.: ყური, სახე), შემდეგ ზონის შიგნით — ადგილები თავისი ფასებით (მაგ.: წარბი,
        ცხვირი, ტუჩი). საიტზე მარცხნივ ზონები ჩანს, მარჯვნივ კი არჩეული ზონის ადგილები და ფასები.
      </Hint>

      {adding && (
        <div className="mt-5 rounded-[14px] border border-cream/16 bg-ink p-4 sm:p-5">
          <p className="text-[17px] font-medium leading-6 text-cream">ახალი ზონა</p>
          {!lang ? (
            // adding starts with the language: the name is asked only once it is picked
            <div className="mt-4">
              <LanguagePick onPick={setLang} />
            </div>
          ) : (
            <form onSubmit={addZone} className="mt-4 flex flex-col gap-4">
              <ChosenLanguage lang={lang} onChange={() => setLang(null)} />
              <label>
                <span className="field-label mb-2">ზონის სახელი *</span>
                <input
                  required
                  maxLength={40}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === "ka" ? "მაგ.: სახე" : "e.g. Face"}
                  className="field h-[46px] px-3.5"
                />
                <Hint className="mt-2">ჩაწერე ისე, როგორც {languageOf(lang).onSite} უნდა ეწეროს.</Hint>
              </label>
              {error && <Notice kind="error">{error}</Notice>}
              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={busy} className="btn btn-gold disabled:opacity-60">
                  {busy ? "ინახება…" : "ზონის დამატება"}
                </button>
              </div>
            </form>
          )}
          <button type="button" onClick={close} disabled={busy} className="btn btn-outline mt-4">
            გაუქმება
          </button>
        </div>
      )}

      {zones.length === 0 ? (
        <Hint className="mt-4">ზონები ჯერ არ არის დამატებული.</Hint>
      ) : (
        <>
          <div className="mt-5">
            <LanguageFilter
              value={show}
              onChange={setShow}
              count={(key) => zones.filter((zone) => key === "all" || zone.lang === key).length}
            />
          </div>
          {shown.length === 0 ? (
            <Hint className="mt-4">ამ ენისთვის ზონები ჯერ არ არის დამატებული.</Hint>
          ) : (
            <ul className="mt-4 flex flex-col gap-3.5">
              {/* the key includes the name, so the card starts afresh once a rename is saved */}
              {shown.map((zone) => (
                <ZoneCard key={`${zone.id}:${zone.name}`} zone={zone} {...actions} />
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  );
}

/** One piercing photo in the grid, with its place and artist changeable in place. */
function PiercingCard({
  piercing,
  zones,
  artists,
  ...actions
}: { piercing: Piercing } & Pick<PanelProps, "zones" | "artists"> & Actions) {
  const { busy, error, run } = useAction(actions);
  // a piercing can only belong to an artist added for the same language
  const ownLanguage = artists.filter((artist) => artist.lang === piercing.lang);
  const change = (fields: { place?: string; artist?: string }) =>
    run(() => api(`/piercings/${piercing.id}`, json("PATCH", fields)));

  return (
    <li className="flex flex-col gap-2.5 rounded-[14px] border border-cream/14 bg-ink p-2.5">
      <a
        href={piercing.image.full}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="ფოტოს გახსნა სრული ზომით"
        className="relative block aspect-[3/4] overflow-hidden rounded-[10px] bg-surface"
      >
        <Thumb photo={piercing.image} />
        <LangBadge lang={piercing.lang} short className="absolute left-2 top-2" />
      </a>
      <Select
        aria-label="ადგილი"
        disabled={busy}
        value={piercing.place?.id ?? ""}
        onChange={(e) => void change({ place: e.target.value })}
      >
        {!piercing.place && <option value="">— ადგილი —</option>}
        <PlaceOptions zones={zones} lang={piercing.lang} />
      </Select>
      <Select
        aria-label="არტისტი"
        disabled={busy}
        value={piercing.artist?.id ?? ""}
        onChange={(e) => void change({ artist: e.target.value })}
      >
        <option value="">— არტისტის გარეშე —</option>
        {ownLanguage.map((artist) => (
          <option key={artist.id} value={artist.id}>
            {artist.nickname}
          </option>
        ))}
      </Select>
      <ConfirmDelete
        disabled={busy}
        onConfirm={() => void run(() => api(`/piercings/${piercing.id}`, { method: "DELETE" }))}
      />
      {error && <Notice kind="error">{error}</Notice>}
    </li>
  );
}

/**
 * Piercing: the price list (zones, and places with prices inside them), and
 * the photos of piercings done at the studio, each tagged with a place and an
 * artist. Everything is added for one language and shows on that site.
 */
export function PiercingPanel({ zones, piercings, artists, reload, explain }: PanelProps) {
  /** the language new photos are added for; null until it is picked */
  const [lang, setLang] = useState<Locale | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [place, setPlace] = useState("");
  const [artist, setArtist] = useState("");
  /** "2 / 5" while photos are going up */
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  /** which photos the grid shows: every language's or one's… */
  const [showLang, setShowLang] = useState<Locale | "all">("all");
  /** …and all of those, those attached to nobody, or one artist's */
  const [show, setShow] = useState("all");
  const picker = useRef<HTMLInputElement>(null);

  const hasPlaces = zones.some((zone) => zone.places.length > 0);
  const langHasPlaces = lang ? zones.some((zone) => zone.lang === lang && zone.places.length > 0) : false;

  /** Picks (or un-picks) the language for new photos and clears what depended on it. */
  function chooseLang(next: Locale | null) {
    setLang(next);
    setPlace("");
    setArtist("");
    setError("");
    setDone("");
  }

  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!lang) return;
    setError("");
    setDone("");
    let sent = 0;
    try {
      // one request per photo, so one bad file does not lose the rest
      for (const file of files) {
        setProgress(`${sent + 1} / ${files.length}`);
        const body = new FormData();
        body.set("lang", lang);
        body.set("photo", file);
        body.set("place", place);
        body.set("artist", artist);
        await api("/piercings", form("POST", body));
        sent += 1;
      }
      const { onSite, site } = languageOf(lang);
      setDone(`${sent === 1 ? "პირსინგი დაემატა" : `დაემატა ${sent} პირსინგი`} და ჩანს ${onSite} (${site}).`);
      setFiles([]);
      if (picker.current) picker.current.value = "";
    } catch (err) {
      const text = explain(err);
      setError(sent > 0 ? `${sent} ფოტო აიტვირთა, შემდეგ კი: ${text}` : text);
    }
    setProgress("");
    await reload();
  }

  const inLanguage = piercings.filter((piercing) => showLang === "all" || piercing.lang === showLang);
  const shown = inLanguage.filter(
    (piercing) => show === "all" || (show === "none" ? !piercing.artist : piercing.artist?.id === show)
  );
  // the artist filter offers only artists who have piercings the language filter lets through
  const filterArtists = artists.filter((a) => inLanguage.some((piercing) => piercing.artist?.id === a.id));

  return (
    <div className="flex flex-col gap-5">
      <ZonesCard zones={zones} reload={reload} explain={explain} />

      <Card>
        <CardTitle>პირსინგის ფოტოს დამატება</CardTitle>
        <Hint className="mt-1.5">
          სტუდიაში შესრულებული პირსინგების ფოტოები. თითოეულს მიუთითე ადგილი და არტისტი — ფოტო გამოჩნდება
          პირსინგის გვერდზე და არტისტის პროფილზე.
        </Hint>
        {!hasPlaces ? (
          <Hint className="mt-3">
            ფოტოს დასამატებლად ჯერ ზემოთ დაამატე ერთი ზონა მაინც და მასში ერთი ადგილი.
          </Hint>
        ) : !lang ? (
          // adding starts with the language: the upload form opens only once it is picked
          <div className="mt-4">
            <LanguagePick onPick={chooseLang} />
          </div>
        ) : (
          <form onSubmit={upload} className="mt-4 flex flex-col gap-4">
            <ChosenLanguage lang={lang} onChange={progress ? undefined : () => chooseLang(null)} />

            {!langHasPlaces ? (
              <Hint>
                ამ ენისთვის ({languageOf(lang).label}) ადგილები ჯერ არ არის. ჯერ ზემოთ დაამატე ზონა და
                ადგილი ამავე ენაზე.
              </Hint>
            ) : (
              <>
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
                    JPEG, PNG, WebP ან AVIF, თითო მაქსიმუმ 15 MB. რამდენიმე ფოტოს ერთად არჩევაც შეიძლება —
                    ყველას ქვემოთ არჩეული ადგილი და არტისტი მიენიჭება.
                  </Hint>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className="field-label mb-2">ადგილი *</span>
                    <Select required value={place} onChange={(e) => setPlace(e.target.value)}>
                      <option value="" disabled>
                        აირჩიე ადგილი
                      </option>
                      <PlaceOptions zones={zones} lang={lang} />
                    </Select>
                  </label>
                  <label>
                    <span className="field-label mb-2">არტისტი</span>
                    <Select value={artist} onChange={(e) => setArtist(e.target.value)}>
                      <option value="">— არტისტის გარეშე —</option>
                      {artists
                        .filter((a) => a.lang === lang)
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.nickname}
                          </option>
                        ))}
                    </Select>
                    <Hint className="mt-2">
                      აქ მხოლოდ იმავე ენისთვის დამატებული არტისტები ჩანს. ახალ არტისტს ამატებ „არტისტები“
                      ჩანართში.
                    </Hint>
                  </label>
                </div>

                {error && <Notice kind="error">{error}</Notice>}
                {done && <Notice kind="ok">{done}</Notice>}

                <button
                  type="submit"
                  disabled={Boolean(progress)}
                  className="btn btn-gold self-start disabled:opacity-60"
                >
                  {progress ? `იტვირთება ${progress}…` : files.length > 1 ? `${files.length} ფოტოს ატვირთვა` : "ატვირთვა"}
                </button>
              </>
            )}
          </form>
        )}
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>პირსინგის ფოტოები</CardTitle>
          {piercings.length > 0 && (
            <Select
              aria-label="რომელი ფოტოები ჩანს"
              value={show}
              onChange={(e) => setShow(e.target.value)}
              className="w-full sm:w-[240px]"
            >
              <option value="all">ყველა ({inLanguage.length})</option>
              <option value="none">არტისტის გარეშე</option>
              {filterArtists.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nickname} ({languageOf(a.lang).short})
                </option>
              ))}
            </Select>
          )}
        </div>

        {piercings.length > 0 && (
          <div className="mt-4">
            <LanguageFilter
              value={showLang}
              onChange={(value) => {
                setShowLang(value);
                // an artist picked under the other language would leave the grid empty
                setShow("all");
              }}
              count={(key) => piercings.filter((p) => key === "all" || p.lang === key).length}
            />
          </div>
        )}

        {shown.length === 0 ? (
          <Hint className="mt-3">
            {piercings.length === 0 ? "პირსინგის ფოტოები ჯერ არ არის დამატებული." : "ამ ფილტრით ფოტო არ მოიძებნა."}
          </Hint>
        ) : (
          <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3.5">
            {shown.map((piercing) => (
              <PiercingCard
                key={piercing.id}
                piercing={piercing}
                zones={zones}
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
