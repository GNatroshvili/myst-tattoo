# Myst Tattoo - Backend

Express + MongoDB (Mongoose) API. It keeps the studio's artists, tattoos,
tattoo styles, the piercing price list and piercing photos, stores the
uploaded photos, and guards changes behind the admin sign-in. The site (`../frontend`) reads from it and hosts the admin panel at
`/admin`.

## Setup

```bash
cp .env.example .env   # then fill in ADMIN_PASSWORD and SESSION_SECRET
npm install
npm run seed           # optional, once: adds five starting tattoo styles
npm run dev            # http://localhost:5000
```

MongoDB must be running (`MONGODB_URI`, local by default).

### Environment

| Variable | What it is |
| --- | --- |
| `PORT` | Port to listen on (5000) |
| `MONGODB_URI` | MongoDB connection string |
| `CLIENT_ORIGIN` | Site origin(s) allowed by CORS, comma-separated |
| `ADMIN_PASSWORD` | The one password that opens `/admin`. Sign-in is off while it is empty |
| `SESSION_SECRET` | Long random string that signs the admin session cookie |
| `UPLOAD_DIR` | Folder for uploaded photos (`uploads`) |

## How it fits together

- The browser never calls this server directly: the site forwards `/api/*` and
  `/uploads/*` to it, so the admin cookie belongs to the site's own address.
- Signing in (`POST /api/auth/login`) sets an http-only cookie that lasts a
  week. Eight wrong passwords from one address lock sign-in for 15 minutes.
- Reading is public. Every route that changes data needs the admin cookie.
- A photo is stored as two WebP files in `UPLOAD_DIR`: the photo (at most
  1600px) and a small copy for galleries (at most 640px). They are served
  under `/uploads`. Back this folder up together with the database.

## Languages

The site has two languages, `ka` and `en`, and every artist, tattoo, piercing
zone and piercing photo belongs to exactly one of them:

- The admin picks the language first when adding an artist, a tattoo, a
  piercing zone or a piercing photo. It is sent as `lang` and cannot be
  changed afterwards.
- A record shows only on its language's site: `/ka` reads with `?lang=ka`,
  `/en` with `?lang=en`. To show on both, it is added once per language.
- A tattoo or a piercing can only be attached to an artist of its own language.
- An artist's `slug` is unique within its language, so the Georgian and the
  English profile of one person can share an address (`/ka/artists/nino`,
  `/en/artists/nino`).
- Styles are shared: one style carries its name in both languages.

Records saved before languages existed are brought up to date when the server
starts (`src/utils/upgrade.js`): they become Georgian.

## Piercing

The piercing page has a price list and a gallery:

- A **zone** is a part of the body ("Ear", "Face"). Inside it are **places**
  ("Eyebrow", "Nose", "Lip"), each with a price and an optional note. A place
  takes its zone's language.
- A **piercing** is a photo of work done at the studio. It sits in a place
  (which gives its zone and its language) and can be attached to an artist.
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
| GET | `/api/artists` | | All artists, each with `tattooCount` and `piercingCount`; `?lang=ka` for one language's |
| GET | `/api/artists/:key` | | One artist by id or slug, with their `tattoos` and `piercings`; `?lang=ka` looks only in that language |
| POST | `/api/artists` | yes | Form: `lang`, `nickname`, `styles`, `bio`, `instagramUrl`, `photo`, `tattoos`, `piercings` |
| PATCH | `/api/artists/:key` | yes | Same fields except `lang`, only those sent change; `removePhoto=true` drops the photo |
| DELETE | `/api/artists/:key` | yes | Their tattoos and piercings stay, attached to nobody |
| GET | `/api/tattoos` | | All tattoos, newest first; `?lang=ka`, `?limit=4` |
| POST | `/api/tattoos` | yes | Form: `lang`, `photo`, `style`, `artist` (optional) |
| PATCH | `/api/tattoos/:id` | yes | `style`, `artist` ("" detaches), `photo` |
| DELETE | `/api/tattoos/:id` | yes | Also deletes the photo files |
| GET | `/api/piercing/zones` | | All zones, each with its `places` (name, note, price); `?lang=ka` |
| POST | `/api/piercing/zones` | yes | `{ lang, name }` |
| PATCH | `/api/piercing/zones/:id` | yes | `{ name }` |
| DELETE | `/api/piercing/zones/:id` | yes | With its places; refused (409) while photos use them |
| POST | `/api/piercing/zones/:id/places` | yes | `{ name, note, price }` → the zone with its places |
| PATCH | `/api/piercing/places/:id` | yes | Any of `name`, `note`, `price` |
| DELETE | `/api/piercing/places/:id` | yes | Refused (409) while photos use the place |
| GET | `/api/piercings` | | All piercing photos, newest first; `?lang=ka`, `?limit=4` |
| POST | `/api/piercings` | yes | Form: `photo`, `place`, `artist` (optional); the language is the place's |
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
  controllers/       # request handlers: auth, styles, artists, tattoos, piercing zones, piercings
  models/            # mongoose schemas: Style, Artist, Tattoo, PiercingZone, PiercingPlace, Piercing
  middleware/        # admin session (auth.js), photo upload (upload.js)
  utils/             # photo storage, slugs, input checks, API output, upgrading older records
  scripts/seed.js    # starting styles
uploads/             # uploaded photos (not in git)
```
