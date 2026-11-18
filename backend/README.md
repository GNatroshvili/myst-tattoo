# Myst Tattoo - Backend

Express + MongoDB (Mongoose) API. It keeps the studio's artists, tattoos and
tattoo styles, stores the uploaded photos, and guards changes behind the admin
sign-in. The site (`../frontend`) reads from it and hosts the admin panel at
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
| GET | `/api/artists` | | All artists, each with `tattooCount` |
| GET | `/api/artists/:key` | | One artist by id or slug, with their `tattoos` |
| POST | `/api/artists` | yes | Form: `nickname`, `styles`, `bioEn`, `bioKa`, `instagramUrl`, `photo`, `tattoos` |
| PATCH | `/api/artists/:key` | yes | Same fields, only those sent change; `removePhoto=true` drops the photo |
| DELETE | `/api/artists/:key` | yes | Their tattoos stay, attached to nobody |
| GET | `/api/tattoos` | | All tattoos, newest first; `?limit=4` |
| POST | `/api/tattoos` | yes | Form: `photo`, `style`, `artist` (optional) |
| PATCH | `/api/tattoos/:id` | yes | `style`, `artist` ("" detaches), `photo` |
| DELETE | `/api/tattoos/:id` | yes | Also deletes the photo files |

`styles` and `tattoos` are lists of ids, sent as a JSON array in one form field.
`tattoos` sets exactly which tattoos belong to the artist. Errors come back as
`{ message, code }`.

## Structure

```
src/
  server.js          # entry: starts HTTP server, connects to MongoDB
  app.js             # express app, middleware, route mounting
  config/            # environment values, mongoose connection
  routes/index.js    # every route and who may call it
  controllers/       # request handlers: auth, styles, artists, tattoos
  models/            # mongoose schemas: Style, Artist, Tattoo
  middleware/        # admin session (auth.js), photo upload (upload.js)
  utils/             # photo storage, slugs, input checks, API output
  scripts/seed.js    # starting styles
uploads/             # uploaded photos (not in git)
```
