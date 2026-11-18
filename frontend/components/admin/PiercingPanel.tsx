"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Piercing, PiercingPlace, PiercingZone } from "@/lib/types";
import type { PanelProps } from "./AdminApp";
import { api, form, json } from "./api";
import { Card, CardTitle, ConfirmDelete, Hint, Notice, PHOTO_TYPES, Select, Thumb } from "./ui";

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

/** Every place as a drop-down's choices, grouped under its zone. */
function PlaceOptions({ zones }: { zones: PiercingZone[] }) {
  return (
    <>
      {zones
        .filter((zone) => zone.places.length > 0)
        .map((zone) => (
          <optgroup key={zone.id} label={zone.name.ka}>
            {zone.places.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name.ka}
              </option>
            ))}
          </optgroup>
        ))}
    </>
  );
}

const input = "field h-[46px] min-w-0 px-3.5";
/** two names side by side, then the price, then the buttons; they wrap on a phone */
const row = "flex flex-wrap items-end gap-2.5";
const nameCell = "min-w-0 flex-[1_1_150px]";
const priceCell = "min-w-0 flex-[0_1_120px]";

/** One line of a zone's price list: a place's names, price and notes, editable in place. */
function PlaceRow({ place, ...actions }: { place: PiercingPlace } & Actions) {
  const [nameKa, setNameKa] = useState(place.name.ka);
  const [nameEn, setNameEn] = useState(place.name.en);
  const [price, setPrice] = useState(place.price);
  const [noteKa, setNoteKa] = useState(place.note.ka);
  const [noteEn, setNoteEn] = useState(place.note.en);
  const { busy, error, run } = useAction(actions);
  const changed =
    nameKa.trim() !== place.name.ka ||
    nameEn.trim() !== place.name.en ||
    price.trim() !== place.price ||
    noteKa.trim() !== place.note.ka ||
    noteEn.trim() !== place.note.en;

  return (
    <li className="border-b border-cream/12 py-3.5 last:border-b-0">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void run(() =>
            api(
              `/piercing/places/${place.id}`,
              json("PATCH", { name: { ka: nameKa, en: nameEn }, note: { ka: noteKa, en: noteEn }, price })
            )
          );
        }}
        className="flex flex-col gap-2.5"
      >
        <div className={row}>
          <input
            aria-label="ადგილის სახელი ქართულად"
            required
            maxLength={60}
            value={nameKa}
            onChange={(e) => setNameKa(e.target.value)}
            className={`${input} ${nameCell}`}
          />
          <input
            aria-label="ადგილის სახელი ინგლისურად"
            required
            maxLength={60}
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            className={`${input} ${nameCell}`}
          />
          <input
            aria-label="ფასი"
            required
            maxLength={40}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={`${input} ${priceCell}`}
          />
          <button type="submit" disabled={busy || !changed} className="btn btn-outline btn-sm disabled:opacity-40">
            შენახვა
          </button>
          <ConfirmDelete
            disabled={busy}
            onConfirm={() => void run(() => api(`/piercing/places/${place.id}`, { method: "DELETE" }))}
          />
        </div>
        <div className={row}>
          <input
            aria-label="შენიშვნა ქართულად"
            maxLength={160}
            value={noteKa}
            onChange={(e) => setNoteKa(e.target.value)}
            placeholder="შენიშვნა ქართულად"
            className={`${input} ${nameCell} h-[40px] text-[14px]`}
          />
          <input
            aria-label="შენიშვნა ინგლისურად"
            maxLength={160}
            value={noteEn}
            onChange={(e) => setNoteEn(e.target.value)}
            placeholder="Note in English"
            className={`${input} ${nameCell} h-[40px] text-[14px]`}
          />
        </div>
      </form>
      {error && (
        <div className="mt-2.5">
          <Notice kind="error">{error}</Notice>
        </div>
      )}
    </li>
  );
}

/** One zone: its two names, its places with their prices, and the form for adding a place. */
function ZoneCard({ zone, ...actions }: { zone: PiercingZone } & Actions) {
  const [zoneKa, setZoneKa] = useState(zone.name.ka);
  const [zoneEn, setZoneEn] = useState(zone.name.en);
  const [nameKa, setNameKa] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [price, setPrice] = useState("");
  const [noteKa, setNoteKa] = useState("");
  const [noteEn, setNoteEn] = useState("");
  const rename = useAction(actions);
  const add = useAction(actions);
  const renamed = zoneKa.trim() !== zone.name.ka || zoneEn.trim() !== zone.name.en;

  async function addPlace(event: FormEvent) {
    event.preventDefault();
    const added = await add.run(() =>
      api(
        `/piercing/zones/${zone.id}/places`,
        json("POST", { name: { ka: nameKa, en: nameEn }, note: { ka: noteKa, en: noteEn }, price })
      )
    );
    if (added) {
      setNameKa("");
      setNameEn("");
      setPrice("");
      setNoteKa("");
      setNoteEn("");
    }
  }

  return (
    <li className="rounded-[14px] border border-cream/14 bg-ink p-4 sm:p-5">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void rename.run(() =>
            api(`/piercing/zones/${zone.id}`, json("PATCH", { name: { ka: zoneKa, en: zoneEn } }))
          );
        }}
        className={row}
      >
        <input
          aria-label="ზონის სახელი ქართულად"
          required
          maxLength={40}
          value={zoneKa}
          onChange={(e) => setZoneKa(e.target.value)}
          className={`${input} ${nameCell} text-[17px] font-medium`}
        />
        <input
          aria-label="ზონის სახელი ინგლისურად"
          required
          maxLength={40}
          value={zoneEn}
          onChange={(e) => setZoneEn(e.target.value)}
          className={`${input} ${nameCell} text-[17px] font-medium`}
        />
        <button type="submit" disabled={rename.busy || !renamed} className="btn btn-outline btn-sm disabled:opacity-40">
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
              key={`${place.id}:${place.name.ka}:${place.name.en}:${place.note.ka}:${place.note.en}:${place.price}`}
              place={place}
              {...actions}
            />
          ))}
        </ul>
      )}

      <form onSubmit={addPlace} className="mt-4 flex flex-col gap-2.5 border-t border-cream/12 pt-4">
        <p className="field-label">ახალი ადგილი</p>
        <div className={row}>
          <label className={nameCell}>
            <span className="mb-1.5 block text-[13px] leading-5 text-muted">ქართულად *</span>
            <input
              required
              maxLength={60}
              value={nameKa}
              onChange={(e) => setNameKa(e.target.value)}
              placeholder="მაგ.: წარბი"
              className={`${input} w-full`}
            />
          </label>
          <label className={nameCell}>
            <span className="mb-1.5 block text-[13px] leading-5 text-muted">ინგლისურად *</span>
            <input
              required
              maxLength={60}
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Eyebrow"
              className={`${input} w-full`}
            />
          </label>
          <label className={priceCell}>
            <span className="mb-1.5 block text-[13px] leading-5 text-muted">ფასი *</span>
            <input
              required
              maxLength={40}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="80 ₾"
              className={`${input} w-full`}
            />
          </label>
          <button type="submit" disabled={add.busy} className="btn btn-gold btn-sm h-[46px] disabled:opacity-60">
            + ადგილის დამატება
          </button>
        </div>
        <div className={row}>
          <input
            aria-label="ახალი ადგილის შენიშვნა ქართულად"
            maxLength={160}
            value={noteKa}
            onChange={(e) => setNoteKa(e.target.value)}
            placeholder="შენიშვნა ქართულად"
            className={`${input} ${nameCell} h-[40px] text-[14px]`}
          />
          <input
            aria-label="ახალი ადგილის შენიშვნა ინგლისურად"
            maxLength={160}
            value={noteEn}
            onChange={(e) => setNoteEn(e.target.value)}
            placeholder="Note in English"
            className={`${input} ${nameCell} h-[40px] text-[14px]`}
          />
        </div>
      </form>
      {add.error && (
        <div className="mt-2.5">
          <Notice kind="error">{add.error}</Notice>
        </div>
      )}
    </li>
  );
}

/** Zones and their price lists: add a zone, then places inside it. */
function ZonesCard({ zones, ...actions }: { zones: PiercingZone[] } & Actions) {
  const [ka, setKa] = useState("");
  const [en, setEn] = useState("");
  const { busy, error, run } = useAction(actions);

  async function addZone(event: FormEvent) {
    event.preventDefault();
    if (await run(() => api("/piercing/zones", json("POST", { name: { ka, en } })))) {
      setKa("");
      setEn("");
    }
  }

  return (
    <Card>
      <CardTitle>ზონები და ფასები</CardTitle>
      <Hint className="mt-1.5">
        ჯერ დაამატე ზონა (მაგ.: ყური, სახე), შემდეგ ზონის შიგნით — ადგილები თავისი ფასებით (მაგ.: წარბი,
        ცხვირი, ტუჩი). სახელებს წერ ორივე ენაზე: ქართული ჩანს საიტის ქართულ გვერდზე, ინგლისური —
        ინგლისურზე; ფასი ორივეგან ერთია. საიტზე მარცხნივ ზონები ჩანს, მარჯვნივ კი არჩეული ზონის ადგილები
        და ფასები.
      </Hint>

      <form onSubmit={addZone} className={`${row} mt-4`}>
        <label className={nameCell}>
          <span className="field-label mb-2">ახალი ზონა ქართულად *</span>
          <input
            required
            maxLength={40}
            value={ka}
            onChange={(e) => setKa(e.target.value)}
            placeholder="მაგ.: სახე"
            className={`${input} w-full`}
          />
        </label>
        <label className={nameCell}>
          <span className="field-label mb-2">ინგლისურად *</span>
          <input
            required
            maxLength={40}
            value={en}
            onChange={(e) => setEn(e.target.value)}
            placeholder="e.g. Face"
            className={`${input} w-full`}
          />
        </label>
        <button type="submit" disabled={busy} className="btn btn-gold h-[46px] disabled:opacity-60">
          + ზონის დამატება
        </button>
      </form>
      {error && (
        <div className="mt-3">
          <Notice kind="error">{error}</Notice>
        </div>
      )}

      {zones.length === 0 ? (
        <Hint className="mt-4">ზონები ჯერ არ არის დამატებული.</Hint>
      ) : (
        <ul className="mt-5 flex flex-col gap-3.5">
          {/* the key includes the names, so the card starts afresh once a rename is saved */}
          {zones.map((zone) => (
            <ZoneCard key={`${zone.id}:${zone.name.ka}:${zone.name.en}`} zone={zone} {...actions} />
          ))}
        </ul>
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
      </a>
      <Select
        aria-label="ადგილი"
        disabled={busy}
        value={piercing.place?.id ?? ""}
        onChange={(e) => void change({ place: e.target.value })}
      >
        {!piercing.place && <option value="">— ადგილი —</option>}
        <PlaceOptions zones={zones} />
      </Select>
      <Select
        aria-label="არტისტი"
        disabled={busy}
        value={piercing.artist?.id ?? ""}
        onChange={(e) => void change({ artist: e.target.value })}
      >
        <option value="">— არტისტის გარეშე —</option>
        {artists.map((artist) => (
          <option key={artist.id} value={artist.id}>
            {artist.nickname.ka}
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
 * artist. Everything is added once and shows on both of the site's languages.
 */
export function PiercingPanel({ zones, piercings, artists, reload, explain }: PanelProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [place, setPlace] = useState("");
  const [artist, setArtist] = useState("");
  /** "2 / 5" while photos are going up */
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  /** which photos the grid shows: all, those attached to nobody, or one artist's */
  const [show, setShow] = useState("all");
  const picker = useRef<HTMLInputElement>(null);

  const hasPlaces = zones.some((zone) => zone.places.length > 0);

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
        body.set("photo", file);
        body.set("place", place);
        body.set("artist", artist);
        await api("/piercings", form("POST", body));
        sent += 1;
      }
      setDone(sent === 1 ? "პირსინგი დაემატა." : `დაემატა ${sent} პირსინგი.`);
      setFiles([]);
      if (picker.current) picker.current.value = "";
    } catch (err) {
      const text = explain(err);
      setError(sent > 0 ? `${sent} ფოტო აიტვირთა, შემდეგ კი: ${text}` : text);
    }
    setProgress("");
    await reload();
  }

  const shown = piercings.filter(
    (piercing) => show === "all" || (show === "none" ? !piercing.artist : piercing.artist?.id === show)
  );
  // the artist filter offers only artists who have piercings
  const piercers = artists.filter((a) => piercings.some((piercing) => piercing.artist?.id === a.id));

  return (
    <div className="flex flex-col gap-5">
      <ZonesCard zones={zones} reload={reload} explain={explain} />

      <Card>
        <CardTitle>პირსინგის ფოტოს დამატება</CardTitle>
        <Hint className="mt-1.5">
          სტუდიაში შესრულებული პირსინგების ფოტოები. თითოეულს მიუთითე ადგილი და არტისტი — ფოტო გამოჩნდება
          პირსინგის გვერდზე და არტისტის პროფილზე, საიტის ორივე ენაზე.
        </Hint>
        {!hasPlaces ? (
          <Hint className="mt-3">
            ფოტოს დასამატებლად ჯერ ზემოთ დაამატე ერთი ზონა მაინც და მასში ერთი ადგილი.
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
                  <PlaceOptions zones={zones} />
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
                <Hint className="mt-2">ახალ არტისტს ამატებ „არტისტები“ ჩანართში.</Hint>
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
              <option value="all">ყველა ({piercings.length})</option>
              <option value="none">არტისტის გარეშე</option>
              {piercers.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nickname.ka}
                </option>
              ))}
            </Select>
          )}
        </div>

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
