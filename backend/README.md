# Myst Tattoo - Backend

Express + MongoDB (Mongoose) API. It keeps the studio's artists, tattoos,
tattoo styles, the piercing price list and piercing photos, the blog, the
course, the sections of the "About us" page, the home page's frequently asked questions and the
privacy policy's text, stores the
uploaded photos, and guards changes behind the admin sign-in. The site (`../frontend`) reads from it and hosts the admin panel at
`/admin`.

## Setup

```bash
cp .env.example .env   # then fill in ADMIN_PASSWORD and SESSION_SECRET
npm install
npm run seed           # optional, once: adds five starting tattoo styles
npm run seed:demo      # optional: demo artists, tattoos, piercings, blog articles, a course and the about page
npm run dev            # http://localhost:5000
```

MongoDB must be running (`MONGODB_URI`, local by default).

`npm run seed:demo` fills an empty site for trying things out: three tattoo
artists with five tattoos each, one piercer with five piercings, and a
piercing price list, and then six blog articles under four topics
(`npm run seed:demo:blog` adds only those), then a tattoo course with four photos
(`npm run seed:demo:course` adds only that), and last three sections of the "About us" page
(`npm run seed:demo:about` adds only those), all with their texts in both languages. The pictures are drawn by the script and
marked "DEMO". The records are ordinary ones, so they are edited and deleted in
the admin panel like any others; running the script again adds nothing twice.

### Environment

| Variable | What it is |
| --- | --- |
| `PORT` | Port to listen on (5000) |
| `MONGODB_URI` | MongoDB connection string |
| `CLIENT_ORIGIN` | Site origin(s) allowed by CORS, comma-separated |
| `ADMIN_PASSWORD` | The one password that opens `/admin`. Sign-in is off while it is empty |
| `SESSION_SECRET` | Long random string that signs the admin session cookie |
| `UPLOAD_DIR` | Folder for uploaded photos (`uploads`) |
| `BLOB_READ_WRITE_TOKEN` | A Vercel Blob store's token. When set, photos go to Blob instead of the folder |

## How it fits together

- The browser never calls this server directly: the site forwards `/api/*` and
  `/uploads/*` to it, so the admin cookie belongs to the site's own address.
- Signing in (`POST /api/auth/login`) sets an http-only cookie that lasts a
  week. Eight wrong passwords from one address lock sign-in for 15 minutes.
- Reading is public. Every route that changes data needs the admin cookie.
- A photo is stored as two WebP files: the photo (at most 1600px) and a small
  copy for galleries (at most 640px). They go to `UPLOAD_DIR` and are served
  under `/uploads`; back this folder up together with the database. With a
  Vercel Blob store configured they go there instead (`src/utils/storage.js`).
- The database is connected on the first request and shared after that, so
  the app also runs as a function with no start-up of its own.

## Deploying

The backend runs on Vercel as a function, with MongoDB Atlas and Vercel Blob in
place of the local database and the uploads folder. See
[../DEPLOY.md](../DEPLOY.md) for the steps, and for `npm run db:copy` and
`npm run photos:to-blob`, which move existing data there.

## Languages

The site has two languages, `ka` and `en`, and every record serves both: an
artist, a tattoo, a piercing zone or a piercing photo is added once.

- What a visitor reads is kept in both languages as `{ en, ka }`: an artist's
  `nickname` and `bio`, a style's `name`, and the `name` and `note` of piercing
  zones and places. The site shows the page's language, and the other one
  where a text was left empty.
- Nicknames and names are needed in both languages; bios and notes are optional.
- Everything else is shared: photos, styles, prices, who did what, and an
  artist's `slug`, so a profile has the same address on both sites
  (`/ka/artists/nika`, `/en/artists/nika`).

Records saved by earlier versions are brought up to date when the server
starts (`src/utils/upgrade.js`). One of those versions kept a separate record
per language; such records lose their language, and two artists that shared a
profile address are joined into one.

## Piercing

The piercing page has a price list and a gallery:

- A **zone** is a part of the body ("Ear", "Face"). Inside it are **places**
  ("Eyebrow", "Nose", "Lip"), each with a price and an optional note.
- A **piercing** is a photo of work done at the studio. It sits in a place
  (which gives its zone) and can be attached to an artist.
- There is no separate kind of artist for piercing: a piercer is an artist
  with piercings attached, listed with everyone else. An artist's record
  carries `piercingCount`, and their profile their `piercings`.
- A place that photos use cannot be deleted, nor can a zone with such a place;
  an unused zone is deleted together with its places.

## Endpoints

| Method | Path | Admin | What it does |
| --- | --- | --- | --- |
| GET | `/api/health` | | Service and database status |
| POST | `/api/auth/login` | | `{ password }` → starts the admin session |
| POST | `/api/auth/logout` | | Ends it |
| GET | `/api/auth/me` | | `{ admin: true \| false }` |
| GET | `/api/styles` | | All styles |
| POST | `/api/styles` | yes | `{ name: { en, ka } }` |
| PATCH | `/api/styles/:id` | yes | Rename |
| DELETE | `/api/styles/:id` | yes | Refused (409) while tattoos use the style |
| GET | `/api/artists` | | All artists, each with `tattooCount` and `piercingCount` |
| GET | `/api/artists/:key` | | One artist by id or slug, with their `tattoos` and `piercings` |
| POST | `/api/artists` | yes | Form: `nicknameKa`, `nicknameEn`, `bioKa`, `bioEn`, `styles`, `instagramUrl`, `photo`, `tattoos`, `piercings` |
| PATCH | `/api/artists/:key` | yes | Same fields, only those sent change; `removePhoto=true` drops the photo |
| DELETE | `/api/artists/:key` | yes | Their tattoos and piercings stay, attached to nobody |
| GET | `/api/tattoos` | | All tattoos, newest first; `?featured=1` only those picked for the home page; `?limit=4` |
| POST | `/api/tattoos` | yes | Form: `photo`, `style`, `artist` (optional), `featured` (optional, `true`/`false`) |
| PATCH | `/api/tattoos/:id` | yes | `style`, `artist` ("" detaches), `featured`, `photo` |
| DELETE | `/api/tattoos/:id` | yes | Also deletes the photo files |
| GET | `/api/piercing/zones` | | All zones, each with its `places` (name, note, price) |
| POST | `/api/piercing/zones` | yes | `{ name: { en, ka } }` |
| PATCH | `/api/piercing/zones/:id` | yes | `{ name: { en, ka } }` |
| DELETE | `/api/piercing/zones/:id` | yes | With its places; refused (409) while photos use them |
| POST | `/api/piercing/zones/:id/places` | yes | `{ name: { en, ka }, note: { en, ka }, price }` → the zone with its places |
| PATCH | `/api/piercing/places/:id` | yes | Any of `name`, `note`, `price` |
| DELETE | `/api/piercing/places/:id` | yes | Refused (409) while photos use the place |
| GET | `/api/blog/topics` | | Blog topics in the order they were added, each with `postCount` |
| POST | `/api/blog/topics` | yes | JSON: `name: { ka, en }` |
| PATCH | `/api/blog/topics/:id` | yes | JSON: `name: { ka, en }` |
| DELETE | `/api/blog/topics/:id` | yes | Refused (409) while articles use the topic |
| GET | `/api/blog/posts` | | All articles, newest first |
| GET | `/api/blog/posts/:key` | | One article by id or slug |
| POST | `/api/blog/posts` | yes | Form: `titleKa`, `titleEn`, `bodyKa`, `bodyEn` (at least one), `topic`, `photo`. `createdAt` is the date the site shows |
| PATCH | `/api/blog/posts/:key` | yes | Any of the same fields; the address and the date stay as they are |
| DELETE | `/api/blog/posts/:key` | yes | Also deletes the image files |
| GET | `/api/course` | | The tattoo course (title, text, photos, `createdAt`); 404 while none is posted |
| PUT | `/api/course` | yes | JSON: `title: { ka, en }`, `body: { ka, en }` (at least one), optional `photos`: ids of the photos to keep, in order. Posts the course or changes it; the date stays |
| POST | `/api/course/photos` | yes | Form: `photo`. Adds one photo (four at most) to the end |
| DELETE | `/api/course` | yes | Takes the course off the site and deletes its photo files |
| GET | `/api/faqs` | | The home page's frequently asked questions, in the order the site shows them |
| POST | `/api/faqs` | yes | JSON: `question: { ka, en }`, `answer: { ka, en }` (at least one). Goes to the end of the list |
| PATCH | `/api/faqs/:id` | yes | The same fields |
| PUT | `/api/faqs/order` | yes | JSON: `ids`: every question's id once, first to last. Refused (400) if one is missing |
| DELETE | `/api/faqs/:id` | yes | |
| GET | `/api/about/sections` | | The /about page's sections (photo, title, text), in the order the page shows them |
| POST | `/api/about/sections` | yes | Form: `photo`, `titleKa`, `titleEn` (both optional), `bodyKa`, `bodyEn` (at least one). Goes to the end of the page |
| PATCH | `/api/about/sections/:id` | yes | Any of the same fields; a new `photo` replaces the old one |
| PUT | `/api/about/sections/order` | yes | JSON: `ids`: every section's id once, first to last. Refused (400) if one is missing |
| DELETE | `/api/about/sections/:id` | yes | Also deletes the photo files |
| GET | `/api/privacy` | | The privacy policy's text as saved in the admin panel (`body`, `updatedAt`); 404 while none is saved, and the site then shows its standard text |
| PUT | `/api/privacy` | yes | JSON: `body: { ka, en }` (at least one). An empty line separates paragraphs; a line that begins with `#` is a heading |
| DELETE | `/api/privacy` | yes | Drops the saved text: the page goes back to the standard one |
| GET | `/api/piercings` | | All piercing photos, newest first; `?limit=4` |
| POST | `/api/piercings` | yes | Form: `photo`, `place`, `artist` (optional) |
| PATCH | `/api/piercings/:id` | yes | `place`, `artist` ("" detaches), `photo` |
| DELETE | `/api/piercings/:id` | yes | Also deletes the photo files |

`styles`, `tattoos` and `piercings` are lists of ids, sent as a JSON array in one
form field. `tattoos` and `piercings` set exactly which works belong to the artist. Errors come back as
`{ message, code }`.

## Structure

```
src/
  server.js          # entry: starts HTTP server, connects to MongoDB
  app.js             # express app, middleware, route mounting
  config/            # environment values, mongoose connection
  routes/index.js    # every route and who may call it
  controllers/       # request handlers: auth, styles, artists, tattoos, piercing zones, piercings, blog topics, blog posts, the course, the about page's sections, the FAQ, the privacy policy
  models/            # mongoose schemas: Style, Artist, Tattoo, PiercingZone, PiercingPlace, Piercing, BlogTopic, BlogPost, Course, AboutSection, Faq, Privacy
  middleware/        # admin session (auth.js), photo upload (upload.js)
  utils/             # photo storage, slugs, input checks, API output, upgrading older records
  scripts/           # starting styles, demo data, moving data to Atlas and Blob
uploads/             # uploaded photos (not in git)
```
