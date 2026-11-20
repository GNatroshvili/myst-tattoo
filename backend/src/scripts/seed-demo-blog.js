import "dotenv/config";
import { connectDB, disconnectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { BlogPost } from "../models/BlogPost.js";
import { BlogTopic } from "../models/BlogTopic.js";
import { saveImage } from "../utils/images.js";
import { uniqueSlug } from "../utils/slug.js";
import { CREAM, EAR, GOLD, ROSE, picture, star } from "./demo-art.js";

/**
 * Fills the blog with demo content for trying the site and the admin panel
 * out: `npm run seed:demo:blog` (also the second half of `npm run seed:demo`).
 *
 * It adds four topics and six articles, each with its title and text in both
 * languages. They are exactly what the admin panel would create, so they can
 * be edited and deleted there. The pictures are drawn here (simple line art
 * marked "DEMO") and the texts are demo texts, not the studio's own.
 *
 * The articles are dated over the last three weeks, newest first as listed,
 * so the blog page has an order to show; an article added in the admin panel
 * gets the moment it is added.
 *
 * Safe to run again: a topic or an article that already exists (same English
 * name or title) is left alone.
 */

/* ---------- what gets added ---------- */

const TOPICS = {
  care: { ka: "ტატუს მოვლა", en: "Tattoo care" },
  piercing: { ka: "პირსინგი", en: "Piercing" },
  styles: { ka: "სტილები", en: "Styles" },
  news: { ka: "სტუდიის სიახლეები", en: "Studio news" },
};

/** `daysAgo` and `at` ("HH:MM", on this machine's clock) date the article. */
const POSTS = [
  {
    topic: "care",
    art: "care",
    hue: 335,
    daysAgo: 0,
    at: null,
    title: { ka: "როგორ მოვუაროთ ახალ ტატუს", en: "How to care for a new tattoo" },
    body: {
      ka: `ახალი ტატუ ჭრილობაა, რომელსაც ორი-სამი კვირა სჭირდება შესახორცებლად. ამ დროს მოვლა ისეთივე მნიშვნელოვანია, როგორც თვითონ სეანსი.

პირველი დღეები. დამცავი ფირი მოიხსენი მაშინ, როცა ოსტატმა გითხრა — ჩვეულებრივ რამდენიმე საათიდან რამდენიმე დღემდე. კანი დაიბანე ნელთბილი წყლით და უსუნო საპნით, სუფთა ხელით, ღრუბლის გარეშე. გაიმშრალე ქაღალდის ხელსახოცით, მსუბუქი შეხებით.

კრემი. წაისვი თხელი ფენა დღეში ორ-სამჯერ. სქელი ფენა კანს სუნთქვას უშლის და შეხორცებას აგვიანებს.

რას ვერიდებით. ორი კვირა მოერიდე აუზს, ზღვას, საუნას და პირდაპირ მზეს. ქერქს ნუ მოიძრობ და ნუ მოიფხან, თუნდაც ძალიან გექავებოდეს.

თუ სიწითლე რამდენიმე დღეში არ გაივლის ან ტკივილი გაძლიერდება, მოგვწერე — სჯობს ერთხელ ზედმეტად ვნახოთ. (სატესტო ტექსტი)`,
      en: `A new tattoo is a wound that needs two to three weeks to heal. Looking after it in that time matters as much as the session itself.

The first days. Take the protective film off when your artist told you to, usually after a few hours to a few days. Wash the skin with lukewarm water and unscented soap, with a clean hand and no sponge. Pat it dry with a paper towel.

Balm. Apply a thin layer two or three times a day. A thick one keeps the skin from breathing and slows the healing.

What to avoid. Stay out of the pool, the sea, the sauna and direct sun for two weeks. Do not pick or scratch the scabs, however much they itch.

If the redness has not eased after a few days, or the pain gets worse, write to us. We would rather look once too often. (Demo text)`,
    },
  },
  {
    topic: "news",
    art: "voucher",
    hue: 300,
    daysAgo: 2,
    at: "18:40",
    title: { ka: "სასაჩუქრე ვაუჩერები უკვე სტუდიაშია", en: "Gift vouchers have arrived" },
    body: {
      ka: `ხშირად გვეკითხებით, შეიძლება თუ არა ტატუს ან პირსინგის ჩუქება. ახლა შეიძლება: სტუდიაში სასაჩუქრე ვაუჩერები გაჩნდა.

ვაუჩერი გამოიყენება ნებისმიერ მომსახურებაზე და ნებისმიერ არტისტთან. თანხას თვითონ ირჩევ, ხოლო ვადა გაცემიდან ექვსი თვეა.

მისაღებად შეგიძლია მოგვწერო ან სტუდიაში შემოგვიარო. თუ საჩუქარი სიურპრიზია, გვითხარი — ჯავშანს მის მფლობელთან პირდაპირ შევათანხმებთ. (სატესტო ტექსტი)`,
      en: `You often ask whether a tattoo or a piercing can be given as a present. Now it can: gift vouchers have arrived at the studio.

A voucher is good for any service with any artist. You choose the amount, and it is valid for six months from the day it is issued.

To get one, write to us or drop by the studio. If the present is a surprise, tell us, and we will arrange the appointment with its owner directly. (Demo text)`,
    },
  },
  {
    topic: "piercing",
    art: "helix",
    hue: 28,
    daysAgo: 5,
    at: "12:15",
    title: { ka: "ჰელიქსის პირსინგი: შეხორცება კვირა-კვირა", en: "Helix piercing: healing week by week" },
    body: {
      ka: `ჰელიქსი ყურის ზედა ხრტილის პირსინგია. ლამაზია, მაგრამ მომთმენია: ხრტილი ბიბილოზე ბევრად ნელა ხორცდება.

პირველი ორი კვირა. მცირე შეშუპება და სიწითლე ნორმალურია. დღეში ორჯერ ჩამოიბანე ფიზიოლოგიური ხსნარით და ხელით ნუ ატრიალებ.

პირველი სამი თვე. გარედან თითქოს ყველაფერი კარგადაა, შიგნით კი არხი ჯერ კიდევ ყალიბდება. ამ მხარეს ნუ დაიძინებ და ყურსასმენი ფრთხილად გაიკეთე.

სამიდან ექვს თვემდე. სრული შეხორცების შემდეგ სამკაულის შეცვლა შეიძლება. პირველად სჯობს სტუდიაში შეცვალო — სწორ ზომას ერთად შევარჩევთ. (სატესტო ტექსტი)`,
      en: `A helix is a piercing through the upper cartilage of the ear. It looks great, but it asks for patience: cartilage heals far more slowly than a lobe.

The first two weeks. A little swelling and redness is normal. Rinse it twice a day with saline and do not turn the jewellery.

The first three months. It looks settled from the outside while the channel is still forming inside. Do not sleep on that side, and be careful with headphones.

Three to six months. Once it has healed fully, the jewellery can be changed. Have the first change done at the studio, where we can pick the right size together. (Demo text)`,
    },
  },
  {
    topic: "styles",
    art: "styles",
    hue: 265,
    daysAgo: 9,
    at: "16:05",
    title: { ka: "წვრილი ხაზი თუ ბლექვორკი: როგორ ავირჩიოთ", en: "Fine line or blackwork: how to choose" },
    body: {
      ka: `ორი სტილი, ორი სრულიად განსხვავებული ხასიათი. ერთი ჩურჩულებს, მეორე ხმამაღლა ლაპარაკობს.

წვრილი ხაზი მსუბუქი და დახვეწილია: პატარა სიმბოლოები, ყვავილები, წარწერები. კარგად ზის მაჯაზე, ლავიწზე, ნეკნებზე. გაითვალისწინე, რომ ძალიან წვრილი დეტალები წლებთან ერთად ოდნავ რბილდება.

ბლექვორკი მკვრივ შავს და მკვეთრ კონტრასტს ნიშნავს: ორნამენტები, გეომეტრია, დიდი ფორმები. დროს კარგად უძლებს და შორიდანაც იკითხება.

რომელი ავირჩიოთ? იფიქრე, სად იქნება ტატუ, რა ზომის და რამდენად შესამჩნევი გინდა იყოს. კონსულტაციაზე ესკიზს ორივე სტილში გაჩვენებთ. (სატესტო ტექსტი)`,
      en: `Two styles, two very different tempers. One whispers, the other speaks up.

Fine line is light and delicate: small symbols, flowers, lettering. It sits well on a wrist, a collarbone, the ribs. Bear in mind that very thin details soften a little over the years.

Blackwork means dense black and strong contrast: ornament, geometry, large shapes. It ages well and reads from across a room.

Which one? Think about where the tattoo will sit, how large it is, and how noticeable you want it to be. At the consultation we can show you a sketch in both. (Demo text)`,
    },
  },
  {
    topic: "care",
    art: "first",
    hue: 205,
    daysAgo: 14,
    at: "11:30",
    title: { ka: "რა გავაკეთოთ პირველი ტატუს წინ", en: "Before your first tattoo" },
    body: {
      ka: `პირველი სეანსის წინ ნერვიულობა ბუნებრივია. რამდენიმე მარტივი რამ დღეს ბევრად გაგიადვილებს.

წინა დღეს. კარგად გამოიძინე და ალკოჰოლს მოერიდე — ის სისხლს ათხელებს და მუშაობას ართულებს.

სეანსის დღეს. ჭამე ნორმალურად და წყალი თან წამოიღე. ჩაიცვი ისეთი ტანსაცმელი, რომელიც ტატუს ადგილს თავისუფლად ხსნის და რომლის დასვრაც არ გენანება.

სტუდიაში. თუ შესვენება გჭირდება, თქვი — ეს ჩვეულებრივი ამბავია. ესკიზს სეანსის დაწყებამდე ერთად გადავხედავთ და, თუ რამე არ მოგწონს, იმ წუთშივე შევცვლით. (სატესტო ტექსტი)`,
      en: `Being nervous before a first session is natural. A few simple things will make the day much easier.

The day before. Sleep well and skip the alcohol: it thins the blood and makes the work harder.

On the day. Eat properly and bring water. Wear something that leaves the spot free and that you would not mind getting ink on.

At the studio. If you need a break, say so. It is perfectly ordinary. We go over the sketch together before we start, and anything you do not like is changed there and then. (Demo text)`,
    },
  },
  {
    topic: "news",
    art: "hours",
    hue: 150,
    daysAgo: 21,
    at: "10:00",
    title: { ka: "ზაფხულის სამუშაო საათები", en: "Summer opening hours" },
    body: {
      ka: `ზაფხულში სტუდია ახალი განრიგით მუშაობს, რომ სიცხის საათებს ავარიდოთ თავი.

ორშაბათიდან შაბათამდე გელოდებით 12:00-დან 21:00-მდე. კვირა დღე კონსულტაციებისთვის არის გამოყოფილი და მხოლოდ წინასწარი ჩაწერით ვმუშაობთ.

ჯავშნისთვის მოგვწერე WhatsApp-ზე ან გამოიყენე ფორმა მთავარ გვერდზე. (სატესტო ტექსტი)`,
      en: `For the summer the studio keeps new hours, to stay clear of the hottest part of the day.

Monday to Saturday we are open from 12:00 to 21:00. Sunday is kept for consultations, by appointment only.

To book, write to us on WhatsApp or use the form on the home page. (Demo text)`,
    },
  },
];

/* ---------- the pictures ---------- */

/** One drawing per article, wide enough for a landscape picture. */
const ART = {
  // a drop falling on a leafy sprig
  care: () =>
    `<path d="M0 250C-30 110 40 -40 0 -200"/>
     ${[-150, -60, 30, 120].map((y, i) => `<path d="M0 0C34 -30 92 -30 126 0C92 30 34 30 0 0Z" fill="${ROSE}" fill-opacity="0.28" transform="translate(${i % 2 ? 6 : -6} ${y}) rotate(${i % 2 ? -30 : 210})"/>`).join("")}
     <path d="M250 -230C210 -150 190 -110 190 -70A60 60 0 0 0 310 -70C310 -110 290 -150 250 -230Z" stroke="${GOLD}"/>
     ${star(-250, -170, 20)}${star(-300, 60, 12, CREAM)}`,
  // a gift card with a ribbon
  voucher: () =>
    `<g transform="rotate(-8)">
       <rect x="-250" y="-150" width="500" height="300" rx="26" fill="${ROSE}" fill-opacity="0.16"/>
       <path d="M-90 -150L-90 150" stroke="${GOLD}"/><path d="M-250 -20L250 -20" stroke="${GOLD}"/>
       <path d="M-90 -20C-170 -110 -200 -30 -90 -20C20 -30 -10 -110 -90 -20Z" stroke="${GOLD}"/>
       ${star(120, 70, 34)}
     </g>${star(300, -210, 16, CREAM)}`,
  // an ear with two rings in the upper cartilage
  helix: () =>
    `${EAR}<circle cx="-146" cy="-92" r="26" stroke="${GOLD}" stroke-width="9"/><circle cx="-128" cy="-150" r="20" stroke="${GOLD}" stroke-width="9"/>
     ${star(230, -180, 18)}${star(280, 40, 11, CREAM)}`,
  // a thin crescent beside a solid sun
  styles: () =>
    `<g transform="translate(-190 0)" stroke-width="3"><path d="M30 -150A150 150 0 1 0 30 150A118 118 0 1 1 30 -150Z"/>${star(60, -30, 16)}</g>
     <path d="M0 -230L0 230" stroke-dasharray="3 20"/>
     <g transform="translate(200 0)"><g fill="${CREAM}" stroke="none">${Array.from({ length: 12 }, (_, i) => `<path d="M-13 -96L0 ${i % 2 ? -176 : -140}L13 -96Z" transform="rotate(${i * 30})"/>`).join("")}<circle r="86"/></g><circle r="58" fill="#0b0809" stroke="none"/><circle r="32" fill="${CREAM}" stroke="none"/></g>`,
  // a first small mark: one star inside a dotted ring, with a few sparks
  first: () =>
    `<circle r="200" stroke-dasharray="4 18"/><circle r="130" stroke-width="3"/>
     ${star(0, 0, 78)}${star(-290, -150, 18, CREAM)}${star(300, 120, 22)}${star(250, -200, 12, CREAM)}
     <path d="M-330 240C-160 200 160 200 330 240" stroke="${ROSE}"/>`,
  // a clock
  hours: () =>
    `<circle r="210"/><circle r="236" stroke="${GOLD}" stroke-width="2" stroke-dasharray="4 16"/>
     ${Array.from({ length: 12 }, (_, i) => `<path d="M0 -190L0 ${i % 3 ? -176 : -160}" transform="rotate(${i * 30})"/>`).join("")}
     <path d="M0 0L0 -130" stroke-width="7"/><path d="M0 0L92 54" stroke="${GOLD}" stroke-width="7"/>
     <circle r="12" fill="${CREAM}" stroke="none"/>`,
};

/** `daysAgo` days back at `at`, or this very moment for the newest one. */
function dated(daysAgo, at) {
  const date = new Date();
  if (at) {
    const [hours, minutes] = at.split(":").map(Number);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(hours, minutes, 0, 0);
  }
  return date;
}

/* ---------- adding it ---------- */

await connectDB(env.mongoUri);
const added = { topics: 0, posts: 0 };

const topics = new Map();
for (const [key, name] of Object.entries(TOPICS)) {
  let topic = await BlogTopic.findOne({ "name.en": name.en });
  if (!topic) {
    topic = await BlogTopic.create({ name });
    added.topics += 1;
  }
  topics.set(key, topic);
}

// oldest first, so the newest is also the last one written
for (const post of [...POSTS].reverse()) {
  if (await BlogPost.exists({ "title.en": post.title.en })) {
    console.log(`[seed] "${post.title.en}" is already there, left as is`);
    continue;
  }
  await BlogPost.create({
    title: post.title,
    slug: await uniqueSlug(post.title.en, (slug) => BlogPost.exists({ slug }), "article"),
    topic: topics.get(post.topic)._id,
    body: post.body,
    image: await saveImage(picture(1600, 1000, post.hue, ART[post.art]())),
    createdAt: dated(post.daysAgo, post.at),
  });
  added.posts += 1;
}

console.log(`[seed] added ${added.posts} blog articles and ${added.topics} blog topics`);
await disconnectDB();
