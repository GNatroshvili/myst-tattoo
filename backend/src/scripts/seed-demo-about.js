import "dotenv/config";
import { connectDB, disconnectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { AboutSection } from "../models/AboutSection.js";
import { removeImage, saveImage } from "../utils/images.js";
import { CREAM, GOLD, ROSE, picture, star } from "./demo-art.js";

/**
 * Adds three demo sections for trying the /about page and the admin panel's
 * "ჩვენ შესახებ" tab out: `npm run seed:demo:about` (also the last part of
 * `npm run seed:demo`).
 *
 * The sections are exactly what the admin panel would create, so they can be
 * edited, reordered and deleted there. The second one has no title, to show
 * how such a section looks. The pictures are drawn here (simple line art
 * marked "DEMO") and the texts are demo texts, not the studio's own.
 *
 * Safe to run again: while the page has any section, nothing is added or changed.
 */

/* ---------- what gets added ---------- */

/** In the order the page shows them; each with the drawing that stands in for its photo. */
const SECTIONS = [
  {
    title: { ka: "ჩვენი სტუდია", en: "Our studio" },
    body: {
      ka: `Myst Tattoo Studio თბილისში მდებარე სივრცეა, სადაც ტატუსა და პირსინგს ერთნაირი ყურადღებით ვეკიდებით. აქ ყველა ნამუშევარი საუბრით იწყება: გვაინტერესებს შენი იდეა, მისი ისტორია და ის, თუ როგორ გინდა, რომ წლების შემდეგაც გამოიყურებოდეს.

სტუდია ისეა მოწყობილი, რომ თავი მშვიდად და კომფორტულად იგრძნო, პირველ კონსულტაციაზე იქნები თუ მეათე სეანსზე. (სატესტო ტექსტი)`,
      en: `Myst Tattoo Studio is a space in Tbilisi where tattoos and piercings get the same care. Every piece starts with a conversation: we want to know your idea, its story and how you want it to look years from now.

The studio is set up so that you feel calm and comfortable, whether it is your first consultation or your tenth session. (Demo text)`,
    },
    hue: 335,
    // an arched doorway with a star over it
    drawing: `<path d="M-150 250V-90A150 150 0 0 1 150 -90V250" fill="${ROSE}" fill-opacity="0.14"/>
      <path d="M-95 250V-80A95 95 0 0 1 95 -80V250" stroke-width="3"/>
      <path d="M-260 250H260"/>
      <circle cx="60" cy="90" r="9" fill="${GOLD}" stroke="none"/>
      ${star(0, -300, 34)}${star(-280, -120, 16, CREAM)}${star(280, 40, 14, CREAM)}`,
  },
  {
    title: { ka: "", en: "" },
    body: {
      ka: `ჩვენი არტისტები სხვადასხვა სტილში მუშაობენ, ამიტომ თითოეული იდეისთვის შესაფერის ხელს ვპოულობთ. ესკიზს შენთან ერთად ვამუშავებთ და მუშაობას მხოლოდ მაშინ ვიწყებთ, როცა შედეგი ზუსტად ისეთია, როგორიც წარმოგედგინა. (სატესტო ტექსტი)`,
      en: `Our artists work in different styles, so every idea finds the hand that suits it. We develop the sketch together with you and start only when the result is exactly what you had in mind. (Demo text)`,
    },
    hue: 265,
    // two sheets of sketches and the pencil beside them
    drawing: `<g transform="rotate(-8)"><rect x="-250" y="-230" width="360" height="460" rx="16" fill="${CREAM}" fill-opacity="0.05"/></g>
      <g transform="rotate(6)">
        <rect x="-130" y="-240" width="360" height="460" rx="16" fill="${ROSE}" fill-opacity="0.14"/>
        <circle cx="50" cy="-40" r="112" stroke-width="3" stroke-dasharray="3 12"/>
        ${star(50, -40, 84)}
        <path d="M-60 140H160" stroke-width="3"/><path d="M-30 180H130" stroke-width="3"/>
      </g>
      <g transform="translate(-330 70) rotate(-24)"><rect x="-16" y="-170" width="32" height="250" rx="6"/><path d="M-16 80L0 130L16 80" stroke="${GOLD}"/></g>`,
  },
  {
    title: { ka: "სტერილურობა და უსაფრთხოება", en: "Sterility and safety" },
    body: {
      ka: `ყველა პროცედურა ერთჯერადი ნემსებითა და სტერილური ინსტრუმენტებით ტარდება. სამუშაო ადგილს ყოველი ვიზიტის წინ და მის შემდეგ ვამუშავებთ.

პროცედურის შემდეგ მოვლის დეტალურ ინსტრუქციას მიიღებ, კითხვების შემთხვევაში კი ყოველთვის შეგიძლია მოგვწერო. (სატესტო ტექსტი)`,
      en: `Every procedure is done with single-use needles and sterile instruments. The workstation is cleaned before and after every visit.

Afterwards you get detailed aftercare instructions, and you can always write to us with questions. (Demo text)`,
    },
    hue: 150,
    // a shield with a tick in it
    drawing: `<path d="M0 -260L210 -180V-10C210 130 120 220 0 270C-120 220 -210 130 -210 -10V-180Z" fill="${ROSE}" fill-opacity="0.16"/>
      <path d="M-90 0L-20 76L110 -84" stroke="${GOLD}" stroke-width="9"/>
      ${star(-300, -150, 18)}${star(300, 120, 14, CREAM)}`,
  },
];

/** A little wider than tall, like the frame the page shows a section's photo in. */
const SIZE = [1600, 1280];

/* ---------- adding them ---------- */

await connectDB(env.mongoUri);

if (await AboutSection.exists({})) {
  console.log("[seed] the about page already has sections, left as is");
} else {
  const images = [];
  try {
    for (const { hue, drawing } of SECTIONS) {
      images.push(await saveImage(picture(SIZE[0], SIZE[1], hue, drawing)));
    }
    await AboutSection.create(
      SECTIONS.map(({ title, body }, i) => ({ title, body, image: images[i], position: i + 1 })),
      { ordered: true }
    );
  } catch (err) {
    // leave no files behind for sections that were not saved
    await AboutSection.deleteMany({ "image.full": { $in: images.map((image) => image.full) } }).catch(() => {});
    await Promise.all(images.map(removeImage));
    throw err;
  }
  console.log(`[seed] added ${SECTIONS.length} demo sections to the about page`);
}

await disconnectDB();
