import "dotenv/config";
import path from "node:path";
import readline from "node:readline";
import { env } from "../config/env.js";
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
];

let sent = 0;
let missing = 0;
for (const [kind, photoOf] of kinds) {
  for (const record of await call("GET", `/${kind}`)) {
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
if (sent > 0) process.stdout.write("\n");

// what the site says now
let left = 0;
for (const [kind, photoOf] of kinds) {
  left += (await call("GET", `/${kind}`)).filter((record) => local(photoOf(record))).length;
}
console.log(
  `[photos] sent ${sent} photo(s) to ${site}` +
    (missing ? `, ${missing} had no file here` : "") +
    (left ? `; ${left} record(s) still point at an uploads folder` : "; every photo is now stored by the site")
);
await call("POST", "/auth/logout").catch(() => {});
