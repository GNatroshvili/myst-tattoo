import "dotenv/config";
import { connectDB, disconnectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { Course } from "../models/Course.js";
import { removeImage, saveImage } from "../utils/images.js";
import { CREAM, GOLD, ROSE, picture, star } from "./demo-art.js";

/**
 * Posts a demo tattoo course for trying the /course page and the admin
 * panel's "კურსი" tab out: `npm run seed:demo:course` (also the last part of
 * `npm run seed:demo`).
 *
 * It adds the one course there can be: a title and a text in both languages
 * and four photos. It is exactly what the admin panel would create, so it can
 * be edited and deleted there. The pictures are drawn here (simple line art
 * marked "DEMO") and the text is a demo text, not the studio's own: it names
 * no price and no dates. The course is dated the moment the script runs.
 *
 * Safe to run again: while a course is posted, nothing is added or changed.
 */

/* ---------- what gets added ---------- */

const COURSE = {
  title: { ka: "ტატუს კურსი დამწყებთათვის", en: "Tattoo course for beginners" },
  body: {
    ka: `ეს კურსი მათთვისაა, ვისაც ტატუს ხელოვნების საფუძვლიანად შესწავლა სურს — პირველი ესკიზიდან პირველ დამოუკიდებელ ნამუშევრამდე. წინასწარი გამოცდილება საჭირო არ არის: საკმარისია ხატვის სიყვარული და მოთმინება.

რას ისწავლი. აპარატის აწყობასა და მოვლას, ნემსების ტიპებს, ჰიგიენისა და სტერილიზაციის წესებს, კანის აგებულებას. შემდეგ ტექნიკაზე გადავდივართ: კონტური, დაჩრდილვა, შევსება და ფერთან მუშაობა.

როგორ მიმდინარეობს. ჯგუფები პატარაა, ამიტომ ოსტატი თითოეულ მონაწილესთან ცალ-ცალკე მუშაობს. პრაქტიკა ხელოვნურ კანზე იწყება; ნამდვილ კანზე მხოლოდ მაშინ გადადიხარ, როცა ხელი დაგიმშვიდდება, და ისიც ოსტატის ზედამხედველობით.

რით ამთავრებ. კურსის ბოლოს გექნება საკუთარი ნამუშევრების პირველი პორტფოლიო და გეცოდინება, როგორ გააგრძელო დამოუკიდებლად.

კურსის დაწყების თარიღისა და ფასის გასაგებად მოგვწერე — ყველა კითხვაზე გიპასუხებთ. (სატესტო ტექსტი)`,
    en: `This course is for anyone who wants to learn tattooing properly, from the first sketch to the first piece done on their own. No experience is needed: a love of drawing and some patience are enough.

What you learn. Setting up and looking after the machine, the kinds of needles, hygiene and sterilisation, how skin is built. Then the technique itself: lining, shading, packing and working with colour.

How it runs. The groups are small, so the artist works with each student one to one. Practice starts on synthetic skin; you move on to real skin only once your hand is steady, and then under the artist's eye.

What you leave with. By the end you have a first portfolio of your own work, and you know how to carry on by yourself.

For the starting date and the price, write to us and we will answer every question. (Demo text)`,
  },
};

/* ---------- the pictures ---------- */

/** One drawing per photo, in the order the page shows them: the first is the large one. */
const PHOTOS = [
  // a tattoo machine held at an angle, its cable trailing off
  {
    size: [1400, 1300],
    hue: 335,
    drawing: `<g transform="rotate(-35)">
       <rect x="-60" y="-250" width="120" height="250" rx="34" fill="${ROSE}" fill-opacity="0.2"/>
       <path d="M-60 -170H60"/><path d="M-60 -110H60"/>
       <path d="M-36 0L-20 120H20L36 0"/>
       <path d="M0 120V250" stroke="${GOLD}" stroke-width="3"/>
       <path d="M0 -250C0 -320 90 -330 150 -290" stroke-width="3"/>
     </g>${star(230, -200, 26)}${star(-260, 130, 16, CREAM)}${star(260, 190, 12, CREAM)}`,
  },
  // a sheet with a flower sketched on it, and the pencil beside it
  {
    size: [1600, 900],
    hue: 265,
    drawing: `<g transform="rotate(-6)">
       <rect x="-220" y="-250" width="440" height="500" rx="16" fill="${CREAM}" fill-opacity="0.06"/>
       <path d="M0 190C-20 90 20 20 0 -40" stroke-width="3"/>
       ${[0, 72, 144, 216, 288].map((turn) => `<path d="M0 -40C-34 -90 -34 -150 0 -180C34 -150 34 -90 0 -40Z" fill="${ROSE}" fill-opacity="0.25" transform="rotate(${turn} 0 -40)"/>`).join("")}
       <circle cx="0" cy="-40" r="14" fill="${GOLD}" stroke="none"/>
     </g>
     <g transform="translate(330 40) rotate(28)"><rect x="-16" y="-170" width="32" height="250" rx="6"/><path d="M-16 80L0 130L16 80" stroke="${GOLD}"/></g>
     ${star(-340, -170, 18)}`,
  },
  // a pad of practice skin: three lines, each thinner than the last
  {
    size: [1200, 1200],
    hue: 28,
    drawing: `<rect x="-250" y="-190" width="500" height="380" rx="34" fill="${ROSE}" fill-opacity="0.16"/>
     <path d="M-190 -110C-110 -150 -30 -70 50 -110S190 -150 200 -110" stroke-width="7"/>
     <path d="M-190 -30C-110 -70 -30 10 50 -30S190 -70 200 -30" stroke-width="4"/>
     <path d="M-190 50C-110 10 -30 90 50 50S190 10 200 50" stroke-width="2" stroke-dasharray="3 12"/>
     ${star(0, 122, 30)}${star(-150, 126, 14, CREAM)}${star(150, 126, 14, CREAM)}`,
  },
  // the certificate at the end
  {
    size: [1000, 1300],
    hue: 150,
    drawing: `<rect x="-210" y="-270" width="420" height="540" rx="18" fill="${CREAM}" fill-opacity="0.05"/>
     <rect x="-180" y="-240" width="360" height="480" rx="8" stroke="${GOLD}" stroke-width="2" stroke-dasharray="4 14"/>
     ${star(0, -120, 64)}
     <path d="M-110 -10H110" stroke-width="3"/><path d="M-80 40H80" stroke-width="3"/><path d="M-110 90H110" stroke-width="3"/>
     <circle cx="0" cy="170" r="34" stroke="${GOLD}"/><path d="M-18 198L-30 250L0 232L30 250L18 198" stroke="${GOLD}"/>`,
  },
];

/* ---------- adding it ---------- */

await connectDB(env.mongoUri);

if (await Course.exists({})) {
  console.log("[seed] a course is already posted, left as is");
} else {
  const photos = [];
  try {
    for (const { size, hue, drawing } of PHOTOS) {
      photos.push(await saveImage(picture(size[0], size[1], hue, drawing)));
    }
    await Course.create({ ...COURSE, photos });
  } catch (err) {
    // leave no files behind for a course that was not saved
    await Promise.all(photos.map(removeImage));
    throw err;
  }
  console.log(`[seed] posted the demo course with ${photos.length} photos`);
}

await disconnectDB();
