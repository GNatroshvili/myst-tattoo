import "dotenv/config";
import path from "node:path";
import readline from "node:readline";
import { env } from "../config/env.js";
import { PHOTOS_MAX as COURSE_PHOTOS_MAX } from "../models/Course.js";
import { readDiskFile } from "../utils/storage.js";

/**
 * Sends the photos kept in this machine's uploads folder to a running site,
 * through its admin API: `npm run photos:to-site -- https://your-site`.
 *
 * For a site whose records point at photos that only exist here (they were
 * added from this machine while it was connected to the site's database).
 * Each such photo is uploaded again as its record's photo, so the site stores
 * it wherever it stores photos (on Vercel: Blob). No storage token is needed,
 * only the site's admin password, which is asked for and not saved.
 *
 * Safe to run again: records whose photo the site already has are skipped.
 * Nothing is deleted on this machine.
 */
const site = (process.argv[2] ?? "").replace(/\/+$/, "");
if (!/^https?:\/\//.test(site)) {
  console.error("Usage: npm run photos:to-site -- https://your-site.example");
  process.exit(1);
}

/** Asks a question in the terminal without showing what is typed. */
function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    // after the question itself is printed, echo nothing more
    rl._writeToOutput = () => {};
  });
}

let cookie = "";
async function call(method, route, body) {
  const init = { method, headers: { cookie } };
  if (body instanceof FormData) init.body = body;
  else if (body) {
    init.headers["content-type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  const res = await fetch(`${site}/api${route}`, init);
  const set = res.headers.get("set-cookie");
  if (set) cookie = set.split(";")[0];
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`${method} ${route}: ${res.status} ${data?.message ?? res.statusText}`);
  return data;
}

const password = process.env.SITE_ADMIN_PASSWORD ?? (await askHidden(`Admin password for ${site}: `));
try {
  await call("POST", "/auth/login", { password });
} catch (err) {
  console.error(`[photos] could not sign in to ${site}: ${err.message}`);
  process.exit(1);
}

// a photo the site cannot serve is one still addressed in an uploads folder
const local = (image) => Boolean(image) && image.full.startsWith("/uploads/");
const kinds = [
  ["artists", (artist) => artist.photo],
  ["tattoos", (tattoo) => tattoo.image],
  ["piercings", (piercing) => piercing.image],
  ["blog/posts", (post) => post.image],
  ["about/sections", (section) => section.image],
];
/** Every record of a kind; none on a site from before that kind existed. */
const listOf = (kind) =>
  call("GET", `/${kind}`).catch((err) => (/ 404 /.test(err.message) ? [] : Promise.reject(err)));

let sent = 0;
let missing = 0;
for (const [kind, photoOf] of kinds) {
  for (const record of await listOf(kind)) {
    const image = photoOf(record);
    if (!local(image)) continue;

    const name = path.basename(image.full);
    let file;
    try {
      file = await readDiskFile(name);
    } catch {
      console.warn(`[photos] ${kind} ${record.id}: ${name} is not in ${env.uploadDir}, skipped`);
      missing += 1;
      continue;
    }
    const body = new FormData();
    body.set("photo", new Blob([file], { type: "image/webp" }), name);
    await call("PATCH", `/${kind}/${record.id}`, body);
    sent += 1;
    process.stdout.write(`\r[photos] sent ${sent}`);
  }
}

// The course keeps a list of photos, and a photo in it cannot be replaced in
// place: the photo is added again (the site stores that copy) and then takes
// the old one's place in the order, which drops the old one.
/** The course as the site has it; null while none is posted, or on a site from before there were courses. */
const readCourse = () =>
  call("GET", "/course").catch((err) => (/ 404 /.test(err.message) ? null : Promise.reject(err)));
/** Sets which of the course's photos stay, and in what order. */
const keepPhotos = (course, ids) => call("PUT", "/course", { title: course.title, body: course.body, photos: ids });

let course = await readCourse();
for (const old of course?.photos ?? []) {
  if (!local(old)) continue;

  const name = path.basename(old.full);
  let file;
  try {
    file = await readDiskFile(name);
  } catch {
    console.warn(`[photos] course photo ${old.id}: ${name} is not in ${env.uploadDir}, skipped`);
    missing += 1;
    continue;
  }
  const before = course.photos.map((photo) => photo.id);
  // a full course has no room for the copy until the old one is out
  if (before.length >= COURSE_PHOTOS_MAX) {
    course = await keepPhotos(course, before.filter((id) => id !== old.id));
  }
  const body = new FormData();
  body.set("photo", new Blob([file], { type: "image/webp" }), name);
  const added = (await call("POST", "/course/photos", body)).photos.at(-1);
  course = await keepPhotos(course, before.map((id) => (id === old.id ? added.id : id)));
  sent += 1;
  process.stdout.write(`\r[photos] sent ${sent}`);
}
if (sent > 0) process.stdout.write("\n");

// what the site says now
let left = ((await readCourse())?.photos ?? []).filter(local).length;
for (const [kind, photoOf] of kinds) {
  left += (await listOf(kind)).filter((record) => local(photoOf(record))).length;
}
console.log(
  `[photos] sent ${sent} photo(s) to ${site}` +
    (missing ? `, ${missing} had no file here` : "") +
    (left ? `; ${left} record(s) still point at an uploads folder` : "; every photo is now stored by the site")
);
await call("POST", "/auth/logout").catch(() => {});
