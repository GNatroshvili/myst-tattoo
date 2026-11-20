import "dotenv/config";
import { connectDB, disconnectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { Artist } from "../models/Artist.js";
import { Piercing } from "../models/Piercing.js";
import { PiercingPlace } from "../models/PiercingPlace.js";
import { PiercingZone } from "../models/PiercingZone.js";
import { Style } from "../models/Style.js";
import { Tattoo } from "../models/Tattoo.js";
import { saveImage } from "../utils/images.js";
import { uniqueSlug } from "../utils/slug.js";
import { CREAM, EAR, GOLD, ROSE, hsl, picture, random, star } from "./demo-art.js";

/**
 * Fills the database with demo content for trying the site and the admin
 * panel out: `npm run seed:demo`.
 *
 * It adds three tattoo artists with five tattoos each, one piercer with five
 * piercings, and a piercing price list (zones with places). Every record
 * serves both sites, with its texts in both languages. They are exactly what
 * the admin panel would create, so they can be edited and deleted there. The
 * pictures are drawn here (simple line art marked "DEMO"), not real work.
 *
 * Safe to run again: an artist, zone or place that already exists (same
 * English name) is left alone, with its works.
 *
 * The blog's demo articles are a script of their own (seed-demo-blog.js),
 * which `npm run seed:demo` runs after this one.
 */

/* ---------- what gets added ---------- */

const STYLES = [
  { en: "Fine line", ka: "წვრილი ხაზი" },
  { en: "Blackwork", ka: "ბლექვორკი" },
  { en: "Ornamental", ka: "ორნამენტული" },
  { en: "Botanical", ka: "ბოტანიკური" },
  { en: "Lettering", ka: "წარწერები" },
];

/** `tattoos` are style names (one picture each); `piercings` are place keys from ZONES. */
const ARTISTS = [
  {
    name: { ka: "ნიკა", en: "Nika" },
    hue: 335,
    styles: ["Fine line", "Botanical"],
    instagram: "https://instagram.com/mysttattoo",
    bio: {
      ka: "ნიკა წვრილი ხაზისა და ბოტანიკური მოტივების ოსტატია. უყვარს მსუბუქი, ჰაეროვანი კომპოზიციები, რომლებიც სხეულის ფორმას მიჰყვება. (სატესტო ტექსტი)",
      en: "Nika works in fine line and botanical motifs: light, airy compositions that follow the shape of the body. (Demo text)",
    },
    tattoos: ["Fine line", "Botanical", "Fine line", "Botanical", "Fine line"],
  },
  {
    name: { ka: "ლუკა", en: "Luka" },
    hue: 265,
    styles: ["Blackwork", "Ornamental"],
    instagram: "https://instagram.com/mysttattoo",
    bio: {
      ka: "ლუკა ბლექვორკსა და ორნამენტულ სტილში მუშაობს: მკვეთრი კონტრასტი, სიმეტრია და სუფთა გეომეტრია. (სატესტო ტექსტი)",
      en: "Luka does blackwork and ornamental pieces: strong contrast, symmetry and clean geometry. (Demo text)",
    },
    tattoos: ["Blackwork", "Ornamental", "Blackwork", "Ornamental", "Blackwork"],
  },
  {
    name: { ka: "მარი", en: "Mari" },
    hue: 205,
    styles: ["Lettering", "Fine line"],
    instagram: "",
    bio: {
      ka: "მარი წარწერებსა და მინიმალისტურ ნამუშევრებზეა ორიენტირებული. თითოეულ ასოს ხელით ხატავს. (სატესტო ტექსტი)",
      en: "Mari focuses on lettering and minimal work, drawing every letter by hand. (Demo text)",
    },
    tattoos: ["Lettering", "Fine line", "Lettering", "Lettering", "Fine line"],
  },
  {
    name: { ka: "ანა", en: "Ana" },
    hue: 28,
    styles: [],
    instagram: "https://instagram.com/myst.piercings",
    bio: {
      ka: "ანა სტუდიის პირსინგის ოსტატია. მუშაობს სტერილურად, ტიტანის სამკაულებით, და ყოველთვის დეტალურად გიხსნის მოვლის წესებს. (სატესტო ტექსტი)",
      en: "Ana is the studio's piercer. She works sterile, with titanium jewellery, and always walks you through the aftercare. (Demo text)",
    },
    piercings: ["lobe", "helix", "nose", "eyebrow", "navel"],
  },
];

const ZONES = [
  {
    name: { ka: "ყური", en: "Ear" },
    places: [
      { key: "lobe", name: { ka: "ბიბილო", en: "Lobe" }, price: "40 ₾" },
      {
        key: "helix",
        name: { ka: "ჰელიქსი", en: "Helix" },
        note: { ka: "ყურის ზედა ხრტილი", en: "Upper ear cartilage" },
        price: "60 ₾",
      },
      { key: "tragus", name: { ka: "ტრაგუსი", en: "Tragus" }, price: "70 ₾" },
    ],
  },
  {
    name: { ka: "სახე", en: "Face" },
    places: [
      { key: "eyebrow", name: { ka: "წარბი", en: "Eyebrow" }, price: "80 ₾" },
      {
        key: "nose",
        name: { ka: "ცხვირი", en: "Nose" },
        note: { ka: "ნესტო ან ძგიდე", en: "Nostril or septum" },
        price: "70 ₾",
      },
      { key: "lip", name: { ka: "ტუჩი", en: "Lip" }, price: "90 ₾" },
    ],
  },
  {
    name: { ka: "სხეული", en: "Body" },
    places: [{ key: "navel", name: { ka: "ჭიპი", en: "Navel" }, price: "100 ₾" }],
  },
];

/* ---------- the pictures ---------- */

/** Photo sizes in turn, so the galleries get portrait, square and 4:5 tiles. */
const SIZES = [
  [900, 1200],
  [1000, 1000],
  [960, 1200],
  [900, 1200],
  [960, 1200],
];

/** One drawing per tattoo style; `rnd` varies it from one tattoo to the next, `n` counts the artist's tattoos. */
const TATTOO_ART = {
  // a thin crescent with a scatter of stars
  "Fine line"(rnd) {
    const turn = Math.round(rnd() * 80 - 40);
    const stars = Array.from({ length: 4 + Math.floor(rnd() * 4) }, () =>
      star(Math.round(rnd() * 440 - 220), Math.round(rnd() * 480 - 240), 9 + Math.round(rnd() * 14))
    ).join("");
    return `<g transform="rotate(${turn})" stroke-width="3">
      <path d="M40 -190A190 190 0 1 0 40 190A150 150 0 1 1 40 -190Z"/>
      <path d="M-250 250C-120 215 120 215 250 250" stroke="${ROSE}"/>
    </g>${stars}`;
  },
  // a curved stem with leaves up both sides and a bloom on top
  Botanical(rnd) {
    const lean = Math.round(rnd() * 70 - 35);
    const count = 5 + Math.floor(rnd() * 3);
    const leaves = Array.from({ length: count }, (_, i) => {
      const t = (i + 0.5) / count;
      const y = 250 - t * 470;
      const x = Math.sin(t * Math.PI) * lean;
      const side = i % 2 ? 1 : -1;
      const size = 0.8 + rnd() * 0.7;
      return `<path d="M0 0C30 -26 78 -26 108 0C78 26 30 26 0 0Z" fill="${ROSE}" fill-opacity="0.28" transform="translate(${x} ${y}) rotate(${side > 0 ? -32 : 212}) scale(${size})"/>`;
    }).join("");
    const petals = Array.from({ length: 6 }, (_, i) => `<ellipse cx="0" cy="-38" rx="17" ry="34" transform="translate(0 -250) rotate(${i * 60})" stroke="${GOLD}" stroke-width="3"/>`).join("");
    return `<path d="M0 260C${-lean} 120 ${lean * 2} -60 0 -230"/>${leaves}${petals}<circle cx="0" cy="-250" r="9" fill="${GOLD}" stroke="none"/>`;
  },
  // a solid sun: a filled disc with bold rays
  Blackwork(rnd) {
    const rays = 10 + Math.floor(rnd() * 5) * 2;
    const long = 215 + Math.round(rnd() * 50);
    const spokes = Array.from({ length: rays }, (_, i) => {
      const reach = i % 2 ? long : long * 0.72;
      return `<path d="M-15 -128L0 ${-reach}L15 -128Z" transform="rotate(${(i * 360) / rays})"/>`;
    }).join("");
    return `<g fill="${CREAM}" stroke="none">${spokes}<circle r="112"/></g>
      <circle r="78" fill="#0b0809" stroke="none"/><circle r="46" fill="${CREAM}" stroke="none"/>
      <circle r="${long + 26}" stroke-width="5" stroke-dasharray="3 22"/>`;
  },
  // a mandala: rings of petals turned around the centre
  Ornamental(rnd) {
    const n = 8 + Math.floor(rnd() * 4) * 2;
    const ring = (scale, colour, width) =>
      Array.from({ length: n }, (_, i) => `<path d="M0 0C46 -70 46 -170 0 -235C-46 -170 -46 -70 0 0Z" stroke="${colour}" stroke-width="${width / scale}" transform="rotate(${(i * 360) / n + (scale < 1 ? 180 / n : 0)}) scale(${scale})"/>`).join("");
    const dots = Array.from({ length: n }, (_, i) => `<circle cx="0" cy="-268" r="7" fill="${GOLD}" stroke="none" transform="rotate(${(i * 360) / n + 180 / n})"/>`).join("");
    return `${ring(1, CREAM, 3.5)}${ring(0.58, GOLD, 3)}${dots}<circle r="26"/><circle r="9" fill="${ROSE}" stroke="none"/>`;
  },
  // a short phrase in italics over a flourish
  Lettering(rnd, n) {
    const words = ["amor fati", "breathe", "veritas", "be still", "ad astra"];
    const word = words[n % words.length];
    const tilt = Math.round(rnd() * 16 - 8);
    return `<g transform="rotate(${tilt})">
      <text y="20" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="118" fill="${CREAM}" stroke="none">${word}</text>
      <path d="M-250 78C-120 118 -40 44 40 84S210 110 250 70" stroke="${ROSE}" stroke-width="3"/>
      ${star(0, -150, 22)}
    </g>`;
  },
};

const ring = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" stroke="${GOLD}" stroke-width="9"/>`;
const stud = (x, y, r = 15) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${GOLD}" stroke="none"/>${star(x + r + 20, y - r - 16, 13, CREAM)}`;
/** One drawing per place of the body: a few lines for the anatomy, the jewellery in gold. */
const PIERCING_ART = {
  lobe: () => `${EAR}${stud(-8, 212)}`,
  helix: () => `${EAR}${ring(-146, -92, 26)}${ring(-128, -150, 20)}`,
  nose: () =>
    `<path d="M-60 -260C-48 -130 34 -44 92 44C116 88 62 122 6 110C-16 106 -26 120 -38 144"/>
     <path d="M-38 144C-30 176 -6 190 24 186" stroke-width="3"/>${ring(40, 104, 28)}`,
  eyebrow: () =>
    `<path d="M-240 -40C-130 -132 70 -140 240 -44" stroke-width="30"/>
     <path d="M-170 96C-70 30 70 30 170 96C70 150 -70 150 -170 96Z" stroke-width="3"/><circle cx="0" cy="92" r="34" stroke-width="3"/>
     <path d="M168 -128L196 -52" stroke="${GOLD}" stroke-width="9"/>${stud(164, -140, 13)}<circle cx="200" cy="-42" r="13" fill="${GOLD}" stroke="none"/>`,
  navel: () =>
    `<path d="M-230 -270C-170 -110 -180 90 -240 270"/><path d="M230 -270C170 -110 180 90 240 270"/>
     <ellipse cx="0" cy="10" rx="34" ry="46" stroke-width="3"/>
     <path d="M0 -44L0 62" stroke="${GOLD}" stroke-width="9"/><circle cx="0" cy="-52" r="13" fill="${GOLD}" stroke="none"/>${stud(0, 78, 19)}`,
};

/** An artist's portrait: a plain head-and-shoulders figure in the artist's colour. */
function portrait(hue) {
  const tone = hsl(hue, 45, 62);
  return picture(
    900,
    1200,
    hue,
    `<circle cx="0" cy="-150" r="128" fill="${tone}" fill-opacity="0.3" stroke="${tone}"/>
     <path d="M-290 330C-290 130 -170 28 0 28C170 28 290 130 290 330Z" fill="${tone}" fill-opacity="0.3" stroke="${tone}"/>
     <circle cx="0" cy="-150" r="170" stroke="${GOLD}" stroke-width="2" stroke-dasharray="4 16"/>`
  );
}

/* ---------- adding it ---------- */

await connectDB(env.mongoUri);
const added = { styles: 0, artists: 0, tattoos: 0, zones: 0, places: 0, piercings: 0 };

// styles are shared by both languages
const styles = new Map();
for (const name of STYLES) {
  let style = await Style.findOne({ "name.en": name.en });
  if (!style) {
    style = await Style.create({ name });
    added.styles += 1;
  }
  styles.set(name.en, style);
}

// the price list: zones, and the places inside each
const places = new Map();
for (const zone of ZONES) {
  let zoneDoc = await PiercingZone.findOne({ "name.en": zone.name.en });
  if (!zoneDoc) {
    zoneDoc = await PiercingZone.create({ name: zone.name });
    added.zones += 1;
  }
  for (const place of zone.places) {
    let placeDoc = await PiercingPlace.findOne({ zone: zoneDoc._id, "name.en": place.name.en });
    if (!placeDoc) {
      placeDoc = await PiercingPlace.create({
        zone: zoneDoc._id,
        name: place.name,
        note: place.note ?? { ka: "", en: "" },
        price: place.price,
      });
      added.places += 1;
    }
    places.set(place.key, placeDoc);
  }
}

// the artists; one that is already there keeps what it has and gets nothing new
const fresh = [];
for (const [index, artist] of ARTISTS.entries()) {
  if (await Artist.exists({ "nickname.en": artist.name.en })) {
    console.log(`[seed] ${artist.name.en} is already there, left as is`);
    continue;
  }
  const doc = await Artist.create({
    nickname: artist.name,
    slug: await uniqueSlug(artist.name.en, (slug) => Artist.exists({ slug })),
    styles: artist.styles.map((name) => styles.get(name)._id),
    bio: artist.bio,
    instagramUrl: artist.instagram,
    photo: await saveImage(portrait(artist.hue)),
  });
  added.artists += 1;
  fresh.push({ artist, doc, index });
}

// their works, one round at a time, so the galleries mix the artists
for (let round = 0; round < 5; round++) {
  for (const { artist, doc, index } of fresh) {
    const rnd = random(index * 100 + round + 1);
    const [width, height] = SIZES[(round + index) % SIZES.length];
    const style = artist.tattoos?.[round];
    if (style) {
      const image = await saveImage(picture(width, height, artist.hue, TATTOO_ART[style](rnd, round)));
      await Tattoo.create({ image, style: styles.get(style)._id, artist: doc._id });
      added.tattoos += 1;
    }
    const place = artist.piercings?.[round];
    if (place) {
      const image = await saveImage(picture(width, height, artist.hue, PIERCING_ART[place](rnd)));
      await Piercing.create({ image, place: places.get(place)._id, artist: doc._id });
      added.piercings += 1;
    }
  }
}

console.log(
  `[seed] added ${added.artists} artists, ${added.tattoos} tattoos, ${added.piercings} piercings, ` +
    `${added.zones} piercing zones with ${added.places} places, ${added.styles} styles`
);
await disconnectDB();
