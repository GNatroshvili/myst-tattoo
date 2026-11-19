# Deploying to Vercel

The site runs on Vercel as **two projects from this one repository**: the
backend (`backend/`, an Express app that Vercel runs as a function) and the
site (`frontend/`, Next.js). Two things a server normally keeps on its own disk
live elsewhere, because a Vercel function has no lasting disk:

| What | Where |
| --- | --- |
| The database | MongoDB Atlas |
| Uploaded photos | Vercel Blob |

Nothing changes for local development: with no Blob store configured, photos
still go to `backend/uploads/` and the database is the local MongoDB.

## 1. Database: MongoDB Atlas

1. Create a cluster at <https://www.mongodb.com/atlas> (the free tier is enough),
   in a region close to your visitors (for Georgia, Frankfurt).
2. **Database Access**: add a user with a password.
3. **Network Access**: allow access from anywhere (`0.0.0.0/0`). Vercel's
   functions have no fixed address, so a narrower list would lock them out.
4. **Connect → Drivers**: copy the connection string and put the database name
   before the `?`:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/myst-tattoo?...`

## 2. Backend project

1. In Vercel: **Add New → Project**, import this repository, and set
   **Root Directory** to `backend`. Vercel detects Express; no other build
   settings are needed.
2. **Environment Variables**:

   | Name | Value |
   | --- | --- |
   | `MONGODB_URI` | The Atlas connection string from step 1 |
   | `ADMIN_PASSWORD` | The password for `/admin`: long and hard to guess |
   | `SESSION_SECRET` | A long random string (see `backend/.env.example`) |
   | `CLIENT_ORIGIN` | The site's address, once you know it (step 4) |

3. **Storage → Create → Blob**: create a store with **public** access, in the
   same region as the database. Neither can be changed later. Then, on the
   store's **Projects** tab, **Connect to Project** and choose this project.
   Vercel adds the store's id (`BLOB_STORE_ID`) to the project, which is all
   the backend needs there. Also tick **Add a read-write token env var to this
   connection** if you plan to move existing photos from your machine (step 5):
   that script needs `BLOB_READ_WRITE_TOKEN`.
4. In **Settings → Functions**, set the region to the one nearest the
   database (Frankfurt is `fra1`).
5. Deploy, then open `https://<backend>.vercel.app/api/health`. It should say
   `"db":"connected"` and `"photos":"blob"`. If the database cannot be reached
   it says `"db":"unreachable"` with the reason in `dbProblem`: a wrong user
   name or password, an address that is not valid, or no answer (Network
   Access).

## 3. Site project

1. **Add New → Project** again, the same repository, **Root Directory**
   `frontend`.
2. **Environment Variables**:

   | Name | Value |
   | --- | --- |
   | `API_URL` | The backend's production address, e.g. `https://<backend>.vercel.app` (no trailing slash) |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | The studio's WhatsApp number, digits only |

3. Deploy. The admin panel is at `https://<site>/admin`.

`API_URL` is read when the site is built, so redeploy the site after changing
it. Use the backend's production address: its preview deployments are behind
Vercel's sign-in and the site could not reach them.

## 4. Finish the backend

Set `CLIENT_ORIGIN` on the backend project to the site's address
(`https://<site>`, plus your own domain if you add one, comma-separated) and
redeploy it.

## 5. Data

Run these on your own machine, in `backend/`, with `MONGODB_URI` in `.env`
temporarily set to the Atlas connection string. Put the local value back
afterwards.

**Starting clean** (recommended while the content is still demo data):

```bash
npm run seed        # the five starting tattoo styles
```

Then add the real artists, tattoos and prices in the admin panel.

**Bringing the local data along:**

```bash
npm run db:copy          # copies the local database into the (empty) Atlas one
npm run photos:to-blob   # uploads backend/uploads/ to Blob and updates the records
```

**Photos added from your machine by mistake.** If records were created locally
while `.env` pointed at Atlas (for example with `npm run seed:demo`), their
photos are in `backend/uploads/` and the live site shows none of them. Send
them through the site itself, which stores them in Blob. It asks for the
site's admin password and needs no token:

```bash
npm run photos:to-site -- https://<site>
```

`photos:to-blob` also needs `BLOB_READ_WRITE_TOKEN` in `.env`. It exists only
if you ticked the read-write token option when connecting the store (step 2);
copy its value from the backend project's **Settings → Environment
Variables**. Both scripts are safe to run again, and neither deletes anything
locally.

## Good to know

- **Photo size.** Vercel refuses requests over 4.5 MB. The admin panel shrinks
  large photos in the browser before sending them, so this is not something to
  think about when uploading.
- **Plan.** Vercel's Hobby plan is for personal, non-commercial use; a
  studio's site needs Pro. Check the current terms and prices.
- **Sign-in attempts** are counted in the database, so the limit (eight wrong
  passwords, then a 15-minute wait) holds across the function's copies.
- **Cold starts.** After a quiet spell the first request takes a moment
  longer while the function starts and connects to the database.
- **Another host.** The backend still runs as an ordinary server
  (`npm start`) on any host with a disk; leave the Blob store out and photos
  stay in `uploads/`.
